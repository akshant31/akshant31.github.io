/* =====================================
   DATA ENGINEER PORTFOLIO - JAVASCRIPT
   Cinematic 3D Scroll Experience
   ===================================== */

// ===== CONFIGURATION =====
const CONFIG = {
    typingSpeed: 100,
    typingDelay: 1000,
    particleCount: 30,
    scrollThreshold: 0.1,
    animationDuration: 800,
    name: "Akshant Kumar",
    // 3D Tunnel Config
    perspective: 2000,
    fadeStart: 350,
    fadeEnd: 700,
    rotateAway: 10,
    parallaxLayers: {
        stars: -1800,
        nebula: -1000,
        planets: -400
    }
};

// ===== DOM ELEMENTS =====
const elements = {
    loader: document.getElementById('loader'),
    progressBar: document.getElementById('progressBar'),
    scrollContainer: document.getElementById('scrollContainer'),
    sectionsWrapper: document.getElementById('sectionsWrapper'),
    nav: document.getElementById('nav'),
    navLinks: document.querySelectorAll('.nav-link'),
    particles: document.getElementById('particles'),
    typedName: document.getElementById('typedName'),
    layerStars: document.getElementById('layerStars'),
    layerNebula: document.getElementById('layerNebula'),
    layerPlanets: document.getElementById('layerPlanets'),
    timelineProgress: document.getElementById('timelineProgress'),
    timelineItems: document.querySelectorAll('.timeline-item'),
    statNumbers: document.querySelectorAll('.stat-number'),
    skillNodes: document.querySelectorAll('.skill-node'),
    sections: document.querySelectorAll('.section-3d'),
    themeToggle: document.getElementById('themeToggle'),
    scrollModeToggle: document.getElementById('scrollModeToggle'),
    // 3D elements
    viewport3d: document.getElementById('viewport3d'),
    world3d: document.getElementById('world3d')
};

// ===== STATE =====
let scrollState = {
    mode: 'vertical',
    targetX: 0,
    currentX: 0,
    ease: 0.08,
    isScrolling: false
};

let state3D = {
    activeSection: 0,
    prevActiveSection: -1,
    sectionDepth: 0,
    worldZ: 0,
    isInitialized: false,
    needsUpdate: false,
    timelineTriggered: false,
    statsTriggered: false
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initScrollModeToggle();
    initThemeToggle();
    initLoader();
    initParticles();
    initTypingEffect();
    init3D(); // Initialize 3D before scroll effects
    initScrollEffects();
    initNavigation();
    initTimelineAnimations();
    initStatCounters();
    initRevealAnimations();
    initSkillHovers();
    init3DAnimations(); // Start 3D animation loop
});

// ===== 3D TUNNEL SYSTEM =====
function init3D() {
    const vh = window.innerHeight;
    state3D.sectionDepth = vh * 1.15;

    const numSections = elements.sections.length;
    const totalDepth = (numSections - 1) * state3D.sectionDepth;

    // Set body height to enable scrolling through all sections
    document.body.style.height = `${totalDepth + vh}px`;

    // Position each section in 3D space
    elements.sections.forEach((section, i) => {
        section.style.transform = `translateZ(${-i * state3D.sectionDepth}px)`;
    });

    // Position parallax layers at different depths
    if (elements.layerStars) {
        elements.layerStars.style.transform = `translateZ(${CONFIG.parallaxLayers.stars}px)`;
    }
    if (elements.layerNebula) {
        elements.layerNebula.style.transform = `translateZ(${CONFIG.parallaxLayers.nebula}px)`;
    }
    if (elements.layerPlanets) {
        elements.layerPlanets.style.transform = `translateZ(${CONFIG.parallaxLayers.planets}px)`;
    }

    // Position floating text at their specified Z depths
    document.querySelectorAll('.floating-text').forEach(el => {
        const z = el.style.getPropertyValue('--z') || '-100px';
        el.style.transform = `translateZ(${z})`;
    });

    // Set CSS custom properties for data nodes
    document.querySelectorAll('.data-node').forEach(el => {
        const depth = el.dataset.depth || 0;
        el.style.setProperty('--node-depth', `${depth}px`);
        el.style.setProperty('--float-z', `${depth}px`);
    });

    // Set CSS custom properties for planets
    document.querySelectorAll('.planet').forEach(el => {
        const depth = el.dataset.depth || 0;
        el.style.setProperty('--planet-z', `${depth}px`);
    });

    state3D.isInitialized = true;

    // Handle resize
    window.addEventListener('resize', debounce(() => {
        const newVh = window.innerHeight;
        state3D.sectionDepth = newVh * 1.15;
        const newTotalDepth = (numSections - 1) * state3D.sectionDepth;
        document.body.style.height = `${newTotalDepth + newVh}px`;

        elements.sections.forEach((section, i) => {
            section.style.transform = `translateZ(${-i * state3D.sectionDepth}px)`;
        });

        state3D.needsUpdate = true;
    }, 250));
}

