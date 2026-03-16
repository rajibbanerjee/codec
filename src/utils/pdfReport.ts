import jsPDF from 'jspdf';
import type { ChannelData, BreakevenResult } from '../types';
import { formatCurrency, formatNumber, formatPct } from './calculations';

const DARK_BG = [18, 18, 30] as [number, number, number];
const CARD_BG = [26, 26, 46] as [number, number, number];
const ACCENT = [99, 102, 241] as [number, number, number];
const ACCENT2 = [236, 72, 153] as [number, number, number];
const TEXT_PRIMARY = [230, 230, 255] as [number, number, number];
const TEXT_SECONDARY = [148, 163, 184] as [number, number, number];
const GREEN = [52, 211, 153] as [number, number, number];
const RED = [248, 113, 113] as [number, number, number];
const BORDER = [55, 55, 80] as [number, number, number];

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [99, 102, 241];
}

export function generatePDFReport(channels: ChannelData[], results: BreakevenResult[]): void {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 14;
  const contentW = pageW - margin * 2;

  let y = 0;

  function newPage() {
    pdf.addPage();
    y = margin;
    drawPageBg();
  }

  function drawPageBg() {
    pdf.setFillColor(...DARK_BG);
    pdf.rect(0, 0, pageW, pageH, 'F');
  }

  function checkPageBreak(needed: number) {
    if (y + needed > pageH - margin) {
      newPage();
    }
  }

  // ── Page 1: Cover ─────────────────────────────────────────────────────────
  drawPageBg();

  // Top accent bar
  pdf.setFillColor(...ACCENT);
  pdf.rect(0, 0, pageW, 3, 'F');

  // Gradient-style header band
  pdf.setFillColor(...CARD_BG);
  pdf.rect(0, 3, pageW, 60, 'F');

  pdf.setFillColor(...ACCENT);
  pdf.rect(margin, 20, 5, 30, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28);
  pdf.setTextColor(...TEXT_PRIMARY);
  pdf.text('Channel Characteristics', margin + 10, 35);
  pdf.text('Analyzer Report', margin + 10, 46);

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...TEXT_SECONDARY);
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin + 10, 56);
  pdf.text(`Channels Analyzed: ${channels.length}`, margin + 10, 62);

  y = 80;

  // Summary cards row
  const cardW = (contentW - 6) / 3;
  const summaryMetrics = [
    { label: 'Total Channels', value: channels.length.toString(), color: ACCENT },
    {
      label: 'Avg Breakeven Units',
      value: formatNumber(results.reduce((s, r) => s + (isFinite(r.breakevenUnits) ? r.breakevenUnits : 0), 0) / results.filter(r => isFinite(r.breakevenUnits)).length),
      color: ACCENT2,
    },
    {
      label: 'Best Contribution Margin',
      value: formatPct(Math.max(...results.map(r => r.contributionMarginPct))),
      color: GREEN,
    },
  ];

  summaryMetrics.forEach((m, i) => {
    const cx = margin + i * (cardW + 3);
    pdf.setFillColor(...CARD_BG);
    pdf.roundedRect(cx, y, cardW, 22, 2, 2, 'F');
    pdf.setFillColor(...m.color);
    pdf.rect(cx, y, 3, 22, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(...TEXT_SECONDARY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(m.label.toUpperCase(), cx + 6, y + 8);
    pdf.setFontSize(14);
    pdf.setTextColor(...TEXT_PRIMARY);
    pdf.setFont('helvetica', 'bold');
    pdf.text(m.value, cx + 6, y + 17);
  });

  y += 30;

  // Channel overview table
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(...TEXT_PRIMARY);
  pdf.text('Channel Overview', margin, y);
  y += 6;

  // Table header
  const cols = [
    { label: 'Channel', w: 32 },
    { label: 'Sell Price', w: 24 },
    { label: 'Var Cost', w: 22 },
    { label: 'Fixed Cost', w: 25 },
    { label: 'CM %', w: 18 },
    { label: 'BEP Units', w: 24 },
    { label: 'BEP Revenue', w: 27 },
  ];

  pdf.setFillColor(...ACCENT);
  pdf.rect(margin, y, contentW, 7, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(255, 255, 255);
  let cx = margin + 2;
  cols.forEach(col => {
    pdf.text(col.label, cx, y + 5);
    cx += col.w;
  });
  y += 7;

  results.forEach((r, idx) => {
    checkPageBreak(9);
    const rowBg = idx % 2 === 0 ? CARD_BG : [22, 22, 40] as [number, number, number];
    pdf.setFillColor(...rowBg);
    pdf.rect(margin, y, contentW, 8, 'F');

    const channelColor = hexToRgb(r.color);
    pdf.setFillColor(...channelColor);
    pdf.rect(margin, y, 2, 8, 'F');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...TEXT_PRIMARY);
    cx = margin + 2;
    const ch = channels.find(c => c.id === r.channelId)!;
    const rowData = [
      r.channelName,
      formatCurrency(ch.sellingPricePerUnit),
      formatCurrency(ch.variableCostPerUnit),
      formatCurrency(ch.fixedCost),
      formatPct(r.contributionMarginPct),
      isFinite(r.breakevenUnits) ? formatNumber(r.breakevenUnits) : 'N/A',
      isFinite(r.breakevenRevenue) ? formatCurrency(r.breakevenRevenue) : 'N/A',
    ];
    rowData.forEach((val, vi) => {
      pdf.text(val, cx, y + 5.5);
      cx += cols[vi].w;
    });
    y += 8;
  });

  y += 8;

  // ── Per-channel detailed pages ────────────────────────────────────────────
  results.forEach((r, idx) => {
    checkPageBreak(20);
    const ch = channels.find(c => c.id === r.channelId)!;
    const chColor = hexToRgb(r.color);

    // Section header
    pdf.setFillColor(...CARD_BG);
    pdf.rect(margin, y, contentW, 12, 'F');
    pdf.setFillColor(...chColor);
    pdf.rect(margin, y, 4, 12, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(...TEXT_PRIMARY);
    pdf.text(`Channel ${idx + 1}: ${r.channelName}`, margin + 7, y + 8);
    y += 16;

    // Two-column metrics
    const halfW = (contentW - 4) / 2;
    const leftMetrics = [
      { label: 'Selling Price/Unit', value: formatCurrency(ch.sellingPricePerUnit) },
      { label: 'Variable Cost/Unit', value: formatCurrency(ch.variableCostPerUnit) },
      { label: 'Fixed Cost', value: formatCurrency(ch.fixedCost) },
      { label: 'Contribution Margin', value: `${formatCurrency(r.contributionMargin)} (${formatPct(r.contributionMarginPct)})` },
    ];
    const rightMetrics = [
      { label: 'Breakeven Units', value: isFinite(r.breakevenUnits) ? formatNumber(r.breakevenUnits) : 'N/A' },
      { label: 'Breakeven Revenue', value: isFinite(r.breakevenRevenue) ? formatCurrency(r.breakevenRevenue) : 'N/A' },
      { label: 'Order Range', value: `${formatNumber(ch.orderSizeMin)} – ${formatNumber(ch.orderSizeMax)} units` },
      { label: 'Desired Profit Range', value: `${formatCurrency(ch.desiredProfitMin)} – ${formatCurrency(ch.desiredProfitMax)}` },
    ];

    checkPageBreak(leftMetrics.length * 9 + 6);
    leftMetrics.forEach((m, mi) => {
      pdf.setFillColor(...CARD_BG);
      pdf.rect(margin, y + mi * 9, halfW, 8, 'F');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(...TEXT_SECONDARY);
      pdf.text(m.label, margin + 3, y + mi * 9 + 4);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...TEXT_PRIMARY);
      pdf.text(m.value, margin + 3, y + mi * 9 + 7.5);
    });
    rightMetrics.forEach((m, mi) => {
      pdf.setFillColor(...CARD_BG);
      pdf.rect(margin + halfW + 4, y + mi * 9, halfW, 8, 'F');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(...TEXT_SECONDARY);
      pdf.text(m.label, margin + halfW + 7, y + mi * 9 + 4);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...TEXT_PRIMARY);
      pdf.text(m.value, margin + halfW + 7, y + mi * 9 + 7.5);
    });

    y += leftMetrics.length * 9 + 4;

    // Profit analysis at order range
    checkPageBreak(28);
    pdf.setFillColor(...CARD_BG);
    pdf.rect(margin, y, contentW, 24, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...TEXT_SECONDARY);
    pdf.text('PROFIT ANALYSIS AT ORDER RANGE', margin + 4, y + 6);

    const profitItems = [
      { label: `Profit at Min Order (${formatNumber(ch.orderSizeMin)} units)`, value: r.profitAtMinOrder, isProfit: true },
      { label: `Profit at Max Order (${formatNumber(ch.orderSizeMax)} units)`, value: r.profitAtMaxOrder, isProfit: true },
      { label: `Units Needed for Min Profit (${formatCurrency(ch.desiredProfitMin)})`, value: r.unitsForMinProfit, isProfit: false },
      { label: `Units Needed for Max Profit (${formatCurrency(ch.desiredProfitMax)})`, value: r.unitsForMaxProfit, isProfit: false },
    ];

    profitItems.forEach((item, pi) => {
      const px = margin + 4 + (pi % 2) * (halfW);
      const py = y + 10 + Math.floor(pi / 2) * 10;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(...TEXT_SECONDARY);
      pdf.text(item.label, px, py);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      const isPositive = item.isProfit ? item.value >= 0 : true;
      pdf.setTextColor(...(isPositive ? GREEN : RED));
      pdf.text(
        item.isProfit
          ? isFinite(item.value) ? formatCurrency(item.value) : 'N/A'
          : isFinite(item.value) ? formatNumber(item.value) + ' units' : 'N/A',
        px,
        py + 5
      );
    });

    y += 28;

    // Mini bar chart for profitability
    checkPageBreak(55);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...TEXT_SECONDARY);
    pdf.text('PROFITABILITY CURVE (simplified)', margin, y + 4);
    y += 8;

    // Draw a simple sparkline chart
    const chartH = 35;
    const chartW = contentW;
    const chartX = margin;
    const chartY = y;

    pdf.setFillColor(...CARD_BG);
    pdf.rect(chartX, chartY, chartW, chartH, 'F');

    const points = r.profitabilityData;
    if (points.length > 1) {
      const maxProfit = Math.max(...points.map(p => p.profit));
      const minProfit = Math.min(...points.map(p => p.profit));
      const range = maxProfit - minProfit || 1;

      // Zero line
      const zeroY = chartY + chartH - ((0 - minProfit) / range) * (chartH - 6) - 3;
      pdf.setDrawColor(...BORDER);
      pdf.setLineWidth(0.3);
      pdf.line(chartX, zeroY, chartX + chartW, zeroY);

      // Profit line
      pdf.setDrawColor(...chColor);
      pdf.setLineWidth(0.8);
      for (let i = 1; i < points.length; i++) {
        const x1 = chartX + ((i - 1) / (points.length - 1)) * chartW;
        const x2 = chartX + (i / (points.length - 1)) * chartW;
        const y1 = chartY + chartH - ((points[i - 1].profit - minProfit) / range) * (chartH - 6) - 3;
        const y2 = chartY + chartH - ((points[i].profit - minProfit) / range) * (chartH - 6) - 3;
        pdf.line(x1, y1, x2, y2);
      }

      // Breakeven marker
      if (isFinite(r.breakevenUnits)) {
        const minUnits = points[0].units;
        const maxUnits = points[points.length - 1].units;
        const bepX = chartX + ((r.breakevenUnits - minUnits) / (maxUnits - minUnits)) * chartW;
        if (bepX >= chartX && bepX <= chartX + chartW) {
          pdf.setDrawColor(255, 200, 50);
          pdf.setLineWidth(0.5);
          pdf.line(bepX, chartY, bepX, chartY + chartH);
          pdf.setFontSize(6);
          pdf.setTextColor(255, 200, 50);
          pdf.text('BEP', bepX + 1, chartY + 4);
        }
      }
    }

    y += chartH + 8;
  });

  // ── Final comparison page ─────────────────────────────────────────────────
  checkPageBreak(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(...TEXT_PRIMARY);
  pdf.text('Comparative Analysis', margin, y);
  y += 8;

  // Comparison table
  const compCols = [
    { label: 'Channel', w: 32 },
    { label: 'CM/Unit', w: 22 },
    { label: 'CM %', w: 18 },
    { label: 'BEP Units', w: 25 },
    { label: 'Profit@Min', w: 28 },
    { label: 'Profit@Max', w: 28 },
    { label: 'Units for Max Profit', w: 29 },
  ];

  pdf.setFillColor(...ACCENT);
  pdf.rect(margin, y, contentW, 7, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  cx = margin + 2;
  compCols.forEach(col => {
    pdf.text(col.label, cx, y + 5);
    cx += col.w;
  });
  y += 7;

  results.forEach((r, idx) => {
    checkPageBreak(9);
    const compRowBg = idx % 2 === 0 ? CARD_BG : [22, 22, 40] as [number, number, number];
    pdf.setFillColor(...compRowBg);
    pdf.rect(margin, y, contentW, 8, 'F');
    const chColor = hexToRgb(r.color);
    pdf.setFillColor(...chColor);
    pdf.rect(margin, y, 2, 8, 'F');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    cx = margin + 2;
    const compRow = [
      r.channelName,
      formatCurrency(r.contributionMargin),
      formatPct(r.contributionMarginPct),
      isFinite(r.breakevenUnits) ? formatNumber(r.breakevenUnits) : 'N/A',
      isFinite(r.profitAtMinOrder) ? formatCurrency(r.profitAtMinOrder) : 'N/A',
      isFinite(r.profitAtMaxOrder) ? formatCurrency(r.profitAtMaxOrder) : 'N/A',
      isFinite(r.unitsForMaxProfit) ? formatNumber(r.unitsForMaxProfit) + ' u' : 'N/A',
    ];
    compRow.forEach((val, vi) => {
      const isNeg = val.startsWith('-$') || val === 'N/A';
      pdf.setTextColor(...(vi >= 4 ? (isNeg ? RED : GREEN) : TEXT_PRIMARY));
      pdf.text(val, cx, y + 5.5);
      cx += compCols[vi].w;
    });
    y += 8;
  });

  y += 10;

  // Footer
  checkPageBreak(15);
  pdf.setFillColor(...CARD_BG);
  pdf.rect(0, pageH - 15, pageW, 15, 'F');
  pdf.setFillColor(...ACCENT);
  pdf.rect(0, pageH - 15, pageW, 1, 'F');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...TEXT_SECONDARY);
  pdf.text('Channel Characteristics Analyzer — Confidential Report', margin, pageH - 7);
  pdf.text(`Page 1 of ${pdf.getNumberOfPages()}`, pageW - margin - 20, pageH - 7);

  pdf.save(`channel-report-${Date.now()}.pdf`);
}
