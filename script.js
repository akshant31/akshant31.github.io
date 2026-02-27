/**
 * Akshant Kumar — 3D Interactive Portfolio
 * Three.js Neural Network BG + 3D Skill Cloud + Tilt Cards + GSAP
 */

'use strict';

/* ================================================================
   THREE.JS — Neural Network Background
   ================================================================ */
(function initThreeScene() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    camera.position.set(0, 0, 8);

    /* --- Particles --- */
    const COUNT = 180;
    const pos   = new Float32Array(COUNT * 3);
    const vel   = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
        pos[i*3]   = (Math.random() - .5) * 20;
        pos[i*3+1] = (Math.random() - .5) * 14;
        pos[i*3+2] = (Math.random() - .5) * 6;
        vel[i*3]   = (Math.random() - .5) * .004;
        vel[i*3+1] = (Math.random() - .5) * .003;
        vel[i*3+2] = (Math.random() - .5) * .002;
    }

    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const ptMat = new THREE.PointsMaterial({
        color: 0x00d4ff,
        size: 0.055,
        transparent: true,
        opacity: 0.65,
        sizeAttenuation: true
    });

    const points = new THREE.Points(ptGeo, ptMat);
    scene.add(points);

    /* --- Connection Lines --- */
    const MAX_LINES = 400;
    const linePos   = new Float32Array(MAX_LINES * 2 * 3);
    const lineGeo   = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    lineGeo.setDrawRange(0, 0);

    const lineMat = new THREE.LineBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.1
    });

    const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(linesMesh);

    /* --- Floating Wireframe Geometries --- */
    const shapes = [
        { geo: new THREE.IcosahedronGeometry(.55, 1), color: 0x00d4ff,  x:  4,  y:  2, z:  0 },
        { geo: new THREE.OctahedronGeometry(.45),     color: 0x9d4edd,  x: -4,  y: -2, z: -1 },
        { geo: new THREE.TorusGeometry(.35, .12, 8, 24), color: 0xff006e, x:  3, y: -3, z:  1 },
        { geo: new THREE.IcosahedronGeometry(.3, 0),  color: 0x00ff88,  x: -3,  y:  3, z: -.5 },
        { geo: new THREE.OctahedronGeometry(.25),     color: 0xff8c00,  x:  0,  y:  4, z: -1 }
    ];

    const meshes = shapes.map(s => {
        const mat  = new THREE.MeshBasicMaterial({ color: s.color, wireframe: true, transparent: true, opacity: .35 });
        const mesh = new THREE.Mesh(s.geo, mat);
        mesh.position.set(s.x, s.y, s.z);
        scene.add(mesh);
        return mesh;
    });

    /* --- Mouse Parallax --- */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    document.addEventListener('mousemove', e => {
        mouse.tx = (e.clientX / innerWidth  - .5) * .8;
        mouse.ty = (e.clientY / innerHeight - .5) * -.6;
    });

    /* --- Scroll Y --- */
    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

    /* --- Resize --- */
    window.addEventListener('resize', () => {
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
    });

    /* --- Particle update & connections --- */
    function updateParticles() {
        for (let i = 0; i < COUNT; i++) {
            pos[i*3]   += vel[i*3];
            pos[i*3+1] += vel[i*3+1];
            pos[i*3+2] += vel[i*3+2];
            if (Math.abs(pos[i*3])   > 10) vel[i*3]   *= -1;
            if (Math.abs(pos[i*3+1]) > 7)  vel[i*3+1] *= -1;
            if (Math.abs(pos[i*3+2]) > 3)  vel[i*3+2] *= -1;
        }
        ptGeo.attributes.position.needsUpdate = true;

        let lIdx = 0;
        const THRESH = 2.8;
        for (let a = 0; a < COUNT && lIdx < MAX_LINES; a++) {
            for (let b = a + 1; b < COUNT && lIdx < MAX_LINES; b++) {
                const dx = pos[a*3] - pos[b*3];
                const dy = pos[a*3+1] - pos[b*3+1];
                const dz = pos[a*3+2] - pos[b*3+2];
                if (dx*dx + dy*dy + dz*dz < THRESH*THRESH) {
                    linePos[lIdx*6]   = pos[a*3];
                    linePos[lIdx*6+1] = pos[a*3+1];
                    linePos[lIdx*6+2] = pos[a*3+2];
                    linePos[lIdx*6+3] = pos[b*3];
                    linePos[lIdx*6+4] = pos[b*3+1];
                    linePos[lIdx*6+5] = pos[b*3+2];
                    lIdx++;
                }
            }
        }
        lineGeo.attributes.position.needsUpdate = true;
        lineGeo.setDrawRange(0, lIdx * 2);
    }

    /* --- Animate --- */
    let t = 0;
    function animate() {
        requestAnimationFrame(animate);
        t += 0.008;

        // Smooth mouse
        mouse.x += (mouse.tx - mouse.x) * .05;
        mouse.y += (mouse.ty - mouse.y) * .05;

        camera.position.x = mouse.x;
        camera.position.y = mouse.y;
        camera.position.z = 8 - scrollY * 0.0015;
        camera.lookAt(0, 0, 0);

        // Rotate floating shapes
        meshes.forEach((m, i) => {
            m.rotation.x = t * (.3 + i * .07);
            m.rotation.y = t * (.2 + i * .09);
            m.position.y = shapes[i].y + Math.sin(t * .8 + i) * .25;
        });

        updateParticles();
        renderer.render(scene, camera);
    }
    animate();
})();

