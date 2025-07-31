import { SocialReelCarousel } from './components/SocialReelCarousel.js';
console.log('✅ App initialized.');

// ScrollReveal animations for Hybrid Dancers site
// Applies fade-in on hero content, slide-up on cards, and delayed Instagram reveal

function createToastContainer() {
    if (document.getElementById('toast-container')) return;
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
}

// Display a brief message in the lower-right corner
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
        toast.classList.remove('visible');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

window.showToast = showToast;

document.addEventListener('DOMContentLoaded', () => {
    createToastContainer();

    const carouselEl = document.getElementById('reel-carousel');
    if (carouselEl) {
        const reelUrls = [
            'https://www.instagram.com/p/CyGZc8UPL2g',
            'https://www.instagram.com/p/CyDyapCrkYZ',
            'https://www.instagram.com/p/Cx7OPawrQxt'
        ];
        const startCarousel = () => {
            SocialReelCarousel(carouselEl, reelUrls).catch(() => {
                const fb = document.getElementById('reel-fallback');
                if (fb) fb.style.display = 'block';
            });
        };
        const section = document.getElementById('latest-reels');
        if ('IntersectionObserver' in window && section) {
            const ob = new IntersectionObserver((entries, o) => {
                if (entries[0].isIntersecting) {
                    startCarousel();
                    o.disconnect();
                }
            }, { rootMargin: '0px 0px 200px 0px' });
            ob.observe(section);
        } else {
            startCarousel();
        }
    }

    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({ distance: '40px', duration: 800, easing: 'ease-out', cleanup: true });
        sr.reveal('.hero-content', { opacity: 0, duration: 1000 });
        sr.reveal('.class-card', { origin: 'bottom', interval: 100 });
        sr.reveal('.pricing-card', { origin: 'bottom', interval: 100 });
        sr.reveal('.instagram-feed', { delay: 300, origin: 'bottom' });
        sr.reveal('.latest-reels', { delay: 300, origin: 'bottom' });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Header background change on scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(44, 44, 44, 0.98)';
            header.style.borderBottom = '1px solid rgba(255, 198, 39, 0.4)';
        } else {
            header.style.background = 'rgba(44, 44, 44, 0.95)';
            header.style.borderBottom = '1px solid rgba(255, 198, 39, 0.2)';
        }
    });

    // Mobile menu toggle
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Animate hamburger menu
            const spans = mobileMenu.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (navLinks.classList.contains('active')) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                }
            });
        });

        // Close mobile menu when clicking on a link
        navLinks.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                const spans = mobileMenu.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                });
            }
        });
    }

    // Service card interactions
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    document.querySelectorAll('.service-card, .community-card, .about-text, .about-image').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // CTA button effects
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
        });
    });

    // Calendly fallback handling and click tracking
    const fallback = document.getElementById('calendly-fallback');
    const widget = document.getElementById('calendly-widget');
    if (fallback && widget) {
        const obs = new MutationObserver(() => {
            if (widget.querySelector('iframe')) {
                fallback.style.display = 'none';
                obs.disconnect();
            }
        });
        obs.observe(widget, { childList: true });
        setTimeout(() => obs.disconnect(), 10000);

        const link = fallback.querySelector('a');
        if (link) {
            link.addEventListener('click', () => {
                fetch('/api/logs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'booking_link_click', details: 'index_schedule' })
                }).catch(() => {});
            });
        }
    }

    // Lazy load social embeds
    const lazyEmbeds = document.querySelectorAll('.lazy-embed, .tiktok-embed, .fb-page');
    if (lazyEmbeds.length) {
        const loadScript = (src) => {
            if (document.querySelector(`script[src="${src}"]`)) return;
            const s = document.createElement('script');
            s.src = src;
            s.defer = true;
            document.body.appendChild(s);
        };

        const embedObserver = new IntersectionObserver((entries, obsr) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    if (el.classList.contains('lazy-embed')) {
                        el.src = el.dataset.embedSrc;
                    } else if (el.classList.contains('tiktok-embed')) {
                        loadScript('https://www.tiktok.com/embed.js');
                    } else if (el.classList.contains('fb-page')) {
                        loadScript('https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v17.0');
                    }
                    obsr.unobserve(el);
                }
            });
        }, { rootMargin: '0px 0px 200px 0px' });
        lazyEmbeds.forEach(el => embedObserver.observe(el));
    }
});
