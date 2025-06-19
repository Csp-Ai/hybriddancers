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

    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({ distance: '40px', duration: 800, easing: 'ease-out', cleanup: true });
        sr.reveal('.hero-content', { opacity: 0, duration: 1000 });
        sr.reveal('.class-card', { origin: 'bottom', interval: 100 });
        sr.reveal('.pricing-card', { origin: 'bottom', interval: 100 });
        sr.reveal('.instagram-feed', { delay: 300, origin: 'bottom' });
        sr.reveal('.instagram-reels', { delay: 300, origin: 'bottom' });
    }
});
