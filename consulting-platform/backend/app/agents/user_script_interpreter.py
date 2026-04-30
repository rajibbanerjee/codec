"""
User Script Interpreter Agent

Extracts structured business/financial data from plain English text using
rule-based regex and keyword matching.

NOTE: This is intentionally a MOCK / RULE-BASED implementation.
To plug in a real LLM (Claude, GPT-4, etc.) replace the body of
`interpret_user_script()` with an API call to your preferred model,
passing `user_text` as the user message and parsing the JSON response.

Example LLM integration point:
    # import anthropic
    # client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    # message = client.messages.create(
    #     model="claude-opus-4-5",
    #     max_tokens=2048,
    #     messages=[{"role": "user", "content": EXTRACTION_PROMPT.format(text=user_text)}]
    # )
    # return json.loads(message.content[0].text)
"""

import re
from typing import Any, Dict, List, Optional, Tuple

from app.utils.constants import (
    APPROXIMATION_KEYWORDS,
    B2B_KEYWORDS,
    B2C_KEYWORDS,
    CHANNEL_KEYWORDS,
    CURRENCY_SYMBOLS,
    TIME_PERIOD_KEYWORDS,
)


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def _normalise(text: str) -> str:
    """Lowercase and strip extra whitespace."""
    return re.sub(r"\s+", " ", text.lower().strip())


def _detect_currency(text: str) -> str:
    """Detect currency from symbols in text."""
    for symbol, code in CURRENCY_SYMBOLS.items():
        if symbol in text:
            return code
    # Fallback: look for currency codes
    for code in ["INR", "USD", "GBP", "EUR"]:
        if code in text.upper():
            return code
    return "USD"


def _detect_business_type(text: str) -> str:
    """Detect B2B or B2C from keywords."""
    lower = _normalise(text)
    b2b_hits = sum(1 for kw in B2B_KEYWORDS if kw in lower)
    b2c_hits = sum(1 for kw in B2C_KEYWORDS if kw in lower)
    if b2b_hits >= b2c_hits and b2b_hits > 0:
        return "B2B"
    if b2c_hits > b2b_hits:
        return "B2C"
    return "B2B"  # default


def _detect_time_period(text: str) -> str:
    """Detect time period from text."""
    lower = _normalise(text)
    for period, keywords in TIME_PERIOD_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return period.capitalize()
    return "Campaign"


def _is_approximate(context_window: str) -> bool:
    """Check if the value near this word was described approximately."""
    lower = context_window.lower()
    return any(kw in lower for kw in APPROXIMATION_KEYWORDS)


def _extract_number(text: str) -> Optional[float]:
    """
    Extract first numeric value from text.
    Handles:
      - Comma-separated numbers: 1,20,000  →  120000
      - Plain numbers: 500, 3.5
      - Numbers with currency symbols: ₹50,000  →  50000
    """
    # Remove currency symbols
    cleaned = re.sub(r"[₹$£€]", "", text)
    # Remove commas used as thousand separators (handles Indian numbering too)
    cleaned = cleaned.replace(",", "")
    match = re.search(r"[-+]?\d+(?:\.\d+)?", cleaned)
    if match:
        return float(match.group())
    return None


def _get_context_window(text: str, start: int, window: int = 60) -> str:
    """Return a small context window around a position in text."""
    return text[max(0, start - window): min(len(text), start + window)]


# ---------------------------------------------------------------------------
# Channel detection
# ---------------------------------------------------------------------------

def _find_channels_in_text(text: str) -> List[str]:
    """
    Find all channel mentions in text preserving order and de-duplicating.
    Returns canonical channel names.

    Uses word-boundary matching to avoid substring false positives
    (e.g. "google ads" should not also match "google ad").
    The CHANNEL_KEYWORDS list is ordered longest-first so that longer
    multi-word phrases are matched before shorter subsets.
    """
    lower = _normalise(text)
    # Sort keywords longest-first to prefer specific matches ("google ads")
    # over shorter subsets ("google ad")
    sorted_keywords = sorted(CHANNEL_KEYWORDS, key=len, reverse=True)

    # Track character positions already claimed by a longer match
    claimed_positions: set = set()
    found: List[Tuple[int, str]] = []

    for kw in sorted_keywords:
        pos = 0
        while True:
            idx = lower.find(kw, pos)
            if idx == -1:
                break
            end = idx + len(kw)
            # Check word boundaries: character before start and after end
            before_ok = idx == 0 or not lower[idx - 1].isalnum()
            after_ok = end >= len(lower) or not lower[end].isalnum()
            # Check this span isn't already claimed by a longer match
            span_claimed = any(p in claimed_positions for p in range(idx, end))
            if before_ok and after_ok and not span_claimed:
                found.append((idx, kw.title()))
                claimed_positions.update(range(idx, end))
            pos = idx + 1

    if not found:
        return []

    # Sort by position and de-duplicate canonical names
    found.sort(key=lambda x: x[0])
    seen: set = set()
    channels: List[str] = []
    for _, name in found:
        if name not in seen:
            # Skip if a longer variant of this channel is already in the list
            # e.g. don't add "Linkedin" if "Linkedin Ads" already captured
            is_subset = any(
                existing.startswith(name) and existing != name
                for existing in seen
            )
            if not is_subset:
                seen.add(name)
                channels.append(name)

    return channels


