export default {
  status: 'passed',
  checks: [
    {
      name: 'Five desktop chapters and camera composition',
      status: 'passed',
      evidence: '2026-10-25 desktop screenshot review: raw cloud, pipeline, constellation, helix, and lattice were distinct and readable; camera centering and low contrast were fixed and rechecked with no overflow or runtime errors.',
    },
    {
      name: 'Five mobile chapters and content accessibility',
      status: 'passed',
      evidence: '2026-10-25 390 × 844 screenshot review: every section remained readable without horizontal overflow; the fixed scene status was hidden on phones and the About and Experience sections were rechecked.',
    },
    {
      name: 'Portfolio navigation and scene interactions',
      status: 'passed',
      evidence: 'Browser checks passed for navigation links, Digit1/Digit4/ArrowLeft shortcuts, skill and experience emphasis, pointer dissolution and parallax, and contact hrefs; no runtime or console errors were captured.',
    },
    {
      name: 'Reduced motion and no-WebGL fallback',
      status: 'passed',
      evidence: 'With reduced motion, particle buffers and ambient rotations were identical across 450 ms. With WebGL disabled, all five sections stayed visible, navigation worked, and static portfolio mode replaced the canvas.',
    },
    {
      name: 'Automated content and visual regression checks',
      status: 'passed',
      evidence: 'npm test passed 22 of 22 tests, including deterministic morphs, camera framing, particle contrast, mobile overlap prevention, reduced-motion behavior, and editor-owned material replacement.',
    },
    {
      name: 'Standalone editor parameters, history, and persistence',
      status: 'passed',
      evidence: 'Scene lint returned no issues and framing offset was zero. Particle size and palette edits changed the real scene; undo/redo restored both parameters and editor-owned ring materials. Save/reload preserved the test values, then the approved defaults were restored and verified with no console errors.',
    },
    {
      name: 'Standalone editor Play and visual inspection',
      status: 'passed',
      evidence: 'Four-view contact sheet and Play screenshots were visually reviewed. Raw and Lattice chapter controls changed the actual Play particle buffer (hash 78786213 to 995418464), and the rendered lattice matched its target with zero sampled x-coordinate error.',
    },
  ],
  limitations: ['Editor checks used the standalone offscreen SDK surface; native desktop toolbar and IPC integration were not exercised.'],
}
