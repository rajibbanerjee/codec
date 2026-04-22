import { getState }  from '../state.js';
import { showScreen } from '../router.js';

export function renderScenario() {
  const { domain: s } = getState();
  const el = document.getElementById('screen-scenario');

  el.innerHTML = `
    <div class="scenario-wrap">
      <div class="co-card">
        <div class="co-icon" style="background:rgba(99,102,241,0.15)">${s.emoji}</div>
        <div>
          <div class="co-domain">${s.label}</div>
          <div class="co-name">${s.company}</div>
          <div class="co-ctx">${s.context}</div>
        </div>
      </div>

      <div class="data-card">
        <h3>Financial Data & Context</h3>
        <table class="dtable">
          <tbody>
            ${s.tableRows.map(r => `
              <tr>
                <td>${r.label}</td>
                <td>
                  ${r.value}
                  ${r.note ? `<span class="${r.noteType === 'warn' ? 'warn' : 'info'}">⚠ ${r.note}</span>` : ''}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <button class="begin-btn" id="begin-btn">Begin Analysis — 4 Steps →</button>
    </div>`;

  document.getElementById('begin-btn').addEventListener('click', () => {
    import('./step.js').then(m => { m.renderStep(); showScreen('step'); });
  });
}
