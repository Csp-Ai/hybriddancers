// ScrollReveal animations for Hybrid Dancers site
// Applies fade-in on hero content, slide-up on cards, and delayed Instagram reveal

document.addEventListener('DOMContentLoaded', () => {
    if (typeof ScrollReveal === 'undefined') return;

    const sr = ScrollReveal({ distance: '40px', duration: 800, easing: 'ease-out', cleanup: true });

    sr.reveal('.hero-content', { opacity: 0, duration: 1000 });
    sr.reveal('.class-card', { origin: 'bottom', interval: 100 });
    sr.reveal('.pricing-card', { origin: 'bottom', interval: 100 });
    sr.reveal('.instagram-feed', { delay: 300, origin: 'bottom' });
    sr.reveal('.instagram-reels', { delay: 300, origin: 'bottom' });
});
