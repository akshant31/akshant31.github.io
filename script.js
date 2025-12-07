/**
 * Interactive Horizontal Portfolio - Data Journey
 * Horizontal scroll with animated character and parallax effects
 */

// ===== CONFIGURATION =====
const CONFIG = {
    scrollSensitivity: 1.5,
    lerpFactor: 0.08,
    sectionCount: 5,
    typingSpeed: 80,
    typingDelay: 1000,
    titles: ['Data Engineer', 'Pipeline Architect', 'Cloud Specialist', 'Problem Solver']
};

// ===== STATE =====
const state = {
    currentScroll: 0,
    targetScroll: 0,
    maxScroll: 0,
    isScrolling: false,
    scrollTimeout: null,
    currentSection: 0,
    characterWalking: false
};

// ===== DOM ELEMENTS =====
let elements = {};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initLoader();
    initHorizontalScroll();
    initParallax();
    initCharacter();
    initTypingEffect();
    initNavigation();
    initSectionAnimations();
    initStats();
});

function initElements() {
    elements = {
        loader: document.getElementById('loader'),
        journeyContainer: document.getElementById('journeyContainer'),
        sectionsTrack: document.getElementById('sectionsTrack'),
        progressFill: document.getElementById('progressFill'),
        progressDots: document.querySelectorAll('.progress-dot'),
        scrollHint: document.getElementById('scrollHint'),
        character: document.getElementById('character'),
        typedText: document.getElementById('typedText'),
        navPills: document.querySelectorAll('.nav-pill'),
        layerSky: document.getElementById('layerSky'),
        layerCity: document.getElementById('layerCity'),
        layerMid: document.getElementById('layerMid'),
        layerGround: document.getElementById('layerGround'),
        sections: document.querySelectorAll('.journey-section'),
        timelineItems: document.querySelectorAll('.timeline-item'),
        statValues: document.querySelectorAll('.stat-value')
    };

    // Calculate max scroll based on section count
    state.maxScroll = (CONFIG.sectionCount - 1) * window.innerWidth;
}

// ===== LOADER =====
function initLoader() {
    setTimeout(() => {
        elements.loader.classList.add('hidden');
    }, 2500);
}

// ===== HORIZONTAL SCROLL =====
function initHorizontalScroll() {
    // Wheel event for horizontal scrolling
    window.addEventListener('wheel', handleWheel, { passive: false });

    // Touch events for mobile
    let touchStartX = 0;
    let touchStartY = 0;

    window.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchStartX - touchX;
        const deltaY = touchStartY - touchY;

        // Use horizontal swipe if it's more horizontal than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            state.targetScroll += deltaX * 2;
            state.targetScroll = clamp(state.targetScroll, 0, state.maxScroll);
            touchStartX = touchX;
            e.preventDefault();
        }
    }, { passive: false });

    // Keyboard navigation
    window.addEventListener('keydown', handleKeyboard);

    // Resize handler
    window.addEventListener('resize', handleResize);

    // Start animation loop
    requestAnimationFrame(animationLoop);
}

function handleWheel(e) {
    e.preventDefault();

    // Convert vertical scroll to horizontal
    const delta = e.deltaY * CONFIG.scrollSensitivity;
    state.targetScroll += delta;
    state.targetScroll = clamp(state.targetScroll, 0, state.maxScroll);

    // Hide scroll hint after first scroll
    if (elements.scrollHint && !elements.scrollHint.classList.contains('hidden')) {
        elements.scrollHint.classList.add('hidden');
    }

    // Set scrolling state
    setScrollingState(true);
}

function handleKeyboard(e) {
    const scrollAmount = window.innerWidth * 0.3;

    switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
            state.targetScroll += scrollAmount;
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            state.targetScroll -= scrollAmount;
            break;
        case 'Home':
            state.targetScroll = 0;
            break;
        case 'End':
            state.targetScroll = state.maxScroll;
            break;
        default:
            return;
    }

    state.targetScroll = clamp(state.targetScroll, 0, state.maxScroll);
    setScrollingState(true);
}

function handleResize() {
    state.maxScroll = (CONFIG.sectionCount - 1) * window.innerWidth;
    state.targetScroll = clamp(state.targetScroll, 0, state.maxScroll);
}

function setScrollingState(isScrolling) {
    state.isScrolling = isScrolling;

    clearTimeout(state.scrollTimeout);
    state.scrollTimeout = setTimeout(() => {
        state.isScrolling = false;
    }, 150);
}

// ===== ANIMATION LOOP =====
function animationLoop() {
    // Lerp current scroll towards target
    state.currentScroll += (state.targetScroll - state.currentScroll) * CONFIG.lerpFactor;

    // Apply horizontal translation to sections
    if (elements.sectionsTrack) {
        elements.sectionsTrack.style.transform = `translateX(${-state.currentScroll}px)`;
    }

    // Update progress
    updateProgress();

    // Update parallax layers
    updateParallax();

    // Update character animation
    updateCharacter();

    // Update active section
    updateActiveSection();

    // Continue animation loop
    requestAnimationFrame(animationLoop);
}

