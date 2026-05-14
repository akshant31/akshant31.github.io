/* =====================================
   DATA ENGINEER PORTFOLIO - JAVASCRIPT
   Cinematic 3D Scroll Experience (Stable)
   ===================================== */

// ===== CONFIGURATION =====
const CONFIG = {
    typingSpeed: 100,
    typingDelay: 1000,
    particleCount: 30,
    scrollThreshold: 0.1,
    animationDuration: 800,
    name: "Akshant Kumar",
    // 3D Config
    perspective: 1500,
    tiltEnter: 10,
    tiltExit: -10,
    depthEnter: -100,
    depthExit: -100,
    yOffsetEnter: 50,
    yOffsetExit: -50
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
    main3d: document.getElementById('main3d')
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
    isInitialized: false
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initScrollModeToggle();
    initThemeToggle();
    initLoader();
    initParticles();
    initTypingEffect();
    initScrollEffects();
    initNavigation();
    initTimelineAnimations();
    initStatCounters();
    initRevealAnimations();
    initSkillHovers();
    init3D();
});

// ===== 3D SCROLL SYSTEM (Stable Section-Based) =====
function init3D() {
    state3D.isInitialized = true;

    // Set initial 3D states for section contents
    elements.sections.forEach((section) => {
        const content = section.querySelector('.section-3d-content');
        if (content) {
            // Start with subtle 3D positioning
            content.style.transformOrigin = 'center center';
        }
    });

    // Start the 3D animation loop
    animate3DLoop();
}

function animate3DLoop() {
    update3DTransforms();
    requestAnimationFrame(animate3DLoop);
}

function update3DTransforms() {
    if (!state3D.isInitialized) return;

    const vh = window.innerHeight;
    let activeSection = 0;
    let minDistance = Infinity;

    elements.sections.forEach((section, i) => {
        const rect = section.getBoundingClientRect();
        const content = section.querySelector('.section-3d-content');

        // Section center relative to viewport center
        const sectionCenter = rect.top + rect.height / 2;
        const viewportCenter = vh / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);

        if (distance < minDistance) {
            minDistance = distance;
            activeSection = i;
        }

        if (!content) return;

        // Calculate how much of the section is visible
        const visibleTop = Math.max(0, -rect.top);
        const visibleBottom = Math.min(rect.height, vh - rect.top);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visibility = Math.min(1, visibleHeight / Math.min(rect.height, vh));

        if (visibility <= 0.01) {
            content.style.opacity = '0';
            return;
        }

        // Normalized position: -1 (section entering from bottom) to 1 (section exiting to top)
        // 0 means section is perfectly centered
        const travelRange = rect.height / 2 + vh / 2;
        const normalizedPos = (sectionCenter - viewportCenter) / travelRange;
        const clampedPos = Math.max(-1, Math.min(1, normalizedPos));

        // 3D transforms based on position
        // Entering (clampedPos < 0): tilt back, come from depth
        // Centered (clampedPos ≈ 0): flat, full opacity
        // Exiting (clampedPos > 0): tilt forward, recede into depth
        const absPos = Math.abs(clampedPos);
        const direction = clampedPos < 0 ? -1 : 1;

        const rotateX = clampedPos * -CONFIG.tiltEnter;
        const translateY = clampedPos * -CONFIG.yOffsetEnter;
        const translateZ = (1 - absPos) * 50 + absPos * CONFIG.depthEnter;
        const scale = 1 - absPos * 0.03;
        const opacity = Math.max(0.4, 1 - absPos * 0.5);

        content.style.transform = `perspective(${CONFIG.perspective}px) rotateX(${rotateX}deg) translateY(${translateY}px) translateZ(${translateZ}px) scale(${scale})`;
        content.style.opacity = opacity;
    });

    // Update active section tracking
    if (activeSection !== state3D.activeSection) {
        state3D.prevActiveSection = state3D.activeSection;
        state3D.activeSection = activeSection;
        onSectionChange(state3D.prevActiveSection, activeSection);
    }

    // Update progress bar
    const maxScroll = document.documentElement.scrollHeight - vh;
    const scrollPercent = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    if (elements.progressBar) {
        elements.progressBar.style.width = `${scrollPercent * 100}%`;
    }

    // Update depth indicator
    updateDepthIndicator(activeSection, elements.sections.length);

    // Update active nav
    updateActiveNav3D(activeSection);

    // Update timeline progress
    updateTimelineProgress(window.scrollY);

    // Update nav background
    updateNavBackground(window.scrollY);

    // Update parallax layers
    updateParallaxLayers(scrollPercent);
}