/* ================================================================
   LOADER
   ================================================================ */
(function initLoader() {
    const fill = document.getElementById('loaderFill');
    const pct  = document.getElementById('loaderPct');
    const loader = document.getElementById('loader');
    if (!loader) return;

    let p = 0;
    const iv = setInterval(() => {
        p += Math.random() * 14 + 3;
        if (p > 100) p = 100;
        if (fill) fill.style.width = p + '%';
        if (pct)  pct.textContent  = Math.round(p) + '%';
        if (p >= 100) {
            clearInterval(iv);
            setTimeout(() => loader.classList.add('hidden'), 300);
        }
    }, 80);
})();

/* ================================================================
   CUSTOM CURSOR
   ================================================================ */
(function initCursor() {
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mx = -100, my = -100;
    let rx = -100, ry = -100;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function loop() {
        requestAnimationFrame(loop);
        rx += (mx - rx) * .18;
        ry += (my - ry) * .18;
        dot.style.left  = mx + 'px';
        dot.style.top   = my + 'px';
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
    }
    loop();

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '0.6'; });
})();

/* ================================================================
   NAVBAR — scroll effect + active links
   ================================================================ */
(function initNavbar() {
    const nav = document.getElementById('navbar');
    const links = document.querySelectorAll('.nav-link');
    if (!nav) return;

    // Scroll-based glass effect
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // Active section tracking via IntersectionObserver
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting && e.intersectionRatio > .4) {
                links.forEach(l => l.classList.toggle('active', l.dataset.section === e.target.id));
            }
        });
    }, { threshold: .4 });
    sections.forEach(s => observer.observe(s));

    // Click → smooth scroll
    links.forEach(l => {
        l.addEventListener('click', ev => {
            ev.preventDefault();
            scrollToSection(l.dataset.section);
        });
    });
})();

/* ================================================================
   SMOOTH SCROLL HELPER
   ================================================================ */
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}
window.scrollToSection = scrollToSection;

/* ================================================================
   SCROLL REVEAL (IntersectionObserver)
   ================================================================ */
