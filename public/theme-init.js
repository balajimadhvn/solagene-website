// Runs before first paint (loaded without defer from <head>). Kept as a file, not inline, so the Content Security
// Policy can forbid inline scripts.
(function () {
  // Clickjacking guard: GitHub Pages cannot send X-Frame-Options or a frame-ancestors header, so refuse to run framed
  // by another site.
  try { if (window.top !== window.self && window.top.location.hostname !== window.location.hostname) throw 0; }
  catch (e) { document.documentElement.style.display = 'none'; try { window.top.location = window.location.href; } catch (_) {} }
  // Theme: stored choice, else OS preference, else light.
  var d = document.documentElement, t;
  try { t = localStorage.getItem('wb.theme'); } catch (e) {}
  if (t !== 'light' && t !== 'dark') t = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  d.dataset.theme = t;
  // Reveal-on-scroll is enabled only with JS; if the app never starts, show everything.
  d.classList.add('js');
  setTimeout(function () { if (!window.__appReady) d.classList.remove('js'); }, 3500);
})();
