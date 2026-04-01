const App = {
    init() {
        const menuBtn = document.getElementById('nav-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });

        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', x + '%');
                card.style.setProperty('--mouse-y', y + '%');
            });
        });

        document.getElementById('nav-logo').addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        Preloader.onComplete = () => {
            this.startExperience();
        };

        Preloader.init();
    },

    startExperience() {
        Scene3D.init();
        Sections.init();
        ScrollController.init();
        CustomCursor.init();
        Sections.animateHeroIn();

        const heroSection = document.getElementById('section-hero');
        heroSection.classList.add('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