function update3DWorld() {
    if (!state3D.isInitialized) return;

    const scrollY = window.scrollY;
    state3D.worldZ = scrollY;

    // Move the world forward based on scroll
    if (elements.world3d) {
        elements.world3d.style.transform = `translateZ(${scrollY}px)`;
    }

    let activeSection = 0;
    let minDistance = Infinity;
    const numSections = elements.sections.length;

    elements.sections.forEach((section, i) => {
        const absZ = scrollY - i * state3D.sectionDepth;
        const content = section.querySelector('.section-3d-content');

        // Track closest section to Z=0 (in focus)
        const distance = Math.abs(absZ);
        if (distance < minDistance) {
            minDistance = distance;
            activeSection = i;
        }

        // Calculate cinematic transforms based on Z position
        const progress = absZ / state3D.sectionDepth;
        const clampedProgress = Math.max(-1.2, Math.min(1.2, progress));

        // Rotation: sections tilt as they approach and recede
        const rotateX = clampedProgress * -CONFIG.rotateAway;

        // Subtle Y rotation for dramatic effect
        const rotateY = clampedProgress * 2;

        // Scale adjustment (CSS perspective handles most, but we can enhance)
        const scale = 1 - Math.abs(clampedProgress) * 0.05;

        // Opacity: fade sections as they pass behind camera or go too far
        let opacity = 1;
        if (absZ > CONFIG.fadeStart) {
            opacity = 1 - (absZ - CONFIG.fadeStart) / (CONFIG.fadeEnd - CONFIG.fadeStart);
        } else if (absZ < -state3D.sectionDepth * 2) {
            opacity = Math.max(0, 1 - (Math.abs(absZ) - state3D.sectionDepth * 2) / 1000);
        }
        opacity = Math.max(0, Math.min(1, opacity));

        if (content) {
            content.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
            content.style.opacity = opacity;
        }

        // Enable/disable pointer events based on visibility
        section.style.pointerEvents = (opacity > 0.4 && Math.abs(absZ) < state3D.sectionDepth * 0.9) ? 'auto' : 'none';
    });

    // Track section changes
    if (activeSection !== state3D.activeSection) {
        state3D.prevActiveSection = state3D.activeSection;
        state3D.activeSection = activeSection;
        onSectionChange(state3D.prevActiveSection, activeSection);
    }

    // Update progress bar
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = maxScroll > 0 ? scrollY / maxScroll : 0;
    if (elements.progressBar) {
        elements.progressBar.style.width = `${scrollPercent * 100}%`;
    }

    // Update depth indicator
    updateDepthIndicator(activeSection, numSections);

    // Update active nav
    updateActiveNav3D(activeSection);

    // Update timeline progress
    updateTimelineProgress3D(scrollY);

    // Update nav background
    updateNavBackground(scrollY);
}

function onSectionChange(from, to) {
    const toSection = elements.sections[to];
    if (!toSection) return;

    const sectionId = toSection.id;

    // Reset triggers when leaving a section
    if (from >= 0) {
        const fromSection = elements.sections[from];
        if (fromSection && fromSection.id === 'experience') {
            state3D.timelineTriggered = false;
        }
        if (fromSection && fromSection.id === 'about') {
            state3D.statsTriggered = false;
        }
    }

    // Trigger section-specific animations
    switch (sectionId) {
        case 'experience':
            if (!state3D.timelineTriggered) {
                staggerTimelineItems();
                state3D.timelineTriggered = true;
            }
            break;
        case 'about':
            if (!state3D.statsTriggered) {
                triggerStatCounters();
                state3D.statsTriggered = true;
            }
            break;
    }

    // Trigger reveal animations for the new section
    triggerRevealAnimationsForSection(toSection);
}

function updateDepthIndicator(activeSection, totalSections) {
    const marker = document.getElementById('depthMarker');
    const labels = document.querySelectorAll('.depth-label');

    if (marker && totalSections > 1) {
        const percent = (activeSection / (totalSections - 1)) * 80; // 80% to leave room
        marker.style.top = `${percent}%`;
    }

    labels.forEach((label, i) => {
        label.classList.toggle('active', i === activeSection);
    });
}

