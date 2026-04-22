import { SCENARIOS } from '../data/index.js';
import { setDomain }  from '../state.js';
import { showScreen }  from '../router.js';

const DOMAIN_ORDER = ['manufacturing', 'retail', 'software'];

export function renderWelcome() {
  const el = document.getElementById('screen-welcome');
  el.innerHTML = `
    <div class="welcome">
      <div class="welcome-hero">
        <h1>The <span>New Service</span> Decision</h1>
        <p>A manager's guide to differential cost analysis. Evaluate whether adding a new service truly creates value — or quietly destroys it.</p>
        <div class="pills">
          <span class="pill">🔍 Differential Revenue</span>
          <span class="pill">⚖️ Avoidable Fixed Costs</span>
          <span class="pill">💸 Opportunity Cost</span>
        </div>
      </div>
      <div class="domain-cards">
        ${DOMAIN_ORDER.map(key => cardHTML(SCENARIOS[key])).join('')}
      </div>
    </div>`;

  DOMAIN_ORDER.forEach(key => {
    document.getElementById(`card-${key}`).addEventListener('click', () => {
      setDomain(SCENARIOS[key]);
      import('./scenario.js').then(m => { m.renderScenario(); showScreen('scenario'); });
    });
  });
}

function cardHTML(s) {
  return `
    <div class="domain-card ${s.colorClass}" id="card-${s.id}">
      <div class="dc-emoji">${s.emoji}</div>
      <div class="dc-domain">${s.label}</div>
      <div class="dc-company">${s.company}</div>
      <div class="dc-desc">${s.tagline}</div>
      <button class="dc-btn">Play →</button>
    </div>`;
}
