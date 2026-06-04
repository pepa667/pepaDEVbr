/* phosphor-theme.js
   Loads the phosphor CSS theme on mobile with a 20% chance.
   Adds `theme-phosphor` class to the documentElement once the CSS is loaded.
*/
(function () {
  try {
    var isMobile = typeof window !== 'undefined' && (window.matchMedia && window.matchMedia('(max-width: 799px)').matches);
    if (!isMobile) return;

    var chance = 1; // 20%
    if (Math.random() >= chance) return;

    var href = '/assets/css/phosphor.css';
    if (document.querySelector('link[href="' + href + '"]')) {
      document.documentElement.classList.add('theme-phosphor');
      return;
    }

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = function () {
      document.documentElement.classList.add('theme-phosphor');
    };
    link.onerror = function () {
      // fail silently
      console.warn('Failed to load phosphor stylesheet:', href);
    };
    document.head.appendChild(link);
  } catch (e) {
    console.warn('phosphor-theme error', e);
  }
})();