function updateActiveNav3D(activeSection) {
    elements.navLinks.forEach((link, index) => {
        link.classList.toggle('active', index === activeSection);
    });
}

function updateTimelineProgress3D(scrollY) {
    const experienceSection = document.getElementById('experience');
    if (!experienceSection || !elements.timelineProgress) return;

    const sectionIndex = parseInt(experienceSection.dataset.sectionIndex) || 3;
    const sectionZ = sectionIndex * state3D.sectionDepth;
    const relativeScroll = scrollY - sectionZ + window.innerHeight * 0.3;
    const sectionHeight = state3D.sectionDepth;

    if (relativeScroll > 0 && relativeScroll < sectionHeight + window.innerHeight) {
        const progress = Math.min((relativeScroll / (sectionHeight + window.innerHeight * 0.5)) * 100, 100);
        elements.timelineProgress.style.height = `${progress}%`;
    }
}

function updateNavBackground(scrollY) {
    if (!elements.nav) return;
    if (scrollY > 100) {
        elements.nav.style.background = 'rgba(10, 10, 26, 0.95)';
    } else {
        elements.nav.style.background = 'rgba(10, 10, 26, 0.8)';
    }
}

function updateParallax3D(scrollY) {
    // Additional parallax effect based on scroll position
    // The layers are at different Z depths, so perspective creates natural parallax
    // But we can enhance it with subtle rotations

    const progress = scrollY / (document.body.scrollHeight - window.innerHeight);

    if (elements.layerStars) {
        elements.layerStars.style.backgroundPosition = `${progress * 100}px ${progress * 50}px`;
    }
}

// ===== 3D ANIMATION LOOP =====
function init3DAnimations() {
    function loop() {
        if (state3D.needsUpdate) {
            update3DWorld();
            state3D.needsUpdate = false;
        }
        requestAnimationFrame(loop);
    }

    // Mark for update on scroll
    window.addEventListener('scroll', () => {
        state3D.needsUpdate = true;
    }, { passive: true });

    // Also update immediately on scroll (for responsiveness)
    window.addEventListener('scroll', () => {
        update3DWorld();
    }, { passive: true });

    // Start loop
    loop();

    // Initial update
    update3DWorld();
}

// ===== SECTION ANIMATION TRIGGERS =====
function staggerTimelineItems() {
    const items = document.querySelectorAll('.timeline-item');
    items.forEach((item, i) => {
        setTimeout(() => {
            item.classList.add('visible');
        }, i * 200);
    });
}

function triggerStatCounters() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach((stat, i) => {
        setTimeout(() => {
            animateCounter(stat);
        }, i * 300);
    });
}

function triggerRevealAnimationsForSection(section) {
    const revealElements = section.querySelectorAll('.section-header, .about-content, .skills-container, .contact-content');
    revealElements.forEach((el, i) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, i * 150);
    });
}

// ===== SCROLL MODE TOGGLE =====
function initScrollModeToggle() {
    scrollState.mode = 'vertical';
    document.documentElement.setAttribute('data-scroll', 'vertical');
    document.body.style.height = 'auto';

    if (elements.scrollModeToggle) {
        elements.scrollModeToggle.style.display = 'none';
    }
}

function updateBodyHeight() {
    // Handled by 3D system
}

// ===== THEME TOGGLE =====
function initThemeToggle() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            updateParticleColors(newTheme);
        });
    }
}

function updateParticleColors(theme) {
    const particles = document.querySelectorAll('.particle');
    const darkColors = ['#00d4ff', '#9d4edd', '#ff006e', '#00ff88'];
    const lightColors = ['#0095b3', '#7c3aed', '#db2777', '#059669'];
    const colors = theme === 'light' ? lightColors : darkColors;

    particles.forEach(particle => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        particle.style.boxShadow = `0 0 ${parseInt(particle.style.width) * 2}px ${color}`;
    });
}

// ===== LOADER =====
function initLoader() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            elements.loader.classList.add('hidden');
            document.body.style.overflow = 'auto';
            // Ensure 3D is updated after loader
            state3D.needsUpdate = true;
        }, 1500);
    });
}

// ===== PARTICLES =====
function initParticles() {
    const colors = ['#00d4ff', '#9d4edd', '#ff006e', '#00ff88'];

    for (let i = 0; i < CONFIG.particleCount; i++) {
        createParticle(colors);
    }
}

