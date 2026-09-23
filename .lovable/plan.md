# Interactive 3D orbital and probability surface

## What will change
- Replace the current flat orbital illustration with an interactive 3D visualization that users can rotate by dragging and zoom with the mouse wheel or touch gestures.
- Render the selected orbital as a translucent electron-density cloud around a clearly marked nucleus, with axes and orientation responding to the current magnetic quantum number.
- Add a dedicated “Probability surface” section immediately before “Compare two orbitals,” styled to match the supplied scientific reference.
- Keep both visualizations synchronized with the selected `n`, `ℓ`, and `m` values and preserve the existing radial plot and comparison tools.

## Technical details
- Add React Three Fiber, Drei, and Three.js for a client-side WebGL scene.
- Generate deterministic orbital point clouds procedurally, using radial probability to distribute electron points and angular shape functions for s, p, d, and higher-order families.
- Use orbit controls with constrained zoom, touch support, auto-rotation for the probability surface, stable camera framing, and reduced-motion awareness.
- Isolate the 3D canvas in focused components and remove the old CSS-only orbital shapes.
- Validate desktop and mobile layouts, drag rotation, selection updates, visible point clouds, and clean runtime output.
