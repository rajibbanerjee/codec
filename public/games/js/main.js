import { renderNav }     from './nav.js';
import { renderWelcome }  from './screens/welcome.js';
import { showScreen }     from './router.js';

renderNav();
renderWelcome();
showScreen('welcome');
