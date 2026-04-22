import { getState, nextStep, recordAnswer } from '../state.js';
import { showScreen } from '../router.js';

export function renderStep() {
  const state = getState();
  const { domain, stepIndex } = state;
  const step = domain.steps[stepIndex];

  const chip = document.getElementById('score-chip');
  chip.style.display = 'block';
  document.getElementById('score-val').textContent = state.score;

  const el = document.getElementById('screen-step');
  el.innerHTML = `
    <div class="step-wrap">
      ${progressHTML(stepIndex)}
      <div class="step-card">
        <div class="concept-badge">📐 ${step.concept}</div>
        <div class="step-title">${step.title}</div>
        ${step.breakdown ? breakdownHTML(step.breakdown) : ''}
        <div class="q-text">${step.question}</div>
        <div class="hint">${step.hint}</div>
        <div class="choices" id="choices">
          ${step.choices.map(c => `
            <button class="choice" data-id="${c.id}" id="choice-${c.id}">
              <span class="c-letter">${c.id.toUpperCase()}</span>
              <span class="c-text">${c.text}</span>
            </button>`).join('')}
        </div>
        <button class="submit-btn" id="submit-btn" disabled>Submit Answer</button>
        <div id="feedback-area"></div>
        <button class="next-btn" id="next-btn" style="display:none">${stepIndex < 3 ? 'Next Step →' : 'See Results →'}</button>
      </div>
    </div>`;

  let selected = null;

  el.querySelectorAll('.choice').forEach(btn => {
    btn.addEventListener('click', () => {
      if (getState().submitted) return;
      el.querySelectorAll('.choice').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selected = btn.dataset.id;
      document.getElementById('submit-btn').disabled = false;
    });
  });

  document.getElementById('submit-btn').addEventListener('click', () => {
    if (!selected) return;
    const correct = selected === step.correctId;
    recordAnswer(step.id, correct);
    document.getElementById('score-val').textContent = getState().score;

    el.querySelectorAll('.choice').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.id === step.correctId) btn.classList.add('correct');
      else if (btn.dataset.id === selected && !correct) btn.classList.add('wrong');
    });

    document.getElementById('feedback-area').innerHTML = feedbackHTML(correct, step, selected);
    document.getElementById('submit-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'block';
  });

  document.getElementById('next-btn').addEventListener('click', () => {
    nextStep();
    const s = getState();
    if (s.stepIndex >= s.domain.steps.length) {
      chip.style.display = 'none';
      import('./results.js').then(m => { m.renderResults(); showScreen('results'); });
    } else {
      renderStep();
    }
  });
}

function progressHTML(idx) {
  const bars = [0,1,2,3].map(i =>
    `<div class="prog-bar ${i < idx ? 'done' : i === idx ? 'cur' : ''}"></div>`
  ).join('');
  return `<div class="progress">${bars}<span class="prog-lbl">Step ${idx+1} of 4</span></div>`;
}

function breakdownHTML(rows) {
  return `
    <table class="breakdown">
      <tbody>
        ${rows.map(r => `
          <tr class="${r.total ? (r.positive ? 'total pos' : 'total neg') : (r.positive ? 'pos' : 'neg')}">
            <td>${r.label}</td>
            <td style="text-align:right">${r.positive && !r.total ? '+' : ''}${r.value}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function feedbackHTML(correct, step, selected) {
  const cls = correct ? 'ok' : 'ko';
  const verdict = correct ? '✅ Correct!' : '❌ Incorrect';
  return `
    <div class="feedback ${cls}">
      <div class="fb-verdict ${cls}">${verdict}</div>
      <div class="fb-exp">${step.explanations[selected]}</div>
      <div class="fb-lesson">📘 Key lesson: ${step.lesson}</div>
    </div>`;
}