function onSectionChange(from, to) {
    const toSection = elements.sections[to];
    if (!toSection) return;

    const sectionId = toSection.id;

    // Trigger section-specific animations
    switch (sectionId) {
        case 'experience':
            staggerTimelineItems();
            break;
        case 'about':
            triggerStatCounters();
            break;
    }
}

function updateDepthIndicator(activeSection, totalSections) {
    const marker = document.getElementById('depthMarker');
    const labels = document.querySelectorAll('.depth-label');

    if (marker && totalSections > 1) {
        const percent = (activeSection / (totalSections - 1)) * 80;
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

function updateNavBackground(scrollY) {
    if (!elements.nav) return;
    if (scrollY > 100) {
        elements.nav.style.background = 'rgba(10, 10, 26, 0.95)';
    } else {
        elements.nav.style.background = 'rgba(10, 10, 26, 0.8)';
    }
}

function updateParallaxLayers(scrollPercent) {
    if (elements.layerStars) {
        elements.layerStars.style.transform = `translateX(${-scrollPercent * 100}px)`;
    }
    if (elements.layerNebula) {
        elements.layerNebula.style.transform = `translateX(${-scrollPercent * 50}px)`;
    }
    if (elements.layerPlanets) {
        elements.layerPlanets.style.transform = `translateX(${-scrollPercent * 150}px)`;
    }
}

// ===== SECTION ANIMATION TRIGGERS =====
function staggerTimelineItems() {
    const items = document.querySelectorAll('.timeline-item');
    items.forEach((item, i) => {
        item.classList.remove('visible');
        void item.offsetWidth; // Force reflow
        setTimeout(() => {
            item.classList.add('visible');
        }, i * 200);
    });
}

function triggerStatCounters() {
    elements.statNumbers.forEach((stat, i) => {
        stat.textContent = '0';
        setTimeout(() => {
            animateCounter(stat);
        }, i * 300);
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
    // Natural flow - no need to set body height
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
            document.body.style.overflowY = 'auto';
            document.body.style.overflowX = 'hidden';
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

    particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}%;
        background: ${color};
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
        box-shadow: 0 0 ${size * 2}px ${color};
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
    window.addEventListener('resize', () => {
        updateBodyHeight();
    });
}

// ===== NAVIGATION =====
function initNavigation() {
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== TIMELINE ANIMATIONS =====
function initTimelineAnimations() {
    elements.timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = 'all 0.6s ease';
    });
}

function updateTimelineProgress(scrollTop) {
    const experienceSection = document.getElementById('experience');
    if (!experienceSection || !elements.timelineProgress) return;

    const sectionTop = experienceSection.offsetTop;
    const sectionHeight = experienceSection.offsetHeight;
    const scrollPosition = scrollTop - sectionTop + window.innerHeight * 0.5;

    if (scrollPosition > 0 && scrollPosition < sectionHeight) {
        const progress = Math.min((scrollPosition / sectionHeight) * 100, 100);
        elements.timelineProgress.style.height = `${progress}%`;
    }
}

// ===== STAT COUNTERS =====
function initStatCounters() {
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

    // Trigger hero section immediately after loader
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        setTimeout(() => {
            const heroContent = heroSection.querySelector('.section-3d-content');
            if (heroContent) {
                heroContent.style.opacity = '1';
            }
            const reveals = heroSection.querySelectorAll('.section-header, .about-content, .skills-container, .contact-content');
            reveals.forEach((el, i) => {
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, i * 150);
            });
        }, 2000);
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
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
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
console.log('%c🚀 This portfolio features a stable cinematic 3D scroll experience.', 'font-size: 14px;');
console.log('%c📧 Feel free to reach out!', 'font-size: 14px;');
