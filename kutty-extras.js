/* ============================================================
   kutty-extras.js
   Handles: 2-second loader hide + hamburger menu toggle
   ============================================================ */

(function () {

    /* ── LOADER: hide after 2 seconds ── */
    window.addEventListener('load', function () {
        setTimeout(function () {
            var loader = document.getElementById('kt-loader');
            if (loader) loader.classList.add('kt-hidden');
        }, 2000);
    });

    /* ── HAMBURGER MENU ── */
    document.addEventListener('DOMContentLoaded', function () {
        var hamburger  = document.getElementById('kt-hamburger');
        var mobileNav  = document.getElementById('kt-mobile-nav');
        var overlay    = document.getElementById('kt-overlay');

        if (!hamburger || !mobileNav || !overlay) return;

        function openMenu() {
            hamburger.classList.add('kt-open');
            mobileNav.classList.add('kt-open');
            overlay.classList.add('kt-open');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            hamburger.classList.remove('kt-open');
            mobileNav.classList.remove('kt-open');
            overlay.classList.remove('kt-open');
            document.body.style.overflow = '';
        }

        hamburger.addEventListener('click', function () {
            mobileNav.classList.contains('kt-open') ? closeMenu() : openMenu();
        });

        overlay.addEventListener('click', closeMenu);

        /* Close when any nav link is tapped */
        mobileNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });
    });

})();
