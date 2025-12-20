document.addEventListener('DOMContentLoaded', function() {
    // Image Slider Functionality
    const sliderItems = document.querySelectorAll('.slider-item');
    const sliderDots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.querySelector('.slider-nav.prev');
    const nextBtn = document.querySelector('.slider-nav.next');
    let currentSlide = 0;
    
    // Function to show a specific slide
    function showSlide(index) {
        // Hide all slides
        sliderItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Remove active class from all dots
        sliderDots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Ensure index is within bounds
        if (index >= sliderItems.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = sliderItems.length - 1;
        } else {
            currentSlide = index;
        }
        
        // Show current slide and activate corresponding dot
        sliderItems[currentSlide].classList.add('active');
        sliderDots[currentSlide].classList.add('active');
    }
    
    // Next slide function
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    // Previous slide function
    function prevSlide() {
        showSlide(currentSlide - 1);
    }
    
    // Event listeners for navigation buttons
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // Event listeners for dots
    sliderDots.forEach(dot => {
        dot.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            showSlide(index);
        });
    });
    
    // Auto-slide every 5 seconds
    let slideInterval = setInterval(nextSlide, 5000);
    
    // Pause auto-slide on hover
    const sliderContainer = document.querySelector('.slider-container');
    sliderContainer.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    sliderContainer.addEventListener('mouseleave', () => {
        slideInterval = setInterval(nextSlide, 5000);
    });
    
    // CTA button animation and functionality
    const ctaButton = document.querySelector('.cta-button');
    ctaButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Add click animation
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
        
        // Navigate to Beranda after animation
        setTimeout(() => {
            window.location.href = 'beranda.html';
        }, 300);
    });
    
    // Login button functionality
    const loginButton = document.querySelector('.login-btn');
    loginButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Add click animation
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
        
        // Navigate to DAFTAR.html#login after animation
        setTimeout(() => {
            window.location.href = 'DAFTAR.html#login';
        }, 300);
    });
    
    // Social media icons hover effect enhancement
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
});