const MechanicalGeometries = {
    materials: {},

    init() {
        this.materials.steel = new THREE.MeshStandardMaterial({
            color: 0x8a8a8a,
            metalness: 0.9,
            roughness: 0.25,
            envMapIntensity: 1.2
        });
        this.materials.chrome = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 1.0,
            roughness: 0.1,
            envMapIntensity: 1.5
        });
        this.materials.copper = new THREE.MeshStandardMaterial({
            color: 0xb87333,
            metalness: 0.85,
            roughness: 0.3,
            envMapIntensity: 1.0
        });
        this.materials.darkSteel = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.95,
            roughness: 0.4,
        });
        this.materials.accentOrange = new THREE.MeshStandardMaterial({
            color: 0xff6b35,
            metalness: 0.7,
            roughness: 0.3,
            emissive: 0xff6b35,
            emissiveIntensity: 0.15
        });
    },

    createGear(radius, teeth, thickness, holeRadius) {
        radius = radius || 2;
        teeth = teeth || 16;
        thickness = thickness || 0.4;
        holeRadius = holeRadius || 0.5;

        const shape = new THREE.Shape();
        const toothHeight = radius * 0.15;
        const toothWidth = (2 * Math.PI * radius) / (teeth * 3);
        const anglePerTooth = (2 * Math.PI) / teeth;

        for (let i = 0; i < teeth; i++) {
            const baseAngle = i * anglePerTooth;
            const angles = [
                baseAngle,
                baseAngle + anglePerTooth * 0.15,
                baseAngle + anglePerTooth * 0.35,
                baseAngle + anglePerTooth * 0.5,
                baseAngle + anglePerTooth * 0.65,
                baseAngle + anglePerTooth * 0.85,
                baseAngle + anglePerTooth
            ];

            const r0 = radius;
            const r1 = radius + toothHeight;

            if (i === 0) {
                shape.moveTo(Math.cos(angles[0]) * r0, Math.sin(angles[0]) * r0);
            }

            shape.lineTo(Math.cos(angles[1]) * r0, Math.sin(angles[1]) * r0);
            shape.lineTo(Math.cos(angles[2]) * r1, Math.sin(angles[2]) * r1);
            shape.lineTo(Math.cos(angles[4]) * r1, Math.sin(angles[4]) * r1);
            shape.lineTo(Math.cos(angles[5]) * r0, Math.sin(angles[5]) * r0);
            shape.lineTo(Math.cos(angles[6]) * r0, Math.sin(angles[6]) * r0);
        }

        shape.closePath();

        const hole = new THREE.Path();
        for (let i = 0; i <= 32; i++) {
            const angle = (i / 32) * Math.PI * 2;
            const x = Math.cos(angle) * holeRadius;
            const y = Math.sin(angle) * holeRadius;
            if (i === 0) hole.moveTo(x, y);
            else hole.lineTo(x, y);
        }
        shape.holes.push(hole);

        const extrudeSettings = {
            depth: thickness,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.03,
            bevelSegments: 2
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();
        return geometry;
    },

    createGearAssembly() {
        const group = new THREE.Group();

        const gear1Geo = this.createGear(2, 20, 0.5, 0.4);
        const gear1 = new THREE.Mesh(gear1Geo, this.materials.steel);
        gear1.userData.rotationSpeed = 0.005;
        group.add(gear1);

        const gear2Geo = this.createGear(1.3, 13, 0.5, 0.3);
        const gear2 = new THREE.Mesh(gear2Geo, this.materials.chrome);
        gear2.position.set(3.45, 0, 0);
        gear2.rotation.z = Math.PI / 13;
        gear2.userData.rotationSpeed = -0.005 * (20 / 13);
        group.add(gear2);

        const gear3Geo = this.createGear(0.9, 9, 0.5, 0.2);
        const gear3 = new THREE.Mesh(gear3Geo, this.materials.copper);
        gear3.position.set(-3.1, 0, 0);
        gear3.rotation.z = Math.PI / 9 * 0.5;
        gear3.userData.rotationSpeed = -0.005 * (20 / 9);
        group.add(gear3);

        const axleMat = this.materials.darkSteel;
        [gear1, gear2, gear3].forEach(gear => {
            const axle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, 1.2, 16),
                axleMat
            );
            axle.rotation.x = Math.PI / 2;
            axle.position.copy(gear.position);
            group.add(axle);
        });

        return group;
    },

    createPipeNetwork() {
        const group = new THREE.Group();
        const mat = this.materials.chrome;
        const copperMat = this.materials.copper;

        const pipe1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 5, 24),
            mat
        );
        pipe1.rotation.z = Math.PI / 2;
        pipe1.position.set(0, 0, 0);
        group.add(pipe1);

        const pipe2 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 3, 24),
            mat
        );
        pipe2.position.set(0, 1.5, 0);
        group.add(pipe2);

        const torusGeo = new THREE.TorusGeometry(0.7, 0.25, 16, 32, Math.PI / 2);
        const elbow1 = new THREE.Mesh(torusGeo, mat);
        elbow1.position.set(-2.5, 0.7, 0);
        elbow1.rotation.y = Math.PI;
        group.add(elbow1);

        const elbow2 = new THREE.Mesh(torusGeo.clone(), mat);
        elbow2.position.set(2.5, 0.7, 0);
        group.add(elbow2);

        [-2.5, -1, 0, 1, 2.5].forEach(x => {
            const flange = new THREE.Mesh(
                new THREE.TorusGeometry(0.4, 0.08, 8, 24),
                copperMat
            );
            flange.position.set(x, 0, 0);
            flange.rotation.y = Math.PI / 2;
            group.add(flange);
        });

        const tJunction = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 16, 16),
            this.materials.accentOrange
        );
        tJunction.position.set(0, 0, 0);
        group.add(tJunction);

        return group;
    },

    createValve() {
        const group = new THREE.Group();

        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.6, 2, 32),
            this.materials.steel
        );
        body.rotation.z = Math.PI / 2;
        group.add(body);

        const center = new THREE.Mesh(
            new THREE.SphereGeometry(0.75, 24, 24),
            this.materials.chrome
        );
        group.add(center);

        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 1.8, 16),
            this.materials.darkSteel
        );
        stem.position.y = 1.3;
        group.add(stem);

        const handleGeo = new THREE.TorusGeometry(0.6, 0.08, 8, 32);
        const handle = new THREE.Mesh(handleGeo, this.materials.accentOrange);
        handle.position.y = 2.2;
        handle.rotation.x = Math.PI / 2;
        group.add(handle);

        const disc = new THREE.Mesh(
            new THREE.CircleGeometry(0.5, 32),
            this.materials.copper
        );
        disc.position.set(0, 0, 0);
        disc.userData.isDisc = true;
        group.add(disc);

        [{x: -1, z: 0}, {x: 1, z: 0}].forEach(pos => {
            const flange = new THREE.Mesh(
                new THREE.TorusGeometry(0.65, 0.1, 8, 32),
                this.materials.darkSteel
            );
            flange.position.set(pos.x, 0, pos.z);
            flange.rotation.y = Math.PI / 2;
            group.add(flange);

            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const bolt = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8),
                    this.materials.darkSteel
                );
                bolt.position.set(
                    pos.x,
                    Math.sin(angle) * 0.55,
                    Math.cos(angle) * 0.55
                );
                group.add(bolt);
            }
        });

        return group;
    },

    createTurbine() {
        const group = new THREE.Group();

        const hub = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 0.6, 32),
            this.materials.chrome
        );
        hub.rotation.x = Math.PI / 2;
        group.add(hub);

        const bladeCount = 8;
        for (let i = 0; i < bladeCount; i++) {
            const angle = (i / bladeCount) * Math.PI * 2;
            const blade = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 1.6, 0.4),
                this.materials.steel
            );
            blade.position.set(
                Math.cos(angle) * 1.2,
                Math.sin(angle) * 1.2,
                0
            );
            blade.rotation.z = angle;
            blade.rotation.x = 0.3;
            group.add(blade);
        }

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(2, 0.1, 8, 48),
            this.materials.darkSteel
        );
        group.add(ring);

        const outerRing = new THREE.Mesh(
            new THREE.TorusGeometry(2.3, 0.05, 8, 48),
            this.materials.copper
        );
        group.add(outerRing);

        group.userData.rotationSpeed = 0.01;

        return group;
    },

    createFlangeAssembly() {
        const group = new THREE.Group();

        const pipe1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 2, 24),
            this.materials.chrome
        );
        pipe1.rotation.z = Math.PI / 2;
        pipe1.position.x = -1.5;
        group.add(pipe1);

        const pipe2 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 2, 24),
            this.materials.chrome
        );
        pipe2.rotation.z = Math.PI / 2;
        pipe2.position.x = 1.5;
        group.add(pipe2);

        [0.55, -0.55].forEach(xOff => {
            const flange = new THREE.Mesh(
                new THREE.CylinderGeometry(0.7, 0.7, 0.12, 32),
                this.materials.steel
            );
            flange.rotation.z = Math.PI / 2;
            flange.position.x = xOff;
            group.add(flange);
        });

        const gasket = new THREE.Mesh(
            new THREE.TorusGeometry(0.45, 0.06, 8, 32),
            this.materials.accentOrange
        );
        gasket.rotation.y = Math.PI / 2;
        group.add(gasket);

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const bolt = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 1.3, 8),
                this.materials.darkSteel
            );
            bolt.rotation.z = Math.PI / 2;
            bolt.position.set(
                0,
                Math.sin(angle) * 0.55,
                Math.cos(angle) * 0.55
            );
            group.add(bolt);

            [-0.65, 0.65].forEach(xPos => {
                const nut = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.07, 0.07, 0.06, 6),
                    this.materials.copper
                );
                nut.rotation.z = Math.PI / 2;
                nut.position.set(
                    xPos,
                    Math.sin(angle) * 0.55,
                    Math.cos(angle) * 0.55
                );
                group.add(nut);
            });
        }

        return group;
    },

    updateRotations(group, delta) {
        group.traverse(child => {
            if (child.userData.rotationSpeed) {
                child.rotation.z += child.userData.rotationSpeed;
            }
        });
    }
};
