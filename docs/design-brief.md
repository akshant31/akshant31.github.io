# 3D Data Universe — Production Design Brief

## One-line concept

A calm, editorial portfolio in which thousands of records continually organize themselves into the systems Akshant builds: pipelines, skill networks, career milestones, and reliable data structures.

## Requirements checklist

- [ ] Reuse the current portfolio's real content without invented claims.
- [ ] Work on a new branch, leaving production untouched.
- [ ] Build a 3D experience inspired by the supplied particle reference.
- [ ] Make the subject communicate data engineering rather than a generic space theme.
- [ ] Include Home, About, Skills, Experience, and Contact.
- [ ] Support scroll, pointer, touch, keyboard, and direct navigation.
- [ ] Keep semantic HTML readable without WebGL.
- [ ] Provide responsive and reduced-motion behavior.
- [ ] Provide an embedded Edit3D scene plus the normal portfolio runtime.
- [ ] Register meaningful objects, named materials, and working parameters.
- [ ] Complete visual review, interaction checks, build checks, and cleanup.

## Reference feature → approach

| Reference feature observed/researched | Approach in this piece |
| --- | --- |
| Full-screen human silhouette made from fine particles | Full-screen abstract data core and morphing engineering structures; no portrait or copied geometry |
| Hover dissolution and reconstruction | Local pointer repulsion with damped return to the active data shape |
| Scroll-driven particle morphing | Five deterministic target shapes tied to semantic portfolio sections |
| Dark, restrained stage | Graphite background and cool-gray particles with the existing cyan/violet accents |
| Oversized, minimal typography | Editorial Inter headings and compact Fira Code technical labels |
| Motion as the main visual subject | One persistent 12,000-point subject rather than unrelated decorative effects |
| Microinteractions | Skill/milestone emphasis, nav state, subtle link motion, and tactile buttons |
| Content layered around the subject | Text occupies deliberate safe zones; WebGL never carries essential copy |

## Scale and layout

Three.js units are abstract but consistent. The subject fits approximately 10 × 10 × 8 units. Main camera: perspective 42°, near 0.1, far 100, initial position `[0, 0.2, 18]`. The primary subject remains near the origin.

```text
Desktop: [ editorial text safe zone ] [ 3D subject safe zone ]
Mobile:  [ compact 3D stage ] / [ semantic content ]

Raw cloud → pipeline → constellation → helix → lattice
   Home      About       Skills      Experience   Contact
```

## Palette and materials

| Material | Color | Roughness / metalness | Treatment |
| --- | --- | --- | --- |
| Data Universe · Particle Field | cool gray with cyan/violet accents | Unlit PointsMaterial | Fixed-size soft particles; no bloom |
| Data Universe · Network Links | `#244152` plus active cyan | Unlit LineBasicMaterial | Sparse transparent connections |
| Data Universe · Core Rings | cyan/violet | Unlit MeshBasicMaterial | Thin geometric rings, restrained opacity |
| Background | `#0B0D12` | N/A | Solid scene background |
| UI text | `#E8EBF2` / `#8A93A6` | N/A | High contrast, never pure white |

Particles and line effects are intentionally unlit stylized data representations; realistic PBR, outdoor sky, terrain, and Blender assets are not appropriate to this brief.

## Light and atmosphere

No realistic lighting rig is needed for unlit particles. Depth comes from perspective, particle size attenuation, controlled opacity, spatial layering, and camera parallax. Use the plugin's ACES tone-mapping helper for consistent output. Avoid post-processing and bloom.

## Main views and review views

1. Home: complete particle core with name and role unobstructed.
2. About: pipeline direction readable; terminal panel legible.
3. Skills: constellation and selected group emphasis visible.
4. Experience: helix and active milestone readable.
5. Contact: ordered lattice and contact links unobstructed.
6. Edit3D contact sheet: edit framing plus three orbit views of the subject.
7. Mobile: no horizontal overflow, blocked controls, or unreadable overlay.

## Interaction and UI

Normal mode: semantic nav, scroll, pointer dissolve, skill-group selection, experience-milestone selection, email/GitHub links. Embedded Play: five labeled shape buttons, shortcuts `1`–`5`, arrow-key section movement, and a one-line usage hint visible from the first frame. Escape returns to editing through the host's existing behavior.

## Editable items

- Data Universe object: transform and visibility through normal object controls.
- Particle Field material: opacity, color, and other material properties supported by the SDK.
- Global Data Field group: particle size, applied directly to the PointsMaterial and verified visually.
- Global Data Motion group: motion speed and flow intensity, read live during Play.
- Global Data Palette group: cyan and violet accent colors, applied through an SDK subscription.
- Main camera: normal camera controls.

No particle-count control is exposed unless rebuilding and restore behavior are fully implemented and tested.

## Performance budget

Approximately 12,000 points in one draw call, fewer than 150 line segments, three thin core rings, and no shadow-casting lights. No per-frame geometry/material creation. Reuse vectors and typed arrays. Cap renderer pixel ratio through the SDK. Target smooth browsing on a typical laptop and readable fallback on smaller devices.

## Routing

- Particle field, morph targets, network lines, rings, camera, and interaction: Three.js, because all are generated and change live.
- Blender: installed and verified as local tooling, but no major element routes to it. The piece contains no organic characters, sculpted forms, architecture, UV-baked surfaces, or static hero props requiring Blender.
- External models/textures: none. All geometry is deterministic and code-generated.

## Review and delivery

Record only checks actually run in `src/review.js`. Complete a find → fix → re-verify visual round before marking review passed. Keep source, review evidence, project data, and the real artifact ID. Deliver the branch and preview without merging or deploying production.
