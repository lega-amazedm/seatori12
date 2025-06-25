// --- Бургер-меню для мобильной навигации с затемнением фона ---
document.addEventListener('DOMContentLoaded', function() {
    const burger = document.getElementById('burgerBtn');
    const nav = document.getElementById('mainNav');
    let overlay = null;
    if (burger && nav) {
        burger.addEventListener('click', function() {
            nav.classList.toggle('active');
            if (nav.classList.contains('active')) {
                overlay = document.createElement('div');
                overlay.className = 'overlay';
                document.body.appendChild(overlay);
                overlay.addEventListener('click', function() {
                    nav.classList.remove('active');
                    overlay.remove();
                });
            } else if (overlay) {
                overlay.remove();
            }
        });
        // Закрытие меню при клике на ссылку
        nav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                nav.classList.remove('active');
                if (overlay) overlay.remove();
            });
        });
    }
});

// Preloader logic (only on first visit per session)
document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    if (sessionStorage.getItem('seaToriPreloaderShown')) {
        preloader.style.display = 'none';
        return;
    }
    sessionStorage.setItem('seaToriPreloaderShown', '1');
    setTimeout(() => {
        preloader.classList.add('hide');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 600);
    }, 3000);
}); 