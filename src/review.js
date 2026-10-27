export default {
  status: 'passed',
  checks: [
    {
      name: 'Four immersive desktop chapters',
      status: 'passed',
      evidence: '2026-10-27 actual 1440 × 900 capture review: the bottom-anchored half-body boy, enlarged India, skills constellation, and portal were visually inspected with readable content and reachable controls. The hero torso crossed the bottom by 38.16 px and cleared the name by 46.31 px; every chapter had zero horizontal overflow.',
    },
    {
      name: 'Four mobile chapters and responsive composition',
      status: 'passed',
      evidence: '2026-10-27 actual 390 × 844 mobile capture review: the top-centered name, bottom-anchored portrait, north-up India, constellation, and portal remained readable with zero horizontal overflow. The hero torso crossed the bottom by 39.66 px with 151.64 px heading clearance; Skills occupied 366.59 × 292.06 px and all essential controls were reachable.',
    },
    {
      name: 'Navigation, selections, pointer restoration, and contact links',
      status: 'passed',
      evidence: 'Real-browser checks passed for native scrolling, all four header links, shortcuts 1–4, all arrow-key directions, every skill category, and every experience row. Pointer input changed 12,651 coordinates with maximum displacement 0.29030419141054153; pointer leave restored the settled target exactly. Email and GitHub hrefs remained mailto:akst31@yahoo.com and https://github.com/akshant31 without inspection navigating away.',
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
      evidence: 'Final gate: npm test passed 44 of 44 tests; Edit3D compile check and production build passed; git diff --check passed.',
    },
  ],
  limitations: [
    'Native desktop toolbar and IPC integration were not exercised; editable-scene checks used the actual embedded browser scene.',
    'No pre-revision chapter captures were available; enlargement was assessed from current composition and measured bounds without a numerical before/after claim.',
  ],
}
