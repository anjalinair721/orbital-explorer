# Interactive Orbital Plotter

## Goal
Turn the uploaded notebook into a polished, browser-based orbital explorer that follows the supplied light-blue scientific editorial reference.

## What I’ll build
- A guided quantum-number ladder for selecting principal (`n`), azimuthal (`l`), and magnetic (`m`) values.
- Live orbital naming, allowed-value explanations, node counts, and orbital summary as selections change.
- An interactive radial distribution chart calculated from the notebook’s hydrogenic wavefunction formulas.
- A comparison mode for plotting two valid orbitals on the same chart.
- A visual orbital-shape reference that responds to the selected subshell and orientation.
- Responsive layouts for desktop and mobile while preserving the reference’s typography, rounded scientific panels, grid background, cyan accents, magenta highlights, and dark navy summary panel.

## Technical details
- Recreate factorials and generalized Laguerre polynomials in TypeScript so all calculations run instantly in the browser.
- Use Recharts for accessible, responsive graphing and React state for controls.
- Add route-specific page metadata and load the selected editorial and mono fonts from the document head.
- Keep all colors and styling roles in the shared design system.

## Validation
- Verify valid quantum-number constraints and representative orbitals against the notebook formulas.
- Check the full interaction flow and chart rendering in the running preview at desktop and mobile widths.
- Confirm the final build is healthy with no runtime or console errors.