(function initReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: .15 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ================================================================
   TYPING EFFECT
   ================================================================ */
(function initTyping() {
    const el = document.getElementById('typedText');
    if (!el) return;

    const titles = ['Data Engineer', 'Pipeline Architect', 'Cloud Specialist', 'Problem Solver'];
    let ti = 0, ci = 0, deleting = false;

    function type() {
        const current = titles[ti];
        el.textContent = deleting ? current.slice(0, ci--) : current.slice(0, ci++);

        let delay = deleting ? 45 : 85;
        if (!deleting && ci > current.length) { delay = 2200; deleting = true; }
        else if (deleting && ci < 0)          { delay = 500;  deleting = false; ti = (ti+1) % titles.length; ci = 0; }

        setTimeout(type, delay);
    }
    setTimeout(type, 1200);
})();

/* ================================================================
   STAT COUNTERS
   ================================================================ */
(function initStats() {
    const stats = document.querySelectorAll('.stat-val');
    if (!stats.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el     = e.target;
            const target = parseInt(el.dataset.target, 10);
            let current  = 0;
            const step   = target / 60;
            const iv = setInterval(() => {
                current += step;
                if (current >= target) { current = target; clearInterval(iv); }
                el.textContent = Math.floor(current);
            }, 25);
            observer.unobserve(el);
        });
    }, { threshold: .5 });

    stats.forEach(s => observer.observe(s));
})();

/* ================================================================
   3D TILT CARDS
   ================================================================ */
(function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach(card => {
        let raf;

        card.addEventListener('mousemove', e => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const r    = card.getBoundingClientRect();
                const x    = e.clientX - r.left;
                const y    = e.clientY - r.top;
                const cx   = r.width  / 2;
                const cy   = r.height / 2;
                const rotX = ((y - cy) / cy) * -12;
                const rotY = ((x - cx) / cx) *  12;

                card.style.transform =
                    `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;

                // Move glare to mouse position
                const glare = card.querySelector('.card-glare');
                if (glare) {
                    const px = (x / r.width)  * 100;
                    const py = (y / r.height) * 100;
                    glare.style.background =
                        `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,.15), transparent 60%)`;
                }
            });
        });

        card.addEventListener('mouseleave', () => {
            cancelAnimationFrame(raf);
            card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
            const glare = card.querySelector('.card-glare');
            if (glare) glare.style.background = '';
        });
    });
})();

/* ================================================================
   MAGNETIC BUTTONS
   ================================================================ */
(function initMagnetic() {
    const magnetics = document.querySelectorAll('.magnetic');

    magnetics.forEach(el => {
        el.addEventListener('mousemove', e => {
            const r    = el.getBoundingClientRect();
            const x    = e.clientX - r.left - r.width  / 2;
            const y    = e.clientY - r.top  - r.height / 2;
            el.style.transform = `translate(${x * .25}px, ${y * .25}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
})();

/* ================================================================
   HERO PARALLAX on floating chips
   ================================================================ */
(function initHeroParallax() {
    const chips = document.querySelectorAll('.float-chip[data-parallax]');
    if (!chips.length) return;

    document.addEventListener('mousemove', e => {
        const mx = (e.clientX / innerWidth  - .5) * 2;
        const my = (e.clientY / innerHeight - .5) * 2;

        chips.forEach(chip => {
            const depth = parseFloat(chip.dataset.parallax) || .05;
            const tx = mx * depth * 80;
            const ty = my * depth * 80;
            chip.style.transform = `translate(${tx}px, ${ty}px)`;
        });
    });
})();

/* ================================================================
   3D ROTATING SKILL CLOUD (Fibonacci Sphere)
   ================================================================ */
(function initSkillCloud() {
    const sphere = document.getElementById('cloudSphere');
    if (!sphere) return;

    const skills = [
        'Python', 'SQL', 'Java', 'Scala',
        'Apache Spark', 'Kafka', 'Airflow', 'Hadoop',
        'PostgreSQL', 'MongoDB', 'Redshift', 'Elasticsearch',
        'AWS', 'Azure', 'GCP', 'Docker',
        'Tableau', 'dbt', 'Flink', 'Kubernetes'
    ];

    const R = 120;
    const count = skills.length;
    const tags  = [];

    skills.forEach((skill, i) => {
        const phi   = Math.acos(1 - 2 * (i + .5) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;

        const ox = R * Math.sin(phi) * Math.cos(theta);
        const oy = R * Math.sin(phi) * Math.sin(theta);
        const oz = R * Math.cos(phi);

        const tag = document.createElement('span');
        tag.className = 'cloud-tag';
        tag.textContent = skill;
        tag.dataset.ox = ox;
        tag.dataset.oy = oy;
        tag.dataset.oz = oz;

        sphere.appendChild(tag);
        tags.push(tag);
    });

    let angleY = 0;
    const TILT_X = 0.2; // constant slight tilt
    let paused = false;

    sphere.addEventListener('mouseenter', () => { paused = true; });
    sphere.addEventListener('mouseleave', () => { paused = false; });

    // On hover show tooltip scale
    tags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            tag.style.zIndex = '200';
        });
        tag.addEventListener('mouseleave', () => {
            tag.style.zIndex = '';
        });
    });

    function rotateSphere() {
        requestAnimationFrame(rotateSphere);
        if (!paused) angleY += 0.006;

        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const cosX = Math.cos(TILT_X);
        const sinX = Math.sin(TILT_X);

        tags.forEach(tag => {
            const ox = parseFloat(tag.dataset.ox);
            const oy = parseFloat(tag.dataset.oy);
            const oz = parseFloat(tag.dataset.oz);

            // Rotate around Y axis
            const x1 = ox * cosY + oz * sinY;
            const z1 = -ox * sinY + oz * cosY;

            // Rotate around X axis (tilt)
            const y2 = oy * cosX - z1 * sinX;
            const z2 = oy * sinX + z1 * cosX;

            const depth  = (z2 + R) / (2 * R);       // 0..1
            const scale  = 0.55 + depth * 0.7;
            const opacty = 0.18 + depth * 0.82;

            tag.style.transform =
                `translate(calc(-50% + ${x1}px), calc(-50% + ${y2}px)) translateZ(${z2}px) scale(${scale})`;
            tag.style.opacity   = opacty;
            tag.style.zIndex    = Math.round(depth * 100).toString();
            tag.style.color     = depth > .65 ? 'var(--cyan)' : 'var(--text-3)';
            tag.style.borderColor = depth > .65
                ? 'rgba(0,212,255,.4)'
                : 'rgba(255,255,255,.06)';
        });
    }
    rotateSphere();
})();

