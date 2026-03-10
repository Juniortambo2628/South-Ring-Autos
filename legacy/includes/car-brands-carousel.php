<?php
/**
 * Car Brands Carousel Component
 * Displays car brands in a moving carousel before the footer
 */
?>
<!-- Car Brands Carousel Start -->
<div class="container-fluid py-5" style="background: #f8f9fa;">
    <div class="container">
        <div class="text-center mb-4">
            <h3 class="mb-2">Brands We Service</h3>
            <p class="text-muted">Expert service for all major car brands</p>
        </div>
        <div class="car-brands-carousel-container">
            <div class="swiper car-brands-swiper">
                <div class="swiper-wrapper" id="car-brands-wrapper">
                    <!-- Brands will be loaded here via JavaScript -->
                    <div class="swiper-slide text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
                <div class="swiper-pagination"></div>
            </div>
        </div>
    </div>
</div>
<!-- Car Brands Carousel End -->

<style>
.car-brands-carousel-container {
    padding: 20px 0;
}
.car-brands-swiper {
    padding: 20px 0 50px;
}
.car-brand-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: transform 0.3s, box-shadow 0.3s;
    height: 150px;
}
.car-brand-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.car-brand-logo {
    max-height: 80px;
    max-width: 120px;
    object-fit: contain;
    margin-bottom: 10px;
}
.car-brand-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
    margin: 0;
}
</style>

<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Load car brands for carousel
    fetch('api/car-brands-carousel.php?action=list')
        .then(r => r.json())
        .then(data => {
            if (data.success && data.brands.length > 0) {
                const wrapper = document.getElementById('car-brands-wrapper');
                wrapper.innerHTML = data.brands.map(brand => {
                    const logoUrl = brand.logo?.localThumb 
                        ? `car-logos-dataset-master/logos/${brand.logo.localThumb.replace('./', '')}`
                        : (brand.logo?.thumb || brand.logo?.optimized || '');
                    
                    return `
                        <div class="swiper-slide">
                            <div class="car-brand-item" data-brand="${escapeHtml(brand.brand_name)}">
                                ${logoUrl ? `
                                    <img src="${logoUrl}" alt="${escapeHtml(brand.brand_name)}" 
                                         class="car-brand-logo"
                                         loading="lazy"
                                         onerror="this.style.display='none'"
                                         onload="trackCarouselImageLoad('${escapeHtml(brand.brand_name)}')">
                                ` : ''}
                                <p class="car-brand-name">${escapeHtml(brand.brand_name)}</p>
                            </div>
                        </div>
                    `;
                }).join('');
                
                // Initialize Swiper with analytics tracking
                const swiper = new Swiper('.car-brands-swiper', {
                    slidesPerView: 2,
                    spaceBetween: 20,
                    autoplay: {
                        delay: 3000,
                        disableOnInteraction: false,
                    },
                    loop: true,
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                    },
                    breakpoints: {
                        640: {
                            slidesPerView: 3,
                            spaceBetween: 20,
                        },
                        768: {
                            slidesPerView: 4,
                            spaceBetween: 30,
                        },
                        1024: {
                            slidesPerView: 5,
                            spaceBetween: 40,
                        },
                    },
                    on: {
                        slideChange: function() {
                            trackCarouselSlideChange(this.activeIndex);
                        },
                        click: function(swiper, event) {
                            const brandItem = event.target.closest('.car-brand-item');
                            if (brandItem) {
                                const brandName = brandItem.getAttribute('data-brand');
                                trackCarouselClick(brandName);
                            }
                        }
                    }
                });
                
                // Track pagination clicks
                document.querySelectorAll('.swiper-pagination-bullet').forEach(bullet => {
                    bullet.addEventListener('click', function() {
                        trackCarouselPaginationClick();
                    });
                });
            } else {
                document.getElementById('car-brands-wrapper').innerHTML = 
                    '<div class="swiper-slide text-center"><p class="text-muted">No brands configured</p></div>';
            }
        })
        .catch(err => {
            console.error('Error loading car brands:', err);
            document.getElementById('car-brands-wrapper').innerHTML = 
                '<div class="swiper-slide text-center"><p class="text-muted">Error loading brands</p></div>';
        });
    
    function escapeHtml(text) {
        if (!text) return '';
        const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    }
    
    // Analytics tracking functions
    function trackCarouselImageLoad(brandName) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'carousel_image_load', {
                'event_category': 'Car Brands Carousel',
                'event_label': brandName,
                'value': 1
            });
        }
        // Also log to console in development
        if (typeof console !== 'undefined' && console.log) {
            console.log('Carousel image loaded:', brandName);
        }
    }
    
    function trackCarouselSlideChange(activeIndex) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'carousel_slide_change', {
                'event_category': 'Car Brands Carousel',
                'event_label': 'Slide ' + activeIndex,
                'value': activeIndex
            });
        }
    }
    
    function trackCarouselClick(brandName) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'carousel_brand_click', {
                'event_category': 'Car Brands Carousel',
                'event_label': brandName,
                'value': 1
            });
        }
    }
    
    function trackCarouselPaginationClick() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'carousel_pagination_click', {
                'event_category': 'Car Brands Carousel',
                'value': 1
            });
        }
    }
    
    // Make functions globally available
    window.trackCarouselImageLoad = trackCarouselImageLoad;
    window.trackCarouselSlideChange = trackCarouselSlideChange;
    window.trackCarouselClick = trackCarouselClick;
    window.trackCarouselPaginationClick = trackCarouselPaginationClick;
});
</script>

