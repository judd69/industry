const ScrollController = {
    scrollProgress: 0,
    smoothProgress: 0,
    isInitialized: false,

    init() {
        this.setupScrollListener();
        this.isInitialized = true;
    },

    setupScrollListener() {
        window.addEventListener('scroll', () => {
            this.onScroll();
        }, { passive: true });

        this.smoothUpdate();
    },

    onScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.getElementById('scroll-spacer').scrollHeight - window.innerHeight;
        this.scrollProgress = Math.max(0, Math.min(1, scrollTop / scrollHeight));
    },

    smoothUpdate() {
        this.smoothProgress += (this.scrollProgress - this.smoothProgress) * 0.08;

        if (Math.abs(this.scrollProgress - this.smoothProgress) > 0.0001) {
            Scene3D.setScrollProgress(this.smoothProgress);
            Sections.updateFromScroll(this.smoothProgress);
            ParticleSystem.setDensity(this.smoothProgress);
        }

        requestAnimationFrame(() => this.smoothUpdate());
    }
};