/* ================================================================
   GSAP — Deep 3D ScrollTrigger Animations
   ================================================================ */
(function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    /* ---------- 1. HERO EXIT — content drifts forward + fades ---------- */
    gsap.to('#hero .hero-content', {
        z: 160, opacity: 0, scale: 1.06,
        ease: 'none',
        scrollTrigger: {
            trigger: '#hero', start: 'top top', end: '85% top', scrub: 1.2
        }
    });

    // Floating chips fly to different depths as hero exits
    ['.fc1', '.fc2', '.fc3', '.fc4'].forEach((sel, i) => {
        if (!document.querySelector(sel)) return;
        gsap.to(sel, {
            y: -(70 + i * 25), z: (i + 1) * 40, opacity: 0, ease: 'none',
            scrollTrigger: {
                trigger: '#hero', start: 'top top', end: '60% top',
                scrub: 0.7 + i * 0.15
            }
        });
    });

    /* ---------- 2. SECTION HEADS — rotate in from X axis (page-turn) --- */
    gsap.utils.toArray('.section-head').forEach(head => {
        gsap.fromTo(head,
            { rotateX: 18, z: -60, opacity: 0, transformOrigin: 'top center' },
            {
                rotateX: 0, z: 0, opacity: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: head, start: 'top 82%', end: 'top 40%', scrub: 0.9
                }
            }
        );
    });

    /* ---------- 3. ABOUT BIO — Y-axis flip from left depth -------------- */
    gsap.fromTo('.about-bio',
        { rotateY: -28, z: -120, x: -40, opacity: 0, transformOrigin: 'left center' },
        {
            rotateY: 0, z: 0, x: 0, opacity: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.about-bio', start: 'top 80%', end: 'top 25%', scrub: 1
            }
        }
    );

    // Stat cards — emerge staggered from depth
    gsap.utils.toArray('.stat-card').forEach((card, i) => {
        gsap.fromTo(card,
            { z: -100, rotateX: 30, y: 30, opacity: 0 },
            {
                z: 0, rotateX: 0, y: 0, opacity: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.about-side', start: 'top 80%', end: 'top 15%',
                    scrub: 0.8 + i * 0.1
                }
            }
        );
    });

    // Terminal card — slides from depth
    gsap.fromTo('.terminal-card',
        { z: -80, rotateX: 15, opacity: 0 },
        {
            z: 0, rotateX: 0, opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.terminal-card', start: 'top 82%', end: 'top 30%', scrub: 0.9
            }
        }
    );

    /* ---------- 4. SKILLS — rotate in on Y axis ------------------------- */
    gsap.fromTo('.cloud-wrap',
        { rotateY: 30, z: -100, opacity: 0, transformOrigin: 'right center' },
        {
            rotateY: 0, z: 0, opacity: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.skills-layout', start: 'top 80%', end: 'top 20%', scrub: 1
            }
        }
    );

    gsap.utils.toArray('.scat').forEach((card, i) => {
        gsap.fromTo(card,
            { rotateY: 20, z: -80 - i * 20, opacity: 0, y: 20 },
            {
                rotateY: 0, z: 0, opacity: 1, y: 0,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.skill-cats', start: 'top 80%', end: 'top 15%',
                    scrub: 0.8 + i * 0.1
                }
            }
        );
    });

    /* ---------- 5. TIMELINE SPINE — grows from top, scrubbed ------------ */
    gsap.fromTo('.tl-spine',
        { scaleY: 0, transformOrigin: 'top center' },
        {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: '.timeline', start: 'top 65%', end: 'bottom 55%', scrub: 1
            }
        }
    );

    // Each card — 3D rotate from alternating sides
    gsap.utils.toArray('.tl-item').forEach(item => {
        const isRight = item.classList.contains('tl-r');
        const card    = item.querySelector('.tl-card');
        if (!card) return;

        gsap.fromTo(card,
            {
                rotateY: isRight ? -30 : 30,
                z: -100,
                x: isRight ? -50 : 50,
                opacity: 0,
                transformOrigin: isRight ? 'right center' : 'left center'
            },
            {
                rotateY: 0, z: 0, x: 0, opacity: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: item, start: 'top 82%', end: 'top 25%', scrub: 0.9
                }
            }
        );

        // Marker pops
        const marker = item.querySelector('.tl-marker');
        if (marker) {
            gsap.fromTo(marker,
                { scale: 0, z: 30 },
                {
                    scale: 1, z: 0,
                    ease: 'back.out(2)',
                    scrollTrigger: {
                        trigger: item, start: 'top 75%', toggleActions: 'play none none none'
                    }
                }
            );
        }
    });

    /* ---------- 6. CONTACT — rise from depth with X tilt --------------- */
    gsap.fromTo('.contact-card',
        { rotateX: 22, z: -140, opacity: 0, transformOrigin: 'bottom center' },
        {
            rotateX: 0, z: 0, opacity: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.contact-card', start: 'top 80%', end: 'top 20%', scrub: 1.1
            }
        }
    );

    gsap.fromTo('.status-card',
        { rotateY: 20, z: -100, opacity: 0, x: 40 },
        {
            rotateY: 0, z: 0, opacity: 1, x: 0,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.status-card', start: 'top 80%', end: 'top 25%', scrub: 1
            }
        }
    );

    // Contact links fly in sequentially
    gsap.utils.toArray('.cc-link').forEach((link, i) => {
        gsap.fromTo(link,
            { x: -50, z: -40, opacity: 0, rotateY: -10 },
            {
                x: 0, z: 0, opacity: 1, rotateY: 0,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.cc-links', start: 'top 82%', toggleActions: 'play none none none'
                },
                delay: i * 0.12
            }
        );
    });

    /* ---------- 7. PARALLAX DEPTH — section backgrounds move at diff Z - */
    gsap.utils.toArray('.section:not(#hero)').forEach(section => {
        // Background glow elements drift at varying Z speeds
        gsap.fromTo(section,
            { backgroundPositionY: '0%' },
            {
                backgroundPositionY: '15%', ease: 'none',
                scrollTrigger: {
                    trigger: section, start: 'top bottom', end: 'bottom top', scrub: true
                }
            }
        );
    });

    /* ---------- 8. SECTION TRANSITION — next section peeks from below --- */
    gsap.utils.toArray('.section:not(#hero):not(:last-of-type)').forEach(section => {
        gsap.fromTo(section,
            { z: -40, rotateX: 3 },
            {
                z: 0, rotateX: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: section, start: 'top 90%', end: 'top 30%', scrub: 1.5
                }
            }
        );
    });

    /* ---------- 9. FOOTER — rises from below ---------------------------- */
    gsap.fromTo('#footer',
        { y: 30, opacity: 0 },
        {
            y: 0, opacity: 1,
            scrollTrigger: {
                trigger: '#footer', start: 'top 90%', toggleActions: 'play none none none'
            }
        }
    );
})();

