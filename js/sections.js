const Sections = {
    sections: [],
    sectionNames: ['hero', 'about', 'products', 'industries', 'quality', 'contact'],
    currentIndex: 0,
    countersAnimated: false,
    indicators: [],
    navLinks: [],

    init() {
        this.sections = this.sectionNames.map(name =>
            document.getElementById('section-' + name)
        );
        this.indicators = document.querySelectorAll('.indicator-dot');
        this.navLinks = document.querySelectorAll('.nav-link');

        this.indicators.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                this.scrollToSection(i);
            });
        });

        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionName = link.dataset.section;
                const index = this.sectionNames.indexOf(sectionName);
                if (index !== -1) this.scrollToSection(index);
            });
        });

        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionName = link.dataset.section;
                const index = this.sectionNames.indexOf(sectionName);
                if (index !== -1) {
                    this.scrollToSection(index);
                    document.getElementById('mobile-menu').classList.remove('open');
                    document.getElementById('nav-menu-btn').classList.remove('open');
                }
            });
        });
    },

    scrollToSection(index) {
        const scrollSpacer = document.getElementById('scroll-spacer');
        const totalHeight = scrollSpacer.scrollHeight - window.innerHeight;
        const targetScroll = (index / this.sectionNames.length) * totalHeight;

        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    },

    updateFromScroll(progress) {
        const sectionCount = this.sectionNames.length;
        const sectionProgress = progress * sectionCount;
        const newIndex = Math.min(Math.floor(sectionProgress), sectionCount - 1);

        if (newIndex !== this.currentIndex) {
            this.currentIndex = newIndex;
            this.onSectionChange(newIndex);
        }

        this.sections.forEach((section, i) => {
            if (i === this.currentIndex) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        this.indicators.forEach((dot, i) => {
            if (i === this.currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        this.navLinks.forEach(link => {
            const name = link.dataset.section;
            if (name === this.sectionNames[this.currentIndex]) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        document.getElementById('scroll-progress-fill').style.width = (progress * 100) + '%';
    },

    animateHeroIn() {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.to('.hero-overline', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.2
        })
        .to('.title-word', {
            y: 0,
            duration: 1,
            stagger: 0.12,
            ease: 'power4.out'
        }, '-=0.5')
        .to('.hero-subtitle', {
            opacity: 1,
            y: 0,
            duration: 0.8
        }, '-=0.4')
        .to('.hero-scroll-indicator', {
            opacity: 1,
            duration: 0.6
        }, '-=0.2');
    },

    onSectionChange(index) {
        if (index === 1 && !this.countersAnimated) {
            this.countersAnimated = true;
            this.animateCounters();
        }
    },

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.count);
            const obj = { val: 0 };
            gsap.to(obj, {
                val: target,
                duration: 2,
                ease: 'power2.out',
                onUpdate: () => {
                    counter.textContent = Math.round(obj.val);
                }
            });
        });
    }
};
