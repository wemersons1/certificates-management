import "./index.scss";
import Swal from 'sweetalert2';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from './components/common/scrolltotop/scrolltotop';
import AppProvider from './AppContext/Provider';
import Routes from './routes';
import './i18nify.js';

// ── Global SweetAlert2 Premium Override ──────────────────────────────────────
// Intercepts every Swal.fire() call so that confirmButtonColor / cancelButtonColor
// are set to 'transparent', letting premium-modals.css gradients take full effect
// (SweetAlert2 normally injects these as inline `style=""` which beats regular CSS).
// Also forces `background: 'transparent'` so our glassmorphism CSS is visible.
const _originalSwalFire = Swal.fire.bind(Swal);
(Swal as any).fire = (...args: Parameters<typeof Swal.fire>) => {
  const firstArg = args[0];
  if (firstArg && typeof firstArg === 'object' && !Array.isArray(firstArg)) {
    const opts = firstArg as Record<string, unknown>;
    if (opts.confirmButtonColor === undefined) opts.confirmButtonColor = 'transparent';
    if (opts.cancelButtonColor  === undefined) opts.cancelButtonColor  = 'transparent';
    if (opts.background         === undefined) opts.background         = 'transparent';

    // Fix the "risco" (diagonal scratch) on the success icon.
    // Swal injects style="background-color: #fff" inline on .swal2-success-fix
    // to mask the ring during animation — but this clashes with our custom background.
    // We intercept didOpen to remove that inline style right after render.
    const originalDidOpen = opts.didOpen as ((popup: HTMLElement) => void) | undefined;
    opts.didOpen = (popup: HTMLElement) => {
      // Remove inline white backgrounds from ALL success icon sub-elements.
      // SweetAlert2 sets style="background-color: #fff" via JS on each of these.
      const selectors = [
        '.swal2-success-fix',
        '.swal2-success-circular-line-left',
        '.swal2-success-circular-line-right',
        '.swal2-icon.swal2-success',
      ];
      selectors.forEach(sel => {
        const el = popup.querySelector<HTMLElement>(sel);
        if (el) {
          el.style.removeProperty('background-color');
          el.style.removeProperty('background');
          el.style.backgroundColor = 'transparent';
        }
      });
      if (originalDidOpen) originalDidOpen(popup);
    };

  }
  return _originalSwalFire(...args);
};

// ─────────────────────────────────────────────────────────────────────────────

// Defaults do localStorage — só seta se a chave ainda não existir
const localStorageDefaults: Record<string, string> = {
  velvetMenu: 'dark',
  velvetlighttheme: 'light',
  velvetdefaultHeader: 'light',
};
Object.entries(localStorageDefaults).forEach(([key, value]) => {
  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, value);
  }
});

ReactDOM.createRoot(document.getElementById('app')!).render(
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop/>
        <Routes/>
      </BrowserRouter>
    </AppProvider>
)