/* ================================================================
   HAMBURGER MENU
   ================================================================ */
(function initHamburger() {
    const btn     = document.getElementById('hamburger');
    const nav     = document.getElementById('mobileNav');
    const close   = document.getElementById('mobileNavClose');
    const mLinks  = document.querySelectorAll('.m-link');
    if (!btn || !nav) return;

    function open()  { btn.classList.add('open');  nav.classList.add('open');  document.body.style.overflow = 'hidden'; }
    function close_  () { btn.classList.remove('open'); nav.classList.remove('open'); document.body.style.overflow = ''; }

    btn.addEventListener('click', () => nav.classList.contains('open') ? close_() : open());
    if (close) close.addEventListener('click', close_);

    mLinks.forEach(l => {
        l.addEventListener('click', e => {
            e.preventDefault();
            close_();
            setTimeout(() => scrollToSection(l.dataset.section), 300);
        });
    });

    // Close on outside tap
    nav.addEventListener('click', e => { if (e.target === nav) close_(); });
})();

/* ================================================================
   THEME TOGGLE
   ================================================================ */
(function initTheme() {
    const btn  = document.getElementById('themeBtn');
    const html = document.documentElement;
    const stored = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', stored);

    if (btn) {
        btn.addEventListener('click', () => {
            const cur = html.getAttribute('data-theme');
            const next = cur === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    }
})();

/* ================================================================
   SKILL TAGS in categories — hover animation 3D
   ================================================================ */
(function initSkillTagHover() {
    document.querySelectorAll('.stag').forEach(tag => {
        tag.addEventListener('mousemove', e => {
            const r  = tag.getBoundingClientRect();
            const x  = ((e.clientX - r.left) / r.width  - .5) * 16;
            const y  = ((e.clientY - r.top)  / r.height - .5) * -16;
            tag.style.transform = `perspective(300px) rotateX(${y}deg) rotateY(${x}deg) scale(1.08) translateZ(6px)`;
        });
        tag.addEventListener('mouseleave', () => {
            tag.style.transform = '';
        });
    });
})();

/* ================================================================
   TIMELINE MARKER — staggered pulse colors per item
   ================================================================ */
(function initTimelineColors() {
    const colors = ['#00d4ff', '#9d4edd', '#ff006e', '#00ff88'];
    document.querySelectorAll('.tl-marker').forEach((m, i) => {
        const c = colors[i % colors.length];
        m.style.borderColor = c;
        const pulse = m.querySelector('.tl-pulse');
        if (pulse) pulse.style.borderColor = c;
    });
})();

/* ================================================================
   FOOTER — year
   ================================================================ */
(function updateYear() {
    const el = document.querySelector('.footer-year');
    if (el) el.textContent = '© ' + new Date().getFullYear();
})();
