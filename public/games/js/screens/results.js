import { getState, resetGame } from '../state.js';
import { showScreen }          from '../router.js';

const RATINGS = [
  { min: 100, emoji: '🏆', title: 'Master Analyst',  sub: 'Flawless differential analysis. Outstanding.' },
  { min: 75,  emoji: '🥇', title: 'Senior Analyst',  sub: 'Strong grasp of differential cost concepts.' },
  { min: 50,  emoji: '🥈', title: 'Junior Analyst',  sub: 'Good foundation — review the missed concepts.' },
  { min: 25,  emoji: '🥉', title: 'Trainee',         sub: 'Keep practising — the concepts will click.' },
  { min: 0,   emoji: '📚', title: 'Keep Learning',   sub: 'Re-read the scenario explanations carefully.' },
];

export function renderResults() {
  const { score, answers, domain } = getState();
  const rating = RATINGS.find(r => score >= r.min);
  const borderColor = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)';
  const textColor   = score >= 75 ? 'var(--green-l)' : score >= 50 ? 'var(--amber-l)' : 'var(--red-l)';

  const el = document.getElementById('screen-results');
  el.innerHTML = `
    <div class="results-wrap">
      <div class="score-circle" style="border-color:${borderColor}">
        <div class="sc-num" style="color:${textColor}">${score}</div>
        <div class="sc-lbl" style="color:${textColor}">/ 100</div>
      </div>
      <div class="r-title">${rating.emoji} ${rating.title}</div>
      <div class="r-sub">${rating.sub}</div>

      <div>
        ${domain.steps.map((step, i) => reviewCardHTML(step, answers[i])).join('')}
      </div>

      <div class="result-actions">
        <button class="ra primary" id="btn-retry">Try Another Domain</button>
        <button class="ra secondary" id="btn-replay">Replay This Scenario</button>
      </div>
    </div>`;

  document.getElementById('btn-retry').addEventListener('click', () => {
    resetGame();
    import('./welcome.js').then(m => { m.renderWelcome(); showScreen('welcome'); });
  });

  document.getElementById('btn-replay').addEventListener('click', () => {
    const scenario = domain;
    resetGame();
    import('../state.js').then(({ setDomain }) => {
      setDomain(scenario);
      import('./step.js').then(m => { m.renderStep(); showScreen('step'); });
    });
  });
}

function reviewCardHTML(step, answer) {
  const ok = answer?.correct;
  return `
    <div class="review-card">
      <div class="rv-head">
        <span>${ok ? '✅' : '❌'}</span>
        <div>
          <div class="rv-step">${step.title.split('—')[0].trim()}</div>
          <div class="rv-concept">${step.concept}</div>
        </div>
        <span class="rv-badge ${ok ? 'ok' : 'ko'}">${ok ? '+25 pts' : '0 pts'}</span>
      </div>
      <div class="rv-lesson">📘 ${step.lesson}</div>
    </div>`;
}