# ---------------------------------------------------------------------------
# Per-channel extraction patterns
# ---------------------------------------------------------------------------

# Regex pattern groups used for value extraction

_LEAD_PATTERNS = [
    r"(\d[\d,]*(?:\.\d+)?)\s*(?:leads?|visitors?|inquir(?:y|ies)|prospects?|sign[\-\s]?ups?)",
    r"(?:leads?|visitors?|inquir(?:y|ies)|prospects?)\s*(?:of|:)?\s*(\d[\d,]*(?:\.\d+)?)",
    r"generate\s+(?:around|approximately|about|roughly)?\s*(\d[\d,]*(?:\.\d+)?)\s*(?:leads?|visitors?)",
]

_CONVERSION_PATTERNS = [
    r"(\d+(?:\.\d+)?)\s*%\s*(?:conversion|convert|close\s*rate)",
    r"(?:conversion|convert|close\s*rate)\s*(?:of|:)?\s*(\d+(?:\.\d+)?)\s*%",
    r"(\d+(?:\.\d+)?)\s*percent\s*(?:conversion|convert|close\s*rate)",
]

_PRICE_PATTERNS = [
    # Match price/selling price/fee keywords followed (within same line/clause) by a currency amount
    r"(?:selling\s*price|revenue\s*per|price\s*is|package\s*price|fee\s*is|charge\s*is)[^\d₹$£€\n]{0,30}[₹$£€]?\s*(\d[\d,]*(?:\.\d+)?)",
    r"[₹$£€]\s*(\d[\d,]*(?:\.\d+)?)\s*(?:per|each|p\.?a\.?)?(?:\s+(?:package|service|client|customer|project|month))?",
    r"(\d[\d,]*(?:\.\d+)?)\s*(?:INR|USD|GBP|EUR)\s*(?:per|each)?",
]

_VARIABLE_COST_PATTERNS = [
    r"(?:variable\s*(?:cost|delivery)|delivery\s*cost|cost\s*per\s*(?:client|customer|delivery))[^\d₹$£€]*[₹$£€]?\s*(\d[\d,]*(?:\.\d+)?)",
    r"[₹$£€]\s*(\d[\d,]*(?:\.\d+)?)\s*per\s*(?:client|customer|delivery|unit)",
    r"(\d[\d,]*(?:\.\d+)?)\s*(?:INR|USD|GBP|EUR)\s*per\s*(?:client|customer|delivery|unit)",
]

_MARKETING_SPEND_PATTERNS = [
    r"(?:budget|spend|investment|marketing\s*(?:cost|budget|spend|investment))[^\d₹$£€]*[₹$£€]?\s*(\d[\d,]*(?:\.\d+)?)",
    r"(?:spend|invest)\s+[₹$£€]?\s*(\d[\d,]*(?:\.\d+)?)\s*(?:on|for|in)?",
    r"(?:allocat(?:e|ing)|set(?:ting)?\s*aside)[^\d₹$£€]*[₹$£€]?\s*(\d[\d,]*(?:\.\d+)?)",
]


def _extract_value_from_patterns(sentence: str, patterns: List[str]) -> Optional[float]:
    """Try each pattern against a sentence and return the first numeric match."""
    for pattern in patterns:
        match = re.search(pattern, sentence, re.IGNORECASE)
        if match:
            raw = match.group(1).replace(",", "")
            try:
                return float(raw)
            except ValueError:
                continue
    return None


def _split_into_sentences(text: str) -> List[str]:
    """Split text into sentences using punctuation and newlines."""
    # Split on . ! ? or newline, keeping the delimiter attached
    parts = re.split(r"(?<=[.!?\n])\s*", text)
    return [p.strip() for p in parts if p.strip()]


# ---------------------------------------------------------------------------
# Channel-specific extraction
# ---------------------------------------------------------------------------

