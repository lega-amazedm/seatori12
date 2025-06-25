document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;
    let slideInterval;
    const slideDelay = 5000; // 5 seconds

    // Initialize slideshow
    function initSlideshow() {
        // Set initial slide
        slides[0].classList.add('active');
        dots[0].classList.add('active');
        
        // Start automatic slideshow
        startSlideshow();
        
        // Add event listeners
        prevBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            changeSlide(currentSlide - 1);
            startSlideshow();
        });
        
        nextBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            changeSlide(currentSlide + 1);
            startSlideshow();
        });
        
        // Add dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(slideInterval);
                changeSlide(index);
                startSlideshow();
            });
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                clearInterval(slideInterval);
                changeSlide(currentSlide - 1);
                startSlideshow();
            } else if (e.key === 'ArrowRight') {
                clearInterval(slideInterval);
                changeSlide(currentSlide + 1);
                startSlideshow();
            }
        });

        // Add touch support
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.querySelector('.modern-slideshow').addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.querySelector('.modern-slideshow').addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left
                clearInterval(slideInterval);
                changeSlide(currentSlide + 1);
                startSlideshow();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right
                clearInterval(slideInterval);
                changeSlide(currentSlide - 1);
                startSlideshow();
            }
        }
    }

    function changeSlide(index) {
        // Remove active class from current slide and dot
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        // Update current slide index
        currentSlide = (index + slides.length) % slides.length;
        
        // Add active class to new slide and dot
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function startSlideshow() {
        slideInterval = setInterval(() => {
            changeSlide(currentSlide + 1);
        }, slideDelay);
    }

    // Initialize the slideshow
    initSlideshow();
}); 