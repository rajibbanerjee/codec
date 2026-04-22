const SCREENS = ['welcome', 'scenario', 'step', 'results'];

export function showScreen(id) {
  SCREENS.forEach(s => {
    const el = document.getElementById(`screen-${s}`);
    if (el) el.classList.toggle('active', s === id);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