function createParticle(colors) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    const size = Math.random() * 4 + 2;
    const x = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 15;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const depth = Math.random() * -800 - 100; // Random Z depth for 3D effect

    particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}%;
        background: ${color};
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
        box-shadow: 0 0 ${size * 2}px ${color};
        transform: translateZ(${depth}px);
    `;

    if (elements.particles) {
        elements.particles.appendChild(particle);
    }
}

// ===== TYPING EFFECT =====
function initTypingEffect() {
    const name = CONFIG.name;
    let index = 0;

    setTimeout(() => {
        const typeInterval = setInterval(() => {
            if (index < name.length) {
                elements.typedName.textContent += name[index];
                index++;
            } else {
                clearInterval(typeInterval);
            }
        }, CONFIG.typingSpeed);
    }, CONFIG.typingDelay);
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
    // 3D world update is now handled by init3DAnimations
    // This function is kept for compatibility with existing scroll-based features

    window.addEventListener('resize', () => {
        updateBodyHeight();
    });
}

function smoothScrollLoop() {
    // Replaced by 3D animation loop
    requestAnimationFrame(smoothScrollLoop);
}

function updateParallax(scrollPercent) {
    // Handled by 3D perspective
}

function updateActiveNav(scrollPercent, sectionCount) {
    // Replaced by updateActiveNav3D
}

function updateActiveNavVertical(scrollTop) {
    // Replaced by 3D system
}

// ===== NAVIGATION =====
function initNavigation() {
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const sectionIndex = parseInt(targetSection.dataset.sectionIndex) || 0;
                const targetScroll = sectionIndex * state3D.sectionDepth;

                window.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== TIMELINE ANIMATIONS =====
function initTimelineAnimations() {
    // Timeline items are now triggered by section change
    // Set initial state
    elements.timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = 'all 0.6s ease';
    });
}

function updateTimelineProgress(scrollTop) {
    // Handled by updateTimelineProgress3D
}

// ===== STAT COUNTERS =====
function initStatCounters() {
    // Stats are now triggered by section change
    // Set initial state
    elements.statNumbers.forEach(stat => {
        stat.textContent = '0';
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    if (isNaN(target)) return;

    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const counter = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ===== REVEAL ANIMATIONS =====
function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.section-header, .about-content, .skills-container, .contact-content');

    revealElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.8s ease';
    });

    // Trigger hero section immediately
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        setTimeout(() => {
            triggerRevealAnimationsForSection(heroSection);
        }, 2000); // After loader and typing
    }
}

// ===== SKILL HOVERS =====
function initSkillHovers() {
    elements.skillNodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            const orbit = node.closest('.skill-orbit');
            if (orbit) orbit.style.animationPlayState = 'paused';
        });

        node.addEventListener('mouseleave', () => {
            const orbit = node.closest('.skill-orbit');
            if (orbit) orbit.style.animationPlayState = 'running';
        });
    });
}

// ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const sectionIndex = parseInt(target.dataset.sectionIndex) || 0;
            const targetScroll = sectionIndex * state3D.sectionDepth;

            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        }
    });
});

// ===== MOUSE FOLLOWER EFFECT =====
class MouseFollower {
    constructor() {
        this.cursor = this.createCursor();
        this.init();
    }

    createCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';
        document.body.appendChild(cursor);
        return cursor;
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = `${e.clientX}px`;
            this.cursor.style.top = `${e.clientY}px`;
        });

        const interactiveElements = document.querySelectorAll('a, button, .skill-node, .project-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => this.cursor.classList.remove('hovering'));
        });
    }
}

// Uncomment to enable custom cursor
// new MouseFollower();

// ===== EASTER EGG: KONAMI CODE =====
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateEasterEgg() {
    document.body.style.animation = 'rainbow 3s ease';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 3000);

    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    console.log('🎮 Konami Code Activated! You found the easter egg!');
}

// ===== PERFORMANCE OPTIMIZATION =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== CONSOLE EASTER EGG =====
console.log(`
%c ____        _          _____            _                      
|  _ \\  __ _| |_ __ _  | ____|_ __   __ _(_)_ __   ___  ___ _ __ 
| | | |/ _\` | __/ _\` | |  _| | '_ \\ / _\` | | '_ \\ / _ \\/ _ \\ '__|
| |_| | (_| | || (_| | | |___| | | | (_| | | | | |  __/  __/ |   
|____/ \\__,_|\\__\\__,_| |_____|_| |_|\\__, |_|_| |_|\\___|\\___|_|   
                                    |___/                        
`, 'color: #00d4ff; font-family: monospace;');

console.log('%c👋 Hey there, fellow developer! Welcome to the 3D dimension.', 'font-size: 14px;');
console.log('%c🚀 This portfolio now features a cinematic 3D scroll experience!', 'font-size: 14px;');
console.log('%c📧 Feel free to reach out!', 'font-size: 14px;');
