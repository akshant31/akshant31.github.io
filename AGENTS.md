# AGENTS.md — AI Coding Agent Guide

> This file documents the project structure, conventions, and critical details for AI coding agents working on this repository. The human-readable overview lives in `README.md`.

---

## Project Overview

This is a **single-page static portfolio website** for Akshant Kumar, a Data Engineer. It is deployed via **GitHub Pages** at `https://akshant31.github.io` (repository `akshant31/akshant31.github.io`).

The site features a cyberpunk/space-tech aesthetic with extensive CSS animations, parallax layers, floating particles, lightning effects, and interactive elements. It is built entirely with vanilla web technologies — no frameworks, no build tools, and no package manager.

### Key Characteristics
- **Type**: Static personal portfolio / resume site
- **Audience**: Recruiters, hiring managers, fellow developers
- **Language**: English (all content, comments, and documentation)
- **License**: Not explicitly declared

---

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Markup | HTML5 | Semantic sections, no templating engine |
| Styling | CSS3 | ~3000 lines, heavy use of CSS variables, keyframe animations, glassmorphism |
| Scripting | Vanilla JavaScript (ES6+) | ~550 lines, no frameworks, no bundler |
| Fonts | Google Fonts | Orbitron (display), Fira Code (mono), Inter (body) |
| Hosting | GitHub Pages | Auto-deploys from `master` branch |
| Dependencies | None | Zero runtime or build dependencies |

**There is no `package.json`, no `pyproject.toml`, no `Cargo.toml`, and no build configuration.** This is intentionally a zero-dependency static site.

---

## File Structure

```
akshant31.github.io/
├── index.html          # Main HTML — 5 sections, semantic structure, inline IDs for JS hooks
├── style.css           # All styles — CSS variables, animations, responsive breakpoints, theming
├── script.js           # All interactivity — scroll effects, particles, typing animation, theme toggle
├── README.md           # Human-facing documentation
└── AGENTS.md           # This file
```

### File Roles
- **`index.html`** — Contains the full DOM structure. Sections are: Hero, About, Skills, Experience, Contact. Uses emoji icons and CSS-only illustrations (astronaut, planets, terminal window, signal waves).
- **`style.css`** — Single stylesheet with theming via CSS custom properties (`:root` and `[data-theme="light"]`). Includes responsive breakpoints at `1200px`, `768px`, and `480px`.
- **`script.js`** — All JavaScript is in one file. Uses `DOMContentLoaded` to initialize modules. No module system; functions are organized by feature.

---

## Architecture & Code Organization

### HTML Structure
The page is a single scrollable document with:
1. **Loading screen** (`#loader`) — Pipeline animation shown on initial load
2. **Progress bar** (`#progressBar`) — Fixed top bar indicating scroll progress
3. **Vertical navigation** (`#nav`) — Fixed right-side nav with icon links and tooltips
4. **Main scroll container** (`#scrollContainer`) — Contains parallax layers, particles, floating text, lightning effects, and all content sections
5. **Five content sections** inside `.sections-wrapper`:
   - `#hero` — Animated astronaut (CSS-only), typing name effect, CTA buttons, floating data nodes
   - `#about` — Terminal-style code block, avatar rings, stat counters
   - `#skills` — Orbital skill visualization + category cards with skill tags
   - `#experience` — Vertical timeline with 4 job entries (Ametris, Biofourmis, Tribes.AI, Infosys)
   - `#contact` — Contact links panel with signal wave animations

