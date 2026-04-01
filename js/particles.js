const ParticleSystem = {
    gridGroup: null,
    sparks: null,
    sparkCount: 200,
    sparkPositions: null,
    sparkVelocities: null,
    sparkColors: null,
    sparkGeometry: null,
    sparkMaterial: null,
    scanLine: null,
    scanLineY: 5,
    dataPaths: null,
    mouse: { x: 0, y: 0 },
    isMobile: false,

    init(scene) {
        this.isMobile = window.innerWidth < 768;

        this.createFloorGrid(scene);
        this.createSparks(scene);
        this.createScanLine(scene);
        this.createDataPaths(scene);

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    },

    createFloorGrid(scene) {
        this.gridGroup = new THREE.Group();

        const gridMat = new THREE.LineBasicMaterial({
            color: 0xff6b35,
            transparent: true,
            opacity: 0.06,
        });

        const gridSize = 40;
        const divisions = 40;
        const step = gridSize / divisions;

        for (let i = -gridSize / 2; i <= gridSize / 2; i += step) {
            const pointsX = [];
            pointsX.push(new THREE.Vector3(i, -5, -gridSize / 2));
            pointsX.push(new THREE.Vector3(i, -5, gridSize / 2));
            const geoX = new THREE.BufferGeometry().setFromPoints(pointsX);
            const lineX = new THREE.Line(geoX, gridMat);
            this.gridGroup.add(lineX);

            const pointsZ = [];
            pointsZ.push(new THREE.Vector3(-gridSize / 2, -5, i));
            pointsZ.push(new THREE.Vector3(gridSize / 2, -5, i));
            const geoZ = new THREE.BufferGeometry().setFromPoints(pointsZ);
            const lineZ = new THREE.Line(geoZ, gridMat);
            this.gridGroup.add(lineZ);
        }

        const accentGridMat = new THREE.LineBasicMaterial({
            color: 0x4ecdc4,
            transparent: true,
            opacity: 0.04,
        });

        const verticalLines = 8;
        for (let i = 0; i < verticalLines; i++) {
            const angle = (i / verticalLines) * Math.PI * 2;
            const radius = 12;
            const points = [];
            points.push(new THREE.Vector3(Math.cos(angle) * radius, -5, Math.sin(angle) * radius));
            points.push(new THREE.Vector3(Math.cos(angle) * radius, 8, Math.sin(angle) * radius));
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geo, accentGridMat);
            this.gridGroup.add(line);
        }

        const ringGeo = new THREE.RingGeometry(11.8, 12.2, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xff6b35,
            transparent: true,
            opacity: 0.05,
            side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -5;
        this.gridGroup.add(ring);

        scene.add(this.gridGroup);
    },

    createSparks(scene) {
        this.sparkCount = this.isMobile ? 60 : 200;
        this.sparkGeometry = new THREE.BufferGeometry();
        this.sparkPositions = new Float32Array(this.sparkCount * 3);
        this.sparkVelocities = new Float32Array(this.sparkCount * 3);
        this.sparkColors = new Float32Array(this.sparkCount * 3);

        const sparkColorPalette = [
            { r: 1.0, g: 0.55, b: 0.2 },
            { r: 1.0, g: 0.75, b: 0.4 },
            { r: 0.9, g: 0.9, b: 0.95 },
            { r: 0.72, g: 0.45, b: 0.2 },
        ];

        for (let i = 0; i < this.sparkCount; i++) {
            const i3 = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = 2 + Math.random() * 4;
            const xOff = this.isMobile ? 0 : 3;

            this.sparkPositions[i3]     = Math.cos(angle) * radius + xOff;
            this.sparkPositions[i3 + 1] = (Math.random() - 0.5) * 5;
            this.sparkPositions[i3 + 2] = Math.sin(angle) * radius;

            this.sparkVelocities[i3]     = (Math.random() - 0.5) * 0.015;
            this.sparkVelocities[i3 + 1] = Math.random() * 0.01 + 0.005;
            this.sparkVelocities[i3 + 2] = (Math.random() - 0.5) * 0.015;

            const color = sparkColorPalette[Math.floor(Math.random() * sparkColorPalette.length)];
            this.sparkColors[i3]     = color.r;
            this.sparkColors[i3 + 1] = color.g;
            this.sparkColors[i3 + 2] = color.b;
        }

        this.sparkGeometry.setAttribute('position', new THREE.BufferAttribute(this.sparkPositions, 3));
        this.sparkGeometry.setAttribute('color', new THREE.BufferAttribute(this.sparkColors, 3));

        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(255,200,120,0.8)');
        gradient.addColorStop(0.6, 'rgba(255,150,60,0.2)');
        gradient.addColorStop(1, 'rgba(255,100,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        const sparkTexture = new THREE.CanvasTexture(canvas);

        this.sparkMaterial = new THREE.PointsMaterial({
            size: this.isMobile ? 0.08 : 0.12,
            map: sparkTexture,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        });

        this.sparks = new THREE.Points(this.sparkGeometry, this.sparkMaterial);
        scene.add(this.sparks);
    },

    createScanLine(scene) {
        const scanGeo = new THREE.PlaneGeometry(50, 0.02);
        const scanMat = new THREE.MeshBasicMaterial({
            color: 0x4ecdc4,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
        });
        this.scanLine = new THREE.Mesh(scanGeo, scanMat);
        this.scanLine.position.set(0, 0, 0);
        scene.add(this.scanLine);

        const scanGlowGeo = new THREE.PlaneGeometry(50, 0.2);
        const scanGlowMat = new THREE.MeshBasicMaterial({
            color: 0x4ecdc4,
            transparent: true,
            opacity: 0.03,
            side: THREE.DoubleSide,
        });
        const scanGlow = new THREE.Mesh(scanGlowGeo, scanGlowMat);
        this.scanLine.add(scanGlow);
    },

    createDataPaths(scene) {
        this.dataPaths = new THREE.Group();
        const pathMat = new THREE.LineBasicMaterial({
            color: 0xff6b35,
            transparent: true,
            opacity: 0.08,
        });

        const nodePositions = [
            [-8, 3, -6], [-6, -2, -8], [10, 4, -5],
            [12, -1, -7], [-5, 5, -10], [8, -3, -9],
            [15, 2, -4], [-10, 0, -6], [6, 6, -8],
            [-3, -4, -7], [14, -2, -6], [-7, 4, -9],
        ];

        const connections = [
            [0, 1], [1, 5], [2, 3], [3, 6],
            [4, 0], [5, 9], [6, 10], [7, 0],
            [8, 2], [9, 1], [10, 3], [11, 4],
            [0, 2], [5, 3], [8, 6], [7, 11],
        ];

        connections.forEach(([a, b]) => {
            const points = [
                new THREE.Vector3(...nodePositions[a]),
                new THREE.Vector3(...nodePositions[b]),
            ];
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geo, pathMat);
            this.dataPaths.add(line);
        });

        const nodeMat = new THREE.MeshBasicMaterial({
            color: 0xff6b35,
            transparent: true,
            opacity: 0.15,
        });

        nodePositions.forEach(pos => {
            const nodeGeo = new THREE.SphereGeometry(0.06, 8, 8);
            const node = new THREE.Mesh(nodeGeo, nodeMat);
            node.position.set(...pos);
            this.dataPaths.add(node);
        });

        scene.add(this.dataPaths);
    },

    update(scrollProgress, time) {
        const t = time * 0.001;

        if (this.sparks) {
            const positions = this.sparkGeometry.attributes.position.array;
            const xOff = this.isMobile ? 0 : 3;

            for (let i = 0; i < this.sparkCount; i++) {
                const i3 = i * 3;

                positions[i3]     += this.sparkVelocities[i3];
                positions[i3 + 1] += this.sparkVelocities[i3 + 1];
                positions[i3 + 2] += this.sparkVelocities[i3 + 2];

                const dx = positions[i3] - xOff;
                const dz = positions[i3 + 2];
                const dist = Math.sqrt(dx * dx + dz * dz);

                if (dist > 6 || positions[i3 + 1] > 5 || positions[i3 + 1] < -5) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 1 + Math.random() * 2;
                    positions[i3]     = Math.cos(angle) * radius + xOff;
                    positions[i3 + 1] = (Math.random() - 0.5) * 2;
                    positions[i3 + 2] = Math.sin(angle) * radius;
                }
            }

            this.sparkGeometry.attributes.position.needsUpdate = true;
        }

        if (this.scanLine) {
            this.scanLineY = Math.sin(t * 0.3) * 4;
            this.scanLine.position.y = this.scanLineY;
            this.scanLine.material.opacity = 0.08 + Math.sin(t * 0.5) * 0.06;
        }

        if (this.gridGroup) {
            this.gridGroup.rotation.y = scrollProgress * Math.PI * 0.15;
        }

        if (this.dataPaths) {
            this.dataPaths.rotation.y = t * 0.02;
            this.dataPaths.children.forEach((child, i) => {
                if (child.isMesh) {
                    const pulse = Math.sin(t * 2 + i * 0.5) * 0.5 + 0.5;
                    child.material.opacity = 0.08 + pulse * 0.12;
                    child.scale.setScalar(0.8 + pulse * 0.4);
                }
            });
        }
    },

    setDensity(progress) {
        if (this.sparks) {
            const scale = 1 + progress * 0.3;
            this.sparks.scale.set(scale, scale, scale);
        }
    }
};