def _extract_channel_data(channel_name: str, text: str) -> Dict[str, Any]:
    """
    Extract all financial metrics for a given channel from the full text.

    Strategy:
    1. Find sentences that SPECIFICALLY mention only this channel (not other channels).
    2. For shared values (price, variable cost) fall back to global extraction.
    3. For per-channel metrics (leads, conversion, spend) prefer channel-specific sentences.
    """
    lower_channel = channel_name.lower()
    # The base keyword without "ads"/"ad" suffix for broader matching
    base_keyword = lower_channel.split()[0]  # e.g. "google" from "google ads"
    sentences = _split_into_sentences(text)

    # Find sentences that mention this channel name
    # Exclude sentences that only mention this channel alongside other channel names
    # in an introductory context (heuristic: if sentence is intro/compare sentence, skip lead/conversion)
    direct_sentences: List[str] = []
    intro_sentences: List[str] = []  # sentences that mention multiple channels

    for i, sentence in enumerate(sentences):
        s_lower = sentence.lower()
        # Match if the full channel name OR the base keyword appears
        mentions_this = lower_channel in s_lower or base_keyword in s_lower
        if not mentions_this:
            continue
        # Count how many OTHER channel base words appear in the same sentence
        other_channel_words = ["google", "linkedin", "facebook", "instagram", "youtube", "twitter",
                               "email", "seo", "referral", "affiliate", "webinar"]
        other_hits = sum(1 for w in other_channel_words if w in s_lower and w != base_keyword)

        if other_hits >= 2:
            # Introductory/comparison sentence — less reliable for per-channel metrics
            intro_sentences.append(sentence)
        else:
            # Sentence primarily about this channel
            direct_sentences.append(sentence)

    # For per-channel metrics: use direct sentences only; fall back to all channel sentences
    per_channel_text = " ".join(direct_sentences) if direct_sentences else " ".join(intro_sentences + direct_sentences)
    # For shared metrics: use entire text
    all_channel_text = " ".join(direct_sentences + intro_sentences) if (direct_sentences or intro_sentences) else text

    # For sentences that mention this channel alongside another channel's budget,
    # extract the portion AFTER the channel mention to pick up the right number.
    def _channel_suffix_text(sentences_list: List[str], channel_kw: str, base_kw: str) -> str:
        """Return text appearing after the channel keyword in each sentence."""
        parts = []
        for s in sentences_list:
            lower_s = s.lower()
            idx = lower_s.find(channel_kw)
            if idx == -1:
                idx = lower_s.find(base_kw)
            if idx != -1:
                parts.append(s[idx:])
            else:
                parts.append(s)
        return " ".join(parts)

    # Build suffix text for this channel for spend extraction
    all_sents = direct_sentences + intro_sentences
    channel_suffix = _channel_suffix_text(all_sents, lower_channel, base_keyword)

    leads = _extract_value_from_patterns(per_channel_text, _LEAD_PATTERNS)
    conversion_rate = _extract_value_from_patterns(per_channel_text, _CONVERSION_PATTERNS)
    marketing_spend = _extract_value_from_patterns(channel_suffix or all_channel_text, _MARKETING_SPEND_PATTERNS)

    # Selling price and variable cost are often global (same for all channels)
    # Use full text for these since they rarely appear in channel-specific sentences
    selling_price = _extract_value_from_patterns(text, _PRICE_PATTERNS)
    variable_cost = _extract_value_from_patterns(text, _VARIABLE_COST_PATTERNS)

    search_text = all_channel_text or text

    # Determine confidence: was the value described approximately?
    leads_confidence = "estimated" if leads and _is_approximate(search_text) else ("exact" if leads else "unknown")
    conversion_confidence = "estimated" if conversion_rate and _is_approximate(search_text) else ("exact" if conversion_rate else "unknown")
    spend_confidence = "estimated" if marketing_spend and _is_approximate(search_text) else ("exact" if marketing_spend else "unknown")
    price_confidence = "estimated" if selling_price and _is_approximate(search_text) else ("exact" if selling_price else "unknown")
    cost_confidence = "estimated" if variable_cost and _is_approximate(search_text) else ("exact" if variable_cost else "unknown")

    return {
        "name": channel_name,
        "leads": leads,
        "leads_confidence": leads_confidence,
        "conversion_rate": conversion_rate,
        "conversion_confidence": conversion_confidence,
        "selling_price": selling_price,
        "price_confidence": price_confidence,
        "variable_cost_per_customer": variable_cost,
        "cost_confidence": cost_confidence,
        "marketing_spend": marketing_spend,
        "spend_confidence": spend_confidence,
        "additional_fixed_cost": None,
    }