### CSS Architecture
- **CSS Variables** defined in `:root` for the default dark theme and overridden in `[data-theme="light"]` for light mode.
- **Color tokens**: `--color-bg-primary`, `--color-accent-cyan`, `--color-accent-purple`, `--color-text-primary`, etc.
- **Typography tokens**: `--font-display` (Orbitron), `--font-mono` (Fira Code), `--font-body` (Inter).
- **Transition tokens**: `--transition-fast`, `--transition-medium`, `--transition-slow` using `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Glow tokens**: `--glow-cyan`, `--glow-purple`, `--glow-pink`.
- **Section sizing**: Sections are `min-height: 100vh` with padding that reserves space for the right-side navigation (`padding-right: 120px`).
- **Major CSS sections** (in order): CSS Variables, Light Theme, Reset & Base, Loading Screen, Progress Bar, Navigation, Floating Background Text, Lightning Bolts, Parallax Layers, Particles, Section Base, Hero, About, Skills, Experience, Contact, Responsive Design, Scroll Animations, Enhanced Animations (shimmer, card lift).

### JavaScript Architecture
The script is organized into feature-based init functions called from a single `DOMContentLoaded` listener:

| Function | Purpose |
|----------|---------|
| `initScrollModeToggle()` | Forces vertical scroll mode; hides horizontal toggle button |
| `initThemeToggle()` | Reads/writes `localStorage` theme preference (`dark`/`light`) |
| `initLoader()` | Hides loader after `window.load` + 1.5s delay |
| `initParticles()` | Creates 30 floating particles with random colors from a palette |
| `initTypingEffect()` | Types out the name character-by-character into `#typedName` |
| `initScrollEffects()` | Sets up smooth scroll loop, progress bar, parallax, active nav |
| `initNavigation()` | Smooth-scrolls to sections on nav link click |
| `initTimelineAnimations()` | IntersectionObserver to fade-in timeline items |
| `initStatCounters()` | IntersectionObserver-triggered animated number counting |
| `initRevealAnimations()` | Fade-up reveal for section headers and content blocks |
| `initSkillHovers()` | Pauses orbit animation on hover |

Utility functions:
- `debounce(func, wait)` — For scroll events
- `throttle(func, limit)` — For animation frames

**State object**: `scrollState` tracks scroll mode (`vertical` only), target/current X for lerping, and ease factor.

**Configuration object**: `CONFIG` at top of file controls typing speed, particle count, animation duration, and name text.

**Unused / commented-out features**:
- `MouseFollower` class — Creates a custom cursor with dot and ring. Currently commented out at bottom of file. If enabled, it requires corresponding `.custom-cursor` CSS styles that may not exist.
- Horizontal scroll mode — Code exists for horizontal scrolling with lerp-based smooth translation, but `initScrollModeToggle()` forces vertical mode and hides the toggle button.

**Easter eggs**:
- **Console ASCII art**: Prints stylized text and a friendly message to the browser console on load.
- **Konami code**: Entering ↑↑↓↓←→←→BA triggers a rainbow hue-rotate animation on the entire page for 3 seconds.

---

## Development Conventions

### Naming Conventions
- **CSS classes**: Kebab-case. Section-scoped prefixes used: `.section-hero`, `.section-about`, `.hero-*`, `.about-*`, etc.
- **IDs**: camelCase. Used for JavaScript DOM hooks (`#typedName`, `#scrollContainer`, `#particles`).
- **JavaScript**: camelCase for variables and functions. Constants are `SCREAMING_SNAKE_CASE` inside `CONFIG`.
- **CSS variables**: kebab-case with `--` prefix, organized by category (`--color-*`, `--font-*`, `--transition-*`).

### Comment Style
- CSS uses block comments with decorative banners: `/* ===== SECTION NAME ===== */`
- JavaScript uses similar banners: `// ===== FEATURE NAME =====`
- Comments are descriptive and mark logical groupings.

### Emoji Usage
The site uses emoji characters directly in HTML for icons (house, person, bolt, briefcase, envelope, octopus, etc.) rather than icon fonts or SVGs.

---

## Theming

The site supports two themes controlled by `data-theme` on the `<html>` element:
- **Dark** (default): Deep space blues (`#0a0a1a`), neon cyan/purple/pink accents.
- **Light**: Soft blue-white gradient background, deeper accent colors for contrast.

Theme preference is persisted to `localStorage` under the key `theme`. The toggle button is in the fixed nav bar.

