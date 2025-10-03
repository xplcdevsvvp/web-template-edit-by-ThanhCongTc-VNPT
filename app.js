// app.js - simple interactivity: mobile menu, accessible focus, contrast helper, basic modal
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      if (mobileMenu.hasAttribute('hidden')) {
        mobileMenu.removeAttribute('hidden');
      } else {
        mobileMenu.setAttribute('hidden', '');
      }
    });
    mobileMenu.querySelectorAll('[data-close-mobile]').forEach(btn => {
      btn.addEventListener('click', () => {
        mobileMenu.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Simple contrast helper: compute contrast of body text vs background
  function luminance(r,g,b) {
    const a = [r,g,b].map(v => {
      v = v / 255;
      return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
    });
    return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
  }
  function contrast(hex1, hex2) {
    const h2rgb = h => {
      const hex = h.replace('#','');
      return [parseInt(hex.substr(0,2),16), parseInt(hex.substr(2,2),16), parseInt(hex.substr(4,2),16)];
    };
    const L1 = luminance(...h2rgb(hex1));
    const L2 = luminance(...h2rgb(hex2));
    return (Math.max(L1,L2) + 0.05) / (Math.min(L1,L2) + 0.05);
  }
  try {
    const style = getComputedStyle(document.body);
    const bg = style.backgroundColor || 'rgb(15,23,36)';
    // parse rgb to hex
    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    let hex = '#0f1724';
    if (m) {
      hex = '#' + [1,2,3].map(i => Number(m[i]).toString(16).padStart(2,'0')).join('');
    }
    const textHex = '#e6eef6';
    const ratio = contrast(hex, textHex);
    const el = document.getElementById('contrast-value');
    if (el) el.textContent = ratio.toFixed(2);
  } catch (e) { /* ignore on old browsers */ }

  // Accessible focus handling for keyboard only
  function handleFirstTab(e){
    if (e.key === 'Tab') {
      document.documentElement.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
    }
  }
  window.addEventListener('keydown', handleFirstTab);

  // Simple subscribe form demo
  const form = document.getElementById('subscribeForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Subscribed';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Subscribe';
        btn.disabled = false;
      }, 1500);
    });
  }
});
