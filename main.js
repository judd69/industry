(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  let mouse = { x: 0, y: 0, rawX: 0, rawY: 0 };
  let cursorRingPos = { x: 0, y: 0 };
  let isLoaded = false;
  let heroScene, heroCamera, heroRenderer, heroParticles, heroFrame;
  let aboutScene, aboutCamera, aboutRenderer, aboutMesh, aboutFrame;

  function initNoise() {
    const canvas = $('#noise-canvas');
    const ctx = canvas.getContext('2d');
    let frame = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function drawNoise() {
      frame++;
      if (frame % 2 === 0) {
        const { width, height } = canvas;
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const v = Math.random() * 255;
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
      }
      requestAnimationFrame(drawNoise);
    }
    drawNoise();
  }

  function initCursor() {
    const dot = $('#cursor-dot');
    const ring = $('#cursor-ring');

    window.addEventListener('mousemove', (e) => {
      mouse.rawX = e.clientX;
      mouse.rawY = e.clientY;
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
    });

    function animateCursor() {
      cursorRingPos.x = lerp(cursorRingPos.x, mouse.rawX, 0.1);
      cursorRingPos.y = lerp(cursorRingPos.y, mouse.rawY, 0.1);
      ring.style.left = cursorRingPos.x + 'px';
      ring.style.top = cursorRingPos.y + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('.magnetic, .nav-link, .filter-btn').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  function initPreloader() {
    return new Promise((resolve) => {
      const preloader = $('#preloader');
      const bar = $('#preloader-bar');
      const num = $('#preloader-num');
      let count = 0;
      const target = 100;
      const duration = 2200;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        count = Math.floor(eased * target);
        bar.style.width = count + '%';
        num.textContent = count;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          num.textContent = '100';
          bar.style.width = '100%';
          setTimeout(() => {
            preloader.classList.add('hidden');
            resolve();
          }, 400);
        }
      }

      requestAnimationFrame(update);
    });
  }

  function initHeroCanvas() {
    const canvas = $('#hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    heroRenderer.setSize(W, H);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    heroRenderer.setClearColor(0x000000, 0);

    heroScene = new THREE.Scene();
    heroCamera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    heroCamera.position.set(0, 0, 80);

    const count = 12000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.random();

      if (r < 0.35) {
        const angle = Math.random() * Math.PI * 2;
        const torusR = 30 + (Math.random() - 0.5) * 8;
        const tubeR = (Math.random() - 0.5) * 5;
        positions[i3]     = Math.cos(angle) * torusR + tubeR;
        positions[i3 + 1] = Math.sin(angle) * torusR + tubeR;
        positions[i3 + 2] = (Math.random() - 0.5) * 10;
      } else if (r < 0.55) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * Math.PI * 2;
        const rad = 12 + Math.random() * 5;
        positions[i3]     = rad * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = rad * Math.cos(phi);
      } else {
        positions[i3]     = (Math.random() - 0.5) * 200;
        positions[i3 + 1] = (Math.random() - 0.5) * 200;
        positions[i3 + 2] = (Math.random() - 0.5) * 180;
      }

      const hue = Math.random();
      if (hue < 0.5) {
        colors[i3] = 0.0 + Math.random() * 0.1;
        colors[i3 + 1] = 0.85 + Math.random() * 0.15;
        colors[i3 + 2] = 0.95 + Math.random() * 0.05;
      } else if (hue < 0.8) {
        colors[i3] = 0.0;
        colors[i3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i3 + 2] = 0.6 + Math.random() * 0.4;
      } else {
        colors[i3] = 0.3 + Math.random() * 0.3;
        colors[i3 + 1] = 0.3 + Math.random() * 0.3;
        colors[i3 + 2] = 0.5 + Math.random() * 0.5;
      }

      sizes[i] = Math.random() * 2.5 + 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uTime;
        uniform vec2 uMouse;
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.x += sin(pos.y * 0.04 + uTime * 0.3) * 1.5;
          pos.y += cos(pos.x * 0.04 + uTime * 0.25) * 1.5;
          pos.z += sin(pos.x * 0.03 + uTime * 0.2) * 1.0;
          pos.x += uMouse.x * (pos.z * 0.02 + 1.0) * 4.0;
          pos.y += uMouse.y * (pos.z * 0.02 + 1.0) * 4.0;
          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (200.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float dist = length(uv);
          if (dist > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
          gl_FragColor = vec4(vColor, alpha * 0.85);
        }
      `,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    heroParticles = new THREE.Points(geo, mat);
    heroScene.add(heroParticles);

    const glowGeo = new THREE.SphereGeometry(10, 32, 32);
    const glowMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPos = position;
          vec3 pos = position;
          pos += normal * sin(uTime * 1.5 + position.y * 0.5) * 0.8;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPos;
        uniform float uTime;
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          vec3 cyan = vec3(0.0, 0.96, 1.0);
          vec3 teal = vec3(0.0, 0.83, 0.67);
          vec3 col = mix(teal, cyan, sin(uTime * 0.5) * 0.5 + 0.5);
          gl_FragColor = vec4(col * fresnel * 1.5, fresnel * 0.5);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowSphere = new THREE.Mesh(glowGeo, glowMat);
    heroScene.add(glowSphere);

    window.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      heroCamera.aspect = W / H;
      heroCamera.updateProjectionMatrix();
      heroRenderer.setSize(W, H);
    });

    let clock = 0;
    function heroAnimate() {
      heroFrame = requestAnimationFrame(heroAnimate);
      clock += 0.008;

      mat.uniforms.uTime.value = clock;
      glowMat.uniforms.uTime.value = clock;
      mat.uniforms.uMouse.value.set(
        lerp(mat.uniforms.uMouse.value.x, mouse.x, 0.04),
        lerp(mat.uniforms.uMouse.value.y, mouse.y, 0.04)
      );

      heroParticles.rotation.y = clock * 0.04;
      heroParticles.rotation.x = clock * 0.02;
      glowSphere.rotation.y = clock * 0.3;
      glowSphere.rotation.x = clock * 0.2;

      heroCamera.position.x = lerp(heroCamera.position.x, mouse.x * 8, 0.03);
      heroCamera.position.y = lerp(heroCamera.position.y, mouse.y * 5, 0.03);
      heroCamera.lookAt(0, 0, 0);

      heroRenderer.render(heroScene, heroCamera);
    }
    heroAnimate();
  }

  function initAboutCanvas() {
    const canvas = $('#about-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, frame = 0;

    function resize() {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * (window.devicePixelRatio || 1);
      canvas.height = h * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }
    resize();

    function draw() {
      frame++;
      ctx.clearRect(0, 0, w, h);

      const t = frame * 0.02;
      const numStrands = 2;
      const points = 80;

      for (let s = 0; s < numStrands; s++) {
        const phaseOffset = (s / numStrands) * Math.PI;
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const px = (i / points) * w;
          const wave = Math.sin((i / points) * Math.PI * 4 + t + phaseOffset);
          const py = h / 2 + wave * (h * 0.25);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, 'rgba(0,212,170,0.1)');
        grad.addColorStop(0.5, 'rgba(0,245,255,0.7)');
        grad.addColorStop(1, 'rgba(0,100,255,0.1)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        for (let i = 0; i <= points; i += 4) {
          const px = (i / points) * w;
          const wave = Math.sin((i / points) * Math.PI * 4 + t + phaseOffset);
          const py = h / 2 + wave * (h * 0.25);
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          const alpha = (Math.sin(t + i * 0.3) * 0.5 + 0.5) * 0.8 + 0.2;
          ctx.fillStyle = s === 0
            ? `rgba(0,245,255,${alpha})`
            : `rgba(0,212,170,${alpha})`;
          ctx.fill();
        }

        if (s === 1) {
          for (let i = 0; i <= points; i += 8) {
            const px = (i / points) * w;
            const wave0 = Math.sin((i / points) * Math.PI * 4 + t);
            const py0 = h / 2 + wave0 * (h * 0.25);
            const wave1 = Math.sin((i / points) * Math.PI * 4 + t + Math.PI);
            const py1 = h / 2 + wave1 * (h * 0.25);
            const alpha = 0.07 + Math.abs(Math.sin(t + i)) * 0.08;
            ctx.beginPath();
            ctx.moveTo(px, py0);
            ctx.lineTo(px, py1);
            ctx.strokeStyle = `rgba(0,245,255,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  function initReveal() {
    const items = $$('.reveal-item');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(el => observer.observe(el));
  }

  function initCounters() {
    const stats = $$('.stat-num');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          let start = 0;
          const dur = 1600;
          const startTime = performance.now();
          function tick(now) {
            const progress = clamp((now - startTime) / dur, 0, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(ease * target);
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target + '+';
          }
          requestAnimationFrame(tick);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach(el => observer.observe(el));
  }

  function initNav() {
    const nav = $('#nav');
    const sections = ['home', 'work', 'about', 'contact'];
    const navLinks = $$('.nav-link');

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const target = link.dataset.target;
        const section = $('#' + target);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    const heroCta = $('#hero-cta-btn');
    if (heroCta) {
      heroCta.addEventListener('click', () => {
        $('#work').scrollIntoView({ behavior: 'smooth' });
      });
    }

    const navLogo = $('.nav-logo');
    if (navLogo) {
      navLogo.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    const sectionEls = sections.map(id => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(l => {
            l.classList.toggle('active', l.dataset.target === entry.target.id);
          });
        }
      });
    }, { threshold: 0.4 });
    sectionEls.forEach(el => io.observe(el));
  }

  function initWorkFilter() {
    const filters = $$('.filter-btn');
    const cards = $$('.work-card');

    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        cards.forEach(card => {
          const show = filter === 'all' || card.dataset.filter === filter;
          card.style.transition = 'opacity 0.4s, transform 0.4s';
          card.style.opacity = show ? '1' : '0.1';
          card.style.transform = show ? 'scale(1)' : 'scale(0.97)';
        });
      });
    });
  }

  function initMagnetic() {
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.35;
        const dy = (e.clientY - cy) * 0.35;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  function initGlitch() {
    const headline = $('.hero-headline');
    if (!headline) return;

    setInterval(() => {
      if (Math.random() > 0.85) {
        headline.style.filter = 'blur(1px)';
        headline.style.transform = `skewX(${(Math.random() - 0.5) * 2}deg)`;
        setTimeout(() => {
          headline.style.filter = '';
          headline.style.transform = '';
        }, 80);
      }
    }, 3000);
  }

  function revealHero() {
    const content = $('.hero-content');
    if (content) content.classList.add('revealed');
    const hint = $('.hero-scroll-hint');
    const year = $('.hero-year');
    if (hint) hint.classList.add('show');
    if (year) year.classList.add('show');
    $('#audio-ui') && ($('#audio-ui').classList.add('visible'));
  }

  function initCardGlows() {
    $$('.work-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    });
  }

  async function init() {
    initNoise();
    initCursor();

    await initPreloader();
    isLoaded = true;

    initHeroCanvas();
    initAboutCanvas();
    initReveal();
    initCounters();
    initNav();
    initWorkFilter();
    initMagnetic();
    initGlitch();
    initCardGlows();

    setTimeout(revealHero, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