When adding new styled components, **always provide both dark and light theme styles**. Light theme overrides live in `style.css` under the `/* ===== LIGHT THEME ===== */` section and use the `[data-theme="light"]` selector prefix.

---

## Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| `max-width: 1200px` | Tablets and small desktops — stack grids, reduce gaps, shrink skill visualization |
| `max-width: 768px` | Mobile — hide skill visualization, compact nav, hide nav tooltips/social, reduce padding |
| `max-width: 480px` | Small mobile — scale down astronaut, stack CTA buttons, reduce font sizes, compact card headers |

The navigation remains fixed on the right side across all breakpoints but shrinks in size on mobile.

---

## Build & Deployment

### No Build Step
This project has **no build process**. To preview locally, simply open `index.html` in a browser or serve the directory with any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js npx
npx serve .
```

### Deployment
GitHub Pages is configured to serve the `master` branch of this repository. Pushing to `master` automatically updates the live site.

```bash
# Standard deployment flow
git add .
git commit -m "Describe changes"
git push origin master
```

**Do not run `git commit`, `git push`, or other git mutations unless explicitly asked.**

### Branches
- `master` — Main branch, auto-deployed to GitHub Pages
- `interactive-v2` — Alternate branch (remote only), possibly containing an earlier or experimental version

---

## Testing Strategy

There are **no automated tests** in this project. Testing is entirely manual and visual:

1. **Browser testing**: Verify in Chrome, Firefox, Safari, and Edge.
2. **Responsive testing**: Test at breakpoints `1200px`, `768px`, `480px`, and actual mobile devices.
3. **Theme testing**: Toggle between dark and light modes; verify all elements update.
4. **Scroll testing**: Verify progress bar updates, nav highlighting changes, timeline items fade in, and stat counters animate.
5. **Performance**: Watch for animation jank; the site uses `requestAnimationFrame` for the smooth scroll loop.
6. **Easter eggs**: Verify console ASCII art appears and Konami code triggers the rainbow animation.

### Common Issues to Watch For
- **Z-index stacking**: The loader is `z-index: 10000`, nav is `z-index: 900`, parallax layers are negative. New fixed/absolute elements must respect this hierarchy.
- **Scroll hijacking**: The JS listens to `window.scroll` for progress and nav updates. Avoid adding libraries that override native scroll behavior.
- **CSS specificity**: Light theme overrides use attribute selectors; ensure new component styles are added in both dark and light sections.
- **Particle count**: 30 particles are created on load. Increasing this significantly may impact performance on low-end devices.

---

## Security Considerations

- **No user input**: This is a static read-only site with no forms that submit data.
- **External links**: Contact section links to `mailto:` and GitHub (`target="_blank"`). No untrusted external resources.
- **CDN usage**: Google Fonts are loaded from `fonts.googleapis.com` and `fonts.gstatic.com`. No other third-party scripts.
- **Console easter eggs**: The script prints ASCII art and a friendly message to the browser console. It does not expose sensitive data.

---

## Quick Reference for Agents

### When modifying styles
- Check both `:root` (dark) and `[data-theme="light"]` sections.
- Use existing CSS variables before hardcoding colors.
- Respect the transition tokens (`--transition-fast`, etc.).
- Test responsive breakpoints if the component is visible on all screen sizes.
- The CSS file is large (~3000 lines); use the decorative banner comments to locate the correct section.

### When modifying JavaScript
- Add new init functions and call them from the `DOMContentLoaded` listener.
- Query DOM elements via the `elements` object at the top of the file when possible.
- Use `IntersectionObserver` for scroll-triggered animations rather than scroll event listeners.
- The smooth scroll loop runs via `requestAnimationFrame`; do not add heavy computations inside `smoothScrollLoop`.
- Be aware that horizontal scroll code exists but is disabled; do not accidentally re-enable it.

### When modifying HTML
- Maintain semantic `<section>` structure with `id` attributes for nav anchoring.
- Ensure nav links (`<a href="#sectionId">`) are updated if sections are added, removed, or reordered.
- Preserve `data-section` attributes on nav links for active state tracking.
