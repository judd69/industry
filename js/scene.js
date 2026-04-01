const Scene3D = {
    scene: null,
    camera: null,
    renderer: null,
    container: null,
    clock: null,
    assemblies: {},
    currentSection: 0,
    scrollProgress: 0,
    targetCameraPos: { x: 0, y: 0, z: 12 },
    targetLookAt: { x: 0, y: 0, z: 0 },
    ambientLight: null,
    lights: [],
    mouse: { x: 0, y: 0 },
    isMobile: false,

    init() {
        this.container = document.getElementById('canvas-container');
        this.isMobile = window.innerWidth < 768;
        this.clock = new THREE.Clock();

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.025);

        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 12);

        const pixelRatio = this.isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
        this.renderer = new THREE.WebGLRenderer({
            antialias: !this.isMobile,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setClearColor(0x0a0a0a, 1);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.container.appendChild(this.renderer.domElement);

        this.setupLights();
        this.setupGeometries();

        ParticleSystem.init(this.scene);

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        this.animate();
    },

    setupLights() {
        this.ambientLight = new THREE.AmbientLight(0x404060, 0.4);
        this.scene.add(this.ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffeedd, 1.2);
        keyLight.position.set(5, 8, 5);
        keyLight.castShadow = false;
        this.scene.add(keyLight);
        this.lights.push(keyLight);

        const fillLight = new THREE.DirectionalLight(0x6688cc, 0.5);
        fillLight.position.set(-5, 3, -3);
        this.scene.add(fillLight);
        this.lights.push(fillLight);

        const rimLight = new THREE.PointLight(0xff6b35, 1.5, 20);
        rimLight.position.set(-4, -2, 6);
        this.scene.add(rimLight);
        this.lights.push(rimLight);

        const tealLight = new THREE.PointLight(0x4ecdc4, 0.8, 15);
        tealLight.position.set(4, 3, -4);
        this.scene.add(tealLight);
        this.lights.push(tealLight);

        const backLight = new THREE.PointLight(0xb87333, 0.6, 20);
        backLight.position.set(0, -5, -8);
        this.scene.add(backLight);
        this.lights.push(backLight);
    },

    setupGeometries() {
        MechanicalGeometries.init();

        const gears = MechanicalGeometries.createGearAssembly();
        gears.scale.set(0.8, 0.8, 0.8);
        gears.position.set(3, 0, 0);
        gears.visible = true;
        this.scene.add(gears);
        this.assemblies.gears = gears;

        const pipes = MechanicalGeometries.createPipeNetwork();
        pipes.scale.set(0.7, 0.7, 0.7);
        pipes.position.set(0, 0, -5);
        pipes.visible = false;
        this.scene.add(pipes);
        this.assemblies.pipes = pipes;

        const valve = MechanicalGeometries.createValve();
        valve.scale.set(1.2, 1.2, 1.2);
        valve.position.set(4, 0, 0);
        valve.visible = false;
        this.scene.add(valve);
        this.assemblies.valve = valve;

        const turbine = MechanicalGeometries.createTurbine();
        turbine.scale.set(0.9, 0.9, 0.9);
        turbine.position.set(-3, 0, -2);
        turbine.visible = false;
        this.scene.add(turbine);
        this.assemblies.turbine = turbine;

        const flange = MechanicalGeometries.createFlangeAssembly();
        flange.scale.set(1.0, 1.0, 1.0);
        flange.position.set(0, 0, 0);
        flange.visible = false;
        this.scene.add(flange);
        this.assemblies.flange = flange;
    },

    setScrollProgress(progress) {
        this.scrollProgress = progress;
        const sectionCount = 6;
        const sectionProgress = progress * sectionCount;
        const sectionIndex = Math.min(Math.floor(sectionProgress), sectionCount - 1);
        const localProgress = sectionProgress - sectionIndex;

        this.updateSceneForSection(sectionIndex, localProgress);
    },

    updateSceneForSection(section, progress) {
        Object.values(this.assemblies).forEach(a => {
            a.visible = false;
        });

        const rightOffset = this.isMobile ? 0 : 3;

        switch(section) {
            case 0: // Hero
                this.assemblies.gears.visible = true;
                this.assemblies.gears.position.set(rightOffset + 1, 0, 0);
                this.targetCameraPos = {
                    x: 0 + this.mouse.x * 0.5,
                    y: 0 + this.mouse.y * 0.3,
                    z: 12 - progress * 2
                };
                this.targetLookAt = { x: rightOffset, y: 0, z: 0 };
                this.assemblies.gears.rotation.y = progress * 0.5;
                break;

            case 1: // About
                this.assemblies.pipes.visible = true;
                this.assemblies.pipes.position.set(rightOffset, 0, -5 + progress * 5);
                this.targetCameraPos = {
                    x: -1 + progress * 2 + this.mouse.x * 0.3,
                    y: 0.5 + this.mouse.y * 0.3,
                    z: 9 - progress * 2
                };
                this.targetLookAt = { x: rightOffset - 1, y: 0, z: -2 + progress * 2 };
                this.assemblies.pipes.rotation.y = progress * Math.PI * 0.3;
                break;

            case 2: // Products
                this.assemblies.valve.visible = true;
                this.assemblies.valve.position.set(rightOffset + 1, 0, 0);
                this.targetCameraPos = {
                    x: 0 + this.mouse.x * 0.4,
                    y: 0.5 - progress * 0.3 + this.mouse.y * 0.3,
                    z: 8
                };
                this.targetLookAt = { x: rightOffset - 1, y: 0, z: 0 };
                this.assemblies.valve.rotation.y = progress * Math.PI * 0.5;

                this.assemblies.valve.traverse(child => {
                    if (child.userData.isDisc) {
                        child.rotation.y = progress * Math.PI * 0.4;
                    }
                });
                break;

            case 3: // Industries
                this.assemblies.turbine.visible = true;
                this.assemblies.gears.visible = true;
                this.assemblies.turbine.position.set(rightOffset - 1, 1, -2 + progress);
                this.assemblies.gears.position.set(rightOffset + 2, -1, 0);
                this.targetCameraPos = {
                    x: this.mouse.x * 0.5,
                    y: 1 - progress * 0.5 + this.mouse.y * 0.3,
                    z: 11
                };
                this.targetLookAt = { x: rightOffset - 1, y: 0, z: -1 };
                break;

            case 4: // Quality
                this.assemblies.flange.visible = true;
                this.assemblies.flange.position.set(rightOffset + 1, 0, 0);
                this.targetCameraPos = {
                    x: 0 + this.mouse.x * 0.3,
                    y: 0 + this.mouse.y * 0.3,
                    z: 6 + progress * 2
                };
                this.targetLookAt = { x: rightOffset - 1, y: 0, z: 0 };
                this.assemblies.flange.rotation.x = progress * Math.PI * 0.2;
                this.assemblies.flange.rotation.y = progress * Math.PI * 0.5;
                break;

            case 5: // Contact
                this.assemblies.gears.visible = true;
                this.assemblies.pipes.visible = true;
                this.assemblies.valve.visible = true;
                this.assemblies.turbine.visible = true;
                this.assemblies.flange.visible = true;

                this.assemblies.gears.position.set(rightOffset + 2, 3 - progress, 0);
                this.assemblies.pipes.position.set(rightOffset - 2, -2, -3);
                this.assemblies.valve.position.set(rightOffset + 3, -1, 2);
                this.assemblies.turbine.position.set(rightOffset - 3, 2, -4);
                this.assemblies.flange.position.set(rightOffset, -3, -2);

                this.targetCameraPos = {
                    x: this.mouse.x * 0.8,
                    y: this.mouse.y * 0.5,
                    z: 16 + progress * 3
                };
                this.targetLookAt = { x: rightOffset - 2, y: 0, z: 0 };
                break;
        }
    },

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime() * 1000;

        this.camera.position.x += (this.targetCameraPos.x - this.camera.position.x) * 0.04;
        this.camera.position.y += (this.targetCameraPos.y - this.camera.position.y) * 0.04;
        this.camera.position.z += (this.targetCameraPos.z - this.camera.position.z) * 0.04;

        const lookTarget = new THREE.Vector3(this.targetLookAt.x, this.targetLookAt.y, this.targetLookAt.z);
        this.camera.lookAt(lookTarget);

        Object.values(this.assemblies).forEach(assembly => {
            if (assembly.visible) {
                MechanicalGeometries.updateRotations(assembly, delta);
            }
        });

        if (this.assemblies.turbine.visible) {
            this.assemblies.turbine.children.forEach(child => {
                if (!child.userData.rotationSpeed) return;
            });
            this.assemblies.turbine.rotation.z += 0.008;
        }

        ParticleSystem.update(this.scrollProgress, time);

        this.lights[2].position.x = Math.sin(time * 0.001) * 5;
        this.lights[2].position.y = Math.cos(time * 0.0013) * 3;

        this.lights[3].position.x = Math.cos(time * 0.0008) * 5;
        this.lights[3].position.z = Math.sin(time * 0.001) * 4;

        this.renderer.render(this.scene, this.camera);
    },

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        const pixelRatio = this.isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(pixelRatio);
    }
};
