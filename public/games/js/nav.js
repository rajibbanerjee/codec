const GAMES_MENU = [
  { emoji: '🎮', name: 'New Service Decision', desc: 'Differential cost analysis', active: true, soon: false },
  { emoji: '🏗️', name: 'Make or Buy',          desc: 'Outsourcing decisions',      active: false, soon: true },
  { emoji: '💰', name: 'Pricing Strategy',     desc: 'Optimal price-setting',      active: false, soon: true },
  { emoji: '📊', name: 'Capital Budgeting',    desc: 'NPV & IRR decisions',        active: false, soon: true },
];

export function renderNav() {
  const navbar = document.getElementById('navbar');
  const mobileMenu = document.getElementById('mobile-menu');

  navbar.innerHTML = `
    <div class="nav-inner">
      <a class="nav-logo" href="#">
        <div class="nav-logo-icon">🧠</div>
        <span class="nav-logo-text">Manage<span>IQ</span></span>
      </a>
      <div class="nav-links">
        <div class="nav-item">
          <button class="nav-link" id="services-btn" aria-expanded="false">
            Services
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="dropdown" id="services-dropdown">
            <div class="dd-section">Games</div>
            ${GAMES_MENU.map(g => `
              <div class="dd-item ${g.active ? 'active-game' : ''} ${g.soon ? 'soon' : ''}">
                <div class="dd-icon" style="background:rgba(99,102,241,0.15)">${g.emoji}</div>
                <div class="dd-info">
                  <div class="dd-name">${g.name}${g.active ? '<span class="dd-badge">Active</span>' : ''}${g.soon ? '<span class="dd-soon">Soon</span>' : ''}</div>
                  <div class="dd-desc">${g.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <a class="nav-link" href="#">Blog</a>
        <a class="nav-link" href="#">Contact</a>
      </div>
      <a class="nav-cta" href="#">Try Free</a>
      <button class="hamburger" id="hamburger" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>`;

  mobileMenu.innerHTML = `
    <div class="m-section">Games</div>
    ${GAMES_MENU.map(g => `<a class="m-link ${g.active ? 'cur' : ''}" href="#">${g.emoji} ${g.name}${g.soon ? ' (Soon)' : ''}</a>`).join('')}
    <div class="m-section">Company</div>
    <a class="m-link" href="#">✍️ Blog</a>
    <a class="m-link" href="#">✉️ Contact</a>
    <button class="m-cta">Try Free</button>`;

  // Dropdown toggle
  const btn = document.getElementById('services-btn');
  const dd  = document.getElementById('services-dropdown');
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = dd.classList.toggle('visible');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', () => { dd.classList.remove('visible'); btn.classList.remove('open'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { dd.classList.remove('visible'); btn.classList.remove('open'); } });

  // Hamburger
  const ham = document.getElementById('hamburger');
  ham.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    ham.classList.toggle('open', open);
  });
}