// ===== PROGRESS =====
function updateProgress() {
    const progress = (state.currentScroll / state.maxScroll) * 100;

    if (elements.progressFill) {
        elements.progressFill.style.width = `${progress}%`;
    }
}

// ===== PARALLAX =====
function initParallax() {
    // Initial positioning
    updateParallax();
}

function updateParallax() {
    const scrollPercent = state.currentScroll / state.maxScroll;

    // Different speeds for each layer
    const speeds = {
        sky: 0.1,
        city: 0.2,
        mid: 0.4,
        ground: 0.6
    };

    if (elements.layerSky) {
        const skyOffset = -scrollPercent * window.innerWidth * 2 * speeds.sky;
        elements.layerSky.style.transform = `translateX(${skyOffset}px)`;
    }

    if (elements.layerCity) {
        const cityOffset = -scrollPercent * window.innerWidth * 2 * speeds.city;
        elements.layerCity.style.transform = `translateX(${cityOffset}px)`;
    }

    if (elements.layerMid) {
        const midOffset = -scrollPercent * window.innerWidth * 2 * speeds.mid;
        elements.layerMid.style.transform = `translateX(${midOffset}px)`;
    }

    if (elements.layerGround) {
        const groundOffset = -scrollPercent * window.innerWidth * 2 * speeds.ground;
        elements.layerGround.style.transform = `translateX(${groundOffset}px)`;
    }
}

// ===== CHARACTER =====
function initCharacter() {
    // Character starts idle
    updateCharacter();
}

function updateCharacter() {
    if (!elements.character) return;

    // Check if scrolling to trigger walking animation
    const isMoving = Math.abs(state.targetScroll - state.currentScroll) > 1;

    if (isMoving && !state.characterWalking) {
        elements.character.classList.add('walking');
        state.characterWalking = true;
    } else if (!isMoving && state.characterWalking) {
        elements.character.classList.remove('walking');
        state.characterWalking = false;
    }
}

// ===== ACTIVE SECTION =====
function updateActiveSection() {
    const sectionWidth = window.innerWidth;
    const newSection = Math.round(state.currentScroll / sectionWidth);

    if (newSection !== state.currentSection) {
        state.currentSection = newSection;

        // Update progress dots
        elements.progressDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === newSection);
        });

        // Update nav pills
        elements.navPills.forEach((pill, index) => {
            pill.classList.toggle('active', index === newSection);
        });

        // Trigger section-specific animations
        triggerSectionAnimation(newSection);
    }
}

// ===== SECTION ANIMATIONS =====
function initSectionAnimations() {
    // Make first section's elements visible
    triggerSectionAnimation(0);
}

function triggerSectionAnimation(sectionIndex) {
    // Experience timeline items
    if (sectionIndex === 3) {
        elements.timelineItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * 200);
        });
    }

    // Stats counter
    if (sectionIndex === 1) {
        animateStats();
    }
}

// ===== STATS COUNTER =====
function initStats() {
    // Stats will animate when About section is reached
}

function animateStats() {
    elements.statValues.forEach(stat => {
        const target = parseInt(stat.dataset.target);
        let current = 0;
        const increment = target / 50;
        const duration = 1500;
        const stepTime = duration / 50;

        const counter = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(counter);
            }
            stat.textContent = Math.floor(current);
        }, stepTime);
    });
}

// ===== TYPING EFFECT =====
function initTypingEffect() {
    if (!elements.typedText) return;

    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentTitle = CONFIG.titles[titleIndex];

        if (isDeleting) {
            charIndex--;
            elements.typedText.textContent = currentTitle.substring(0, charIndex);
        } else {
            charIndex++;
            elements.typedText.textContent = currentTitle.substring(0, charIndex);
        }

        let typeSpeed = CONFIG.typingSpeed;

        if (!isDeleting && charIndex === currentTitle.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            titleIndex = (titleIndex + 1) % CONFIG.titles.length;
            typeSpeed = 500;
        }

        setTimeout(type, isDeleting ? typeSpeed / 2 : typeSpeed);
    }

    setTimeout(type, CONFIG.typingDelay);
}

// ===== NAVIGATION =====
function initNavigation() {
    // Progress dots click
    elements.progressDots.forEach((dot, index) => {
        dot.addEventListener('click', () => navigateToSection(index));
    });

    // Nav pills click
    elements.navPills.forEach((pill, index) => {
        pill.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToSection(index);
        });
    });
}

function navigateToSection(index) {
    state.targetScroll = index * window.innerWidth;
    state.targetScroll = clamp(state.targetScroll, 0, state.maxScroll);

    // Hide scroll hint
    if (elements.scrollHint) {
        elements.scrollHint.classList.add('hidden');
    }
}

// ===== UTILITY FUNCTIONS =====
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}
