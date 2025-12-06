/* =====================================
   DATA ENGINEER PORTFOLIO - JAVASCRIPT
   Interactive Story-like Portfolio
   ===================================== */

// ===== CONFIGURATION =====
const CONFIG = {
    typingSpeed: 100,
    typingDelay: 1000,
    particleCount: 30,
    scrollThreshold: 0.1,
    animationDuration: 800,
    name: "Akshant Kumar" // Your name for typing animation
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
    sections: document.querySelectorAll('.section')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initParticles();
    initTypingEffect();
    initScrollEffects();
    initNavigation();
    initTimelineAnimations();
    initStatCounters();
    initRevealAnimations();
    initSkillHovers();
});

// ===== LOADER =====
function initLoader() {
    // Hide loader after content loads
    window.addEventListener('load', () => {
        setTimeout(() => {
            elements.loader.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 1500); // Show loader for at least 1.5s for effect
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

    // Random properties
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

    elements.particles.appendChild(particle);
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
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
}

function handleScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    // Update progress bar
    elements.progressBar.style.width = `${scrollPercent}%`;

    // Parallax effect for background layers
    updateParallax(scrollTop);

    // Update active navigation
    updateActiveNav(scrollTop);

    // Update timeline progress
    updateTimelineProgress(scrollTop);
}

function updateParallax(scrollTop) {
    const parallaxSpeed = {
        stars: 0.3,
        nebula: 0.5,
        planets: 0.7
    };

    if (elements.layerStars) {
        elements.layerStars.style.transform = `translateY(${scrollTop * parallaxSpeed.stars}px)`;
    }
    if (elements.layerNebula) {
        elements.layerNebula.style.transform = `translateY(${scrollTop * parallaxSpeed.nebula}px)`;
    }
    if (elements.layerPlanets) {
        elements.layerPlanets.style.transform = `translateY(${scrollTop * parallaxSpeed.planets}px)`;
    }
}

function updateActiveNav(scrollTop) {
    let currentSection = 0;

    elements.sections.forEach((section, index) => {
        const sectionTop = section.offsetTop - 200;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollTop >= sectionTop && scrollTop < sectionBottom) {
            currentSection = index;
        }
    });

    elements.navLinks.forEach((link, index) => {
        link.classList.toggle('active', index === currentSection);
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

    // Nav background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            elements.nav.style.background = 'rgba(10, 10, 26, 0.95)';
        } else {
            elements.nav.style.background = 'rgba(10, 10, 26, 0.8)';
        }
    });
}

// ===== TIMELINE ANIMATIONS =====
function initTimelineAnimations() {
    const timelineObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.2 }
    );

    elements.timelineItems.forEach(item => {
        timelineObserver.observe(item);
    });
}

function updateTimelineProgress(scrollTop) {
    const experienceSection = document.getElementById('experience');
    if (!experienceSection) return;

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
    const statObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    statObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    elements.statNumbers.forEach(stat => {
        statObserver.observe(stat);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
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
    const revealElements = document.querySelectorAll('.section-header, .about-content, .skills-container, .projects-grid, .contact-content');

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        },
        { threshold: 0.1 }
    );

    revealElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.8s ease';
        revealObserver.observe(element);
    });
}

// ===== SKILL HOVERS =====
function initSkillHovers() {
    elements.skillNodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            // Pause orbit animation on hover
            node.closest('.skill-orbit').style.animationPlayState = 'paused';
        });

        node.addEventListener('mouseleave', () => {
            // Resume orbit animation
            node.closest('.skill-orbit').style.animationPlayState = 'running';
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

// ===== MOUSE FOLLOWER EFFECT (Optional Enhancement) =====
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

        // Add hover effects to interactive elements
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
    // Fun animation when Konami code is entered
    document.body.style.animation = 'rainbow 3s ease';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 3000);

    // Add rainbow animation to CSS dynamically
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
// Debounce function for scroll events
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

// Throttle function for animation frames
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

console.log('%c👋 Hey there, fellow developer! Curious about the code?', 'font-size: 14px;');
console.log('%c📧 Feel free to reach out!', 'font-size: 14px;');
