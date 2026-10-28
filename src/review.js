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
      name: 'Navigation, selections, damped pointer restoration, and contact links',
      status: 'passed',
      evidence: 'Real-browser checks passed for native scrolling, all four header links, shortcuts 1–4, all arrow-key directions, every skill category, and every experience row. Pointer input changed 12,765 coordinates. Ten successive post-leave frames remained nonzero and decreased: RMS displacement fell from 0.016394712 to 0.001942856 with successive ratios 0.7655–0.8756, while maximum displacement fell from 0.140829697 to 0.016689032. After the 2,000 ms settling tail, changed coordinates, RMS, and maximum delta were all exactly zero. Email and GitHub hrefs remained mailto:akst31@yahoo.com and https://github.com/akshant31 without inspection navigating away.',
    },
    {
      name: 'Reduced motion and WebGL-disabled fallback',
      status: 'passed',
      evidence: 'At all four chapters, reduced motion produced exact target buffers and chapter frames with zero position differences and static rig, camera, and ambient rotation. With WebGL disabled, all four semantic chapters and contact links remained readable with zero overflow and Static portfolio mode.',
    },
    {
      name: 'Editable root scene and Play controls',
      status: 'passed',
      evidence: 'The embedded root scene loaded dataUniverse, particleField, ambientDust, camera, and the dataField, dataMotion, and dataPalette groups with approved defaults. Particle-size and palette edits changed the live scene; normal-speed Play-canvas hashes differed while zero-speed hashes were identical.',
    },
    {
      name: 'Automated regression and production gate',
      status: 'passed',
      evidence: 'Final gate: npm test passed 45 of 45 tests; Edit3D compile check and production build passed; git diff --check passed.',
    },
  ],
  limitations: [
    'Native desktop toolbar and IPC integration were not exercised; editable-scene checks used the actual embedded browser scene.',
  ],
}
