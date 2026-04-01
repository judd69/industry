const CustomCursor = {
    el: null,
    dot: null,
    ring: null,
    text: null,
    pos: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    isMobile: false,

    init() {
        this.isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
        if (this.isMobile) return;

        this.el = document.getElementById('cursor');
        this.dot = this.el.querySelector('.cursor-dot');
        this.ring = this.el.querySelector('.cursor-ring');
        this.text = this.el.querySelector('.cursor-text');

        document.addEventListener('mousemove', (e) => {
            this.target.x = e.clientX;
            this.target.y = e.clientY;
        });

        const hoverables = document.querySelectorAll('a, button, .product-card, .industry-card, .nav-link, .mobile-link, .indicator-dot');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.el.classList.add('hovering');
                this.text.textContent = 'VIEW';
            });
            el.addEventListener('mouseleave', () => {
                this.el.classList.remove('hovering');
                this.text.textContent = '';
            });
        });

        this.animate();
    },

    animate() {
        if (this.isMobile) return;

        this.pos.x += (this.target.x - this.pos.x) * 0.15;
        this.pos.y += (this.target.y - this.pos.y) * 0.15;

        this.el.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;

        requestAnimationFrame(() => this.animate());
    }
};
