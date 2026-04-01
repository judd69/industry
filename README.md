# Quality Flow Industries

> Precision Engineered Stainless Steel Solutions Since 2002

A modern, immersive single-page website for **Quality Flow Industries** — a manufacturer of stainless steel sanitary pipe systems, valves, fittings, and components for dairy, pharmaceutical, food processing, and beverage industries.

## Features

- **Immersive 3D scene** powered by Three.js with procedurally generated industrial geometry and a dynamic particle system
- **Scroll-driven experience** — the 3D environment responds to page scroll via a custom scroll controller
- **GSAP animations** for smooth section transitions and entrance effects
- **Animated preloader** with a progress indicator and status messages
- **Custom cursor** with hover interactions
- **Responsive design** with a mobile menu overlay
- **Contact form** for customer enquiries

## Sections

| # | Section | Description |
|---|---------|-------------|
| — | Hero | Full-screen 3D landing with brand identity |
| 01 | About | Company history and key statistics |
| 02 | Products | Valves, pipe fittings, connectors, and process equipment |
| 03 | Industries | Dairy, pharmaceutical, food processing, and beverages |
| 04 | Quality | Manufacturing standards and quality commitments |
| 05 | Contact | Office address, phone, email, and enquiry form |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| 3D Rendering | [Three.js r128](https://threejs.org/) |
| Animations | [GSAP 3.12](https://gsap.com/) + ScrollTrigger |
| Fonts | Inter · Space Grotesk · JetBrains Mono (Google Fonts) |
| Language | Vanilla HTML5 / CSS3 / ES6 JavaScript |
| Build | None — static files, no bundler required |

## Project Structure

```
industry/
├── index.html              # Single-page application entry point
├── css/
│   └── style.css           # All styles (custom properties, layout, animations)
└── js/
    ├── app.js              # Bootstrap — wires up all modules on DOMContentLoaded
    ├── preloader.js        # Animated loading screen
    ├── scene.js            # Three.js scene setup, camera, lights, and render loop
    ├── geometries.js       # Procedural 3D geometry (pipes, fittings, flanges)
    ├── particles.js        # Particle system and ambient grid
    ├── scroll-controller.js # Maps window scroll to 3D camera path and section index
    ├── sections.js         # Section visibility, counter animations, and nav sync
    └── cursor.js           # Custom cursor tracking and hover states
```

## Getting Started

The site is fully static — no build step or server required.

**Option 1 — Open directly in a browser:**

```bash
open index.html
```

**Option 2 — Serve locally (recommended for full functionality):**

```bash
# Python 3
python3 -m http.server 8080

# Node.js (npx)
npx serve .
```

Then visit `http://localhost:8080`.

## Contact

**Quality Flow Industries**  
303, Shankeshwar Accord, J.P. Thakur Marg,  
Bhayander (W), Dist. Thane — 401 101, Maharashtra, India

- **Phone:** +91 9819 703 085 / +91 9322 876 807 / 022-3290 6564  
- **Email:** qfindustries@rediffmail.com

---

*© 2002–present Quality Flow Industries. All rights reserved.*