# ---------------------------------------------------------------------------
# Global extraction (values shared across channels)
# ---------------------------------------------------------------------------

def _extract_global_values(text: str) -> Dict[str, Any]:
    """Extract values that are typically shared across all channels."""
    selling_price = _extract_value_from_patterns(text, _PRICE_PATTERNS)
    variable_cost = _extract_value_from_patterns(text, _VARIABLE_COST_PATTERNS)

    price_confidence = "estimated" if selling_price and _is_approximate(text) else ("exact" if selling_price else "unknown")
    cost_confidence = "estimated" if variable_cost and _is_approximate(text) else ("exact" if variable_cost else "unknown")

    return {
        "selling_price": selling_price,
        "price_confidence": price_confidence,
        "variable_cost_per_customer": variable_cost,
        "cost_confidence": cost_confidence,
    }


# ---------------------------------------------------------------------------
# Main public function
# ---------------------------------------------------------------------------

def interpret_user_script(user_text: str) -> Dict[str, Any]:
    """
    Parse plain English business scenario text and return structured context.

    Parameters
    ----------
    user_text : str
        Raw user input describing their marketing channels and financials.

    Returns
    -------
    dict with keys:
        business_type, currency, time_period, channels (list), warnings (list)

    LLM Integration Point
    ---------------------
    Replace this entire function body with an LLM API call.
    The LLM should receive `user_text` and return a JSON matching this structure.

    Example (Anthropic):
        import anthropic, json, os
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        prompt = f\"\"\"
        Extract the following from this business scenario text and return ONLY valid JSON:
        {{
          "business_type": "B2B or B2C",
          "currency": "INR/USD/GBP/EUR",
          "time_period": "Monthly/Quarterly/Annual/Campaign",
          "channels": [
            {{
              "name": "channel name",
              "leads": number or null,
              "leads_confidence": "exact/estimated/unknown",
              "conversion_rate": number or null,
              "conversion_confidence": "exact/estimated/unknown",
              "selling_price": number or null,
              "price_confidence": "exact/estimated/unknown",
              "variable_cost_per_customer": number or null,
              "cost_confidence": "exact/estimated/unknown",
              "marketing_spend": number or null,
              "spend_confidence": "exact/estimated/unknown",
              "additional_fixed_cost": null
            }}
          ],
          "warnings": []
        }}
        Text: {user_text}
        \"\"\"
        response = client.messages.create(
            model="claude-opus-4-5", max_tokens=1024,
            messages=[{{"role": "user", "content": prompt}}]
        )
        return json.loads(response.content[0].text)
    """

    warnings: List[str] = []

    # -- Basic metadata extraction --
    currency = _detect_currency(user_text)
    business_type = _detect_business_type(user_text)
    time_period = _detect_time_period(user_text)

    # -- Channel detection --
    channels_found = _find_channels_in_text(user_text)

    if not channels_found:
        warnings.append(
            "No specific marketing channels detected. Please mention channel names like "
            "'Google Ads', 'LinkedIn Ads', 'Facebook Ads', etc."
        )
        # Create a generic single channel
        channels_found = ["Channel 1"]

    # -- Global values (shared across channels) --
    global_values = _extract_global_values(user_text)

    # -- Per-channel extraction --
    extracted_channels: List[Dict[str, Any]] = []
    for channel_name in channels_found:
        data = _extract_channel_data(channel_name, user_text)

        # Fill in global values for fields not found in channel-specific text
        if data["selling_price"] is None:
            data["selling_price"] = global_values["selling_price"]
            data["price_confidence"] = global_values["price_confidence"]

        if data["variable_cost_per_customer"] is None:
            data["variable_cost_per_customer"] = global_values["variable_cost_per_customer"]
            data["cost_confidence"] = global_values["cost_confidence"]

        extracted_channels.append(data)

    # -- Warnings for missing critical fields --
    for ch in extracted_channels:
        missing = []
        if ch["leads"] is None:
            missing.append("leads")
        if ch["conversion_rate"] is None:
            missing.append("conversion_rate")
        if ch["selling_price"] is None:
            missing.append("selling_price")
        if ch["marketing_spend"] is None:
            missing.append("marketing_spend")
        if missing:
            warnings.append(
                f"Channel '{ch['name']}': could not extract {', '.join(missing)} — "
                f"please fill in the form manually."
            )

    return {
        "business_type": business_type,
        "currency": currency,
        "time_period": time_period,
        "channels": extracted_channels,
        "warnings": warnings,
    }
