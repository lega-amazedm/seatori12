document.addEventListener('DOMContentLoaded', function() {
    // Initialize the contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }

    // Initialize the map
    initMap();
});

// Handle contact form submission
function handleContactFormSubmit(event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    // Here you would typically send the form data to your server
    // For now, we'll just log it and show a success message
    console.log('Form submitted:', formData);
    
    // Show success message
    alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
    
    // Reset the form
    event.target.reset();
}

// Initialize the map
function initMap() {
    // This is a placeholder for the map initialization
    // You would typically use a mapping service like Google Maps or Yandex Maps
    // For example, with Google Maps:
    /*
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: YOUR_LATITUDE, lng: YOUR_LONGITUDE },
        zoom: 15
    });

    const marker = new google.maps.Marker({
        position: { lat: YOUR_LATITUDE, lng: YOUR_LONGITUDE },
        map: map,
        title: 'Sea Tori'
    });
    */

    // For now, we'll just show a placeholder message
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;
                background-color: #f5f5f5;
                color: #666;
                font-size: 1.2rem;
                text-align: center;
                padding: 1rem;
            ">
                <p>Здесь будет карта с расположением ресторана</p>
            </div>
        `;
    }
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
}); 