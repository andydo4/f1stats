document.addEventListener('DOMContentLoaded', () => {
    const intro = document.getElementById('intro');
    const loadingBar = document.querySelector('.loading-bar');
    const carSvg = document.querySelector('.car-svg');

    // Start the loading bar and car animations
    loadingBar.style.animationPlayState = 'running';
    carSvg.style.animationPlayState = 'running';

    // Hide the intro after the loading bar animation completes
    setTimeout(() => {
        intro.classList.add('hidden');
    }, 2000); // Adjust the duration to match the loading bar animation duration
});