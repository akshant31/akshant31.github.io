export default {
  status: 'passed',
  checks: [
    {
      name: 'Corrected PDF-derived India contour',
      status: 'passed',
      evidence: 'The reviewed northern and right-Ladakh source points were regenerated into one closed, north-up mainland ring. Actual northern and northeastern source overlays plus desktop, mobile, narrow, and tablet scene captures were inspected; no internal borders, labels, inset, or far-northeast trimming was introduced.',
    },
    {
      name: 'Persistent dark and light themes',
      status: 'passed',
      evidence: 'Real-browser checks confirmed the dark default, explicit light persistence across reload, usable in-memory toggling when storage is denied, keyboard operation with visible focus, computed color-scheme changes, and in-place scene recoloring with NormalBlending in light mode. Scene and geometry identity and the two point-field counts remained unchanged.',
    },
    {
      name: 'Four viewport families and collision-free compositions',
      status: 'passed',
      evidence: 'Every chapter was captured and visually inspected at 1440 × 900 and 390 × 844 in both themes, and at 320 × 740 and 768 × 1024 in dark. Measured essential-text/particle intersections, pairwise text collisions, and horizontal overflow were cleared after the final safe-zone adjustments; theme and chapter controls remained reachable.',
    },
    {
      name: 'Cinematic reveals and readable fallbacks',
      status: 'passed',
      evidence: 'Active chapter reveals reached full opacity and small scroll fluctuations did not restart inactive chapters. Reduced motion made all reveal content immediately visible with zero-duration transitions, no-JavaScript kept all chapters and contact content visible, and WebGL-disabled dark and light modes retained readable content and a working theme toggle.',
    },
    {
      name: 'Fine-pointer comet lifecycle',
      status: 'passed',
      evidence: 'Actual comet pixels were captured and then cleared after inactivity. One pointer-transparent bounded canvas was present on fine-pointer desktop; coarse-pointer and reduced-motion emulation removed it and restored the native cursor. Dynamic disposal removed the owned canvas, listeners, and scheduled frame.',
    },
    {
      name: 'Navigation, selection, and pointer restoration',
      status: 'passed',
      evidence: 'Native scrolling, all header links, shortcuts 1–4, adjacent-chapter arrow keys, every experience row, every skill category, and exact contact links passed real-browser checks. Pointer dissolution and successive damped post-leave frames ended in exact buffer restoration; reduced-motion buffers, rigging, camera, and ambient rotation remained static.',
    },
    {
      name: 'Editable project and Play controls',
      status: 'passed',
      evidence: 'The embedded scene exposed the expected project, artifact, objects, and parameter groups. Particle-size, motion, and palette controls changed the live scene, zero-speed Play frames were identical, and measured Play frames retained exactly two point-field draw calls.',
    },
    {
      name: 'Automated regression and production gate',
      status: 'passed',
      evidence: 'Final gate: npm test, Edit3D compile check, production build, and git diff --check passed on 2026-10-29; actual counts and existing nonfatal decoder/chunk warnings are recorded in the local cinematic-review evidence.',
    },
  ],
  limitations: [
    'Native desktop toolbar and IPC integration were not exercised; editable-scene checks used the actual embedded browser scene.',
    "Chrome does not support the brief-requested matchMedia('(color-scheme: light)') query; the actual computed CSS color-scheme, root theme state, blending, object identity, and particle counts were verified instead.",
  ],
}
