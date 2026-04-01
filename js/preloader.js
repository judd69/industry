const Preloader = {
    el: document.getElementById('preloader'),
    percent: document.getElementById('preloader-percent'),
    status: document.getElementById('preloader-status'),
    barFill: document.getElementById('preloader-bar-fill'),
    progress: 0,
    targetProgress: 0,
    statusMessages: [
        { at: 0, text: 'INITIALIZING SYSTEMS' },
        { at: 20, text: 'LOADING 3D ENGINE' },
        { at: 40, text: 'GENERATING GEOMETRY' },
        { at: 60, text: 'CALIBRATING PARTICLES' },
        { at: 80, text: 'ASSEMBLING COMPONENTS' },
        { at: 95, text: 'SYSTEM READY' }
    ],
    onComplete: null,

    init() {
        this.simulateLoading();
    },

    simulateLoading() {
        const steps = [
            { delay: 200, target: 15 },
            { delay: 600, target: 35 },
            { delay: 1000, target: 50 },
            { delay: 1400, target: 65 },
            { delay: 1800, target: 80 },
            { delay: 2200, target: 92 },
            { delay: 2600, target: 100 }
        ];

        steps.forEach(step => {
            setTimeout(() => {
                this.targetProgress = step.target;
            }, step.delay);
        });

        this.animate();
    },

    animate() {
        if (this.progress < this.targetProgress) {
            this.progress += (this.targetProgress - this.progress) * 0.08;
            if (this.targetProgress - this.progress < 0.5) {
                this.progress = this.targetProgress;
            }
        }

        const rounded = Math.round(this.progress);
        this.percent.textContent = rounded + '%';
        this.barFill.style.width = rounded + '%';

        const msg = [...this.statusMessages].reverse().find(m => rounded >= m.at);
        if (msg) this.status.textContent = msg.text;

        if (rounded >= 100) {
            setTimeout(() => this.complete(), 400);
            return;
        }

        requestAnimationFrame(() => this.animate());
    },

    complete() {
        gsap.to(this.el, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                this.el.classList.add('done');
                this.el.style.display = 'none';
                if (this.onComplete) this.onComplete();
            }
        });
    }
};
