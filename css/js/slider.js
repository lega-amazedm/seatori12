document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slideshow-arrow.prev');
    const nextBtn = document.querySelector('.slideshow-arrow.next');
    let currentSlide = 0;
    let slideInterval;
    let isAnimating = false;

    // Функция для показа слайда
    function showSlide(index) {
        if (isAnimating) return;
        isAnimating = true;

        // Убираем активный класс у текущего слайда
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');

        // Обновляем индекс текущего слайда
        currentSlide = index;
        if (currentSlide >= slides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = slides.length - 1;

        // Добавляем активный класс новому слайду
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');

        // Сбрасываем флаг анимации после завершения перехода
        setTimeout(() => {
            isAnimating = false;
        }, 800);
    }

    // Функция для перехода к следующему слайду
    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    // Функция для перехода к предыдущему слайду
    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    // Автоматическое переключение слайдов
    function startSlideShow() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Остановка автоматического переключения
    function stopSlideShow() {
        clearInterval(slideInterval);
    }

    // Обработчики событий для кнопок
    prevBtn.addEventListener('click', () => {
        stopSlideShow();
        prevSlide();
        startSlideShow();
    });

    nextBtn.addEventListener('click', () => {
        stopSlideShow();
        nextSlide();
        startSlideShow();
    });

    // Обработчики событий для точек
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopSlideShow();
            showSlide(index);
            startSlideShow();
        });
    });

    // Обработка клавиш клавиатуры
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            stopSlideShow();
            prevSlide();
            startSlideShow();
        } else if (e.key === 'ArrowRight') {
            stopSlideShow();
            nextSlide();
            startSlideShow();
        }
    });

    // Обработка свайпов для мобильных устройств
    let touchStartX = 0;
    let touchEndX = 0;

    document.querySelector('.slideshow').addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.querySelector('.slideshow').addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            // Свайп влево
            stopSlideShow();
            nextSlide();
            startSlideShow();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Свайп вправо
            stopSlideShow();
            prevSlide();
            startSlideShow();
        }
    }

    // Пауза при наведении мыши
    document.querySelector('.slideshow').addEventListener('mouseenter', stopSlideShow);
    document.querySelector('.slideshow').addEventListener('mouseleave', startSlideShow);

    // Запускаем слайдер
    startSlideShow();
}); 