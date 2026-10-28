export default {
  status: 'passed',
  checks: [
    {
      name: 'Four immersive desktop chapters',
      status: 'passed',
      evidence: '2026-10-27 actual 1440 × 900 capture review: the bottom-anchored half-body boy, enlarged India, skills constellation, and portal were visually inspected with readable content and reachable controls. The hero torso crossed the bottom by 38.16 px and cleared the name by 46.31 px; every chapter had zero horizontal overflow.',
    },
    {
      name: 'Numerical pre-revision chapter comparison',
      status: 'passed',
      evidence: 'At the same 1440 × 900 viewport, baseline 0d26249 and current projected bounds changed as follows: India 496.81 × 523.15 → 632.40 × 726.01 px (1.7665× area); Skills 648.48 × 515.59 → 927.38 × 745.25 px (2.0671× area); Contact 645.47 × 778.74 → 745.09 × 838.86 px (1.2435× area). Native-resolution baseline/current pixel review confirmed visibly larger subjects and the cleaned single India outline without the baseline extra island artifacts.',
    },
    {
      name: 'Four mobile chapters and responsive composition',
      status: 'passed',
      evidence: '2026-10-27 actual 390 × 844 mobile capture review: the top-centered name, bottom-anchored portrait, north-up India, constellation, and portal remained readable with zero horizontal overflow. The hero torso crossed the bottom by 39.66 px with 151.64 px heading clearance; Skills occupied 366.59 × 292.06 px and all essential controls were reachable.',
    },
    {
      name: 'Navigation, selections, accessible names, and projected pointer restoration',
      status: 'passed',
      evidence: 'Real-browser checks passed for native scrolling, all four header links, shortcuts 1–4, all arrow-key directions, every skill category, every experience row, and exact contact hrefs. The 2026-10-28 targeted review exposed Boy chapter, India chapter, Skills chapter, and Contact chapter in the mobile accessibility tree; native wheel input advanced scrollY from 0 to 700 and all compact links navigated without overflow. Projected India dissolution changed 3,542 desktop particles and 3,512 mobile particles. The nearest affected particle was 0.417 px from the desktop target and 0.635 px from the mobile target; weighted centroids were 19.217 px and 11.098 px away. Eight successive post-leave frames decreased and the 2,000 ms settling tail ended with exactly zero changed coordinates and zero maximum delta at both sizes.',
    },
    {
      name: 'Contrast, responsive frame measurement, reduced motion, and fallback',
      status: 'passed',
      evidence: 'Computed experience/footer color #71808c on actual background #05070b has 4.9617:1 WCAG relative-luminance contrast. Scroll events now measure progress without rebuilding target bounds; initialization, resize, and changed viewport/camera inputs rebuild static frames. A targeted transient-resize review settled correctly at 390 × 844. Across all four chapters at both 1440 × 900 and 390 × 844, reduced motion produced exact target buffers and chapter frames with zero position differences and static rig, camera, and ambient rotation. The earlier WebGL-disabled review kept all four semantic chapters and contact links readable with zero overflow and Static portfolio mode.',
    },
    {
      name: 'Editable root scene and Play controls',
      status: 'passed',
      evidence: 'The embedded root scene loaded dataUniverse, particleField, ambientDust, camera, and the dataField, dataMotion, and dataPalette groups with approved defaults. Particle-size and palette edits changed the live scene; normal-speed Play-canvas hashes differed while zero-speed hashes were identical.',
    },
    {
      name: 'Automated regression and production gate',
      status: 'passed',
      evidence: 'Final gate: npm test passed 50 of 50 tests; Edit3D compile check and production build passed; git diff --check passed.',
    },
  ],
  limitations: [
    'Native desktop toolbar and IPC integration were not exercised; editable-scene checks used the actual embedded browser scene.',
  ],
}
