---
name: Constructo GitHub-Inspired Dark Engine
colors:
  surface: '#10141a'
  surface-dim: '#10141a'
  surface-bright: '#353940'
  surface-container-lowest: '#0a0e14'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2eb'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dfe2eb'
  inverse-on-surface: '#2d3137'
  outline: '#8c90a0'
  outline-variant: '#424754'
  surface-tint: '#afc6ff'
  primary: '#afc6ff'
  on-primary: '#002d6d'
  primary-container: '#1f6feb'
  on-primary-container: '#fffcff'
  inverse-primary: '#0059c8'
  secondary: '#a2c9ff'
  on-secondary: '#00315c'
  secondary-container: '#0071c7'
  on-secondary-container: '#f0f4ff'
  tertiary: '#7bdb80'
  on-tertiary: '#00390e'
  tertiary-container: '#238636'
  on-tertiary-container: '#f9fff3'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001944'
  on-primary-fixed-variant: '#004299'
  secondary-fixed: '#d3e4ff'
  secondary-fixed-dim: '#a2c9ff'
  on-secondary-fixed: '#001c38'
  on-secondary-fixed-variant: '#004882'
  tertiary-fixed: '#97f999'
  tertiary-fixed-dim: '#7bdb80'
  on-tertiary-fixed: '#002106'
  on-tertiary-fixed-variant: '#005319'
  background: '#10141a'
  on-background: '#dfe2eb'
  surface-variant: '#31353c'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  title-project:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  badge-compact:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system blends developer-grade technical precision with high-density construction management workflows. Taking direct inspiration from GitHub's utilitarian dark mode, the aesthetic prioritizes deep contrast, spatial density, and micro-hierarchy over decorative flourishes. 

The aesthetic marries **Minimalism** with **Tonal Outlines**: sharp visual structure created through explicit 1px borders, subtle tonal layering, and deliberate typography. It is engineered for civil engineers, site managers, and project directors who demand immediate data visibility, dense tabular lists, rapid status comprehension, and zero visual fatigue under continuous exposure.

Key emotional anchors:
- **Operative Rigor:** UI surfaces feel like an industrial instrument dashboard—clean, systematic, and uncompromisingly functional.
- **Immediate Clarity:** Construction project identifiers, progress indicators, and actionable statuses take priority through controlled accent hues and sharp monochrome boundaries.
- **Calm Density:** High information volume is tempered by deep obsidian backgrounds (`#010409` canvas to `#0d1117` surface) and crisp wireframe separation.

## Colors

The palette relies on GitHub-inspired slate, deep navy, and pitch-black undertones, augmented by refined semantic status tokens tailored to building milestones and task tracking.

### Core Architecture
- **Canvas / Background (`#010409`):** Root view background for deep canvas contrast behind elevated panels.
- **Surface (`#0d1117`):** Primary card, panel, and data-table container color.
- **Surface Muted (`#161b22`):** Secondary regions, nested modules, and table headers.
- **Surface Hover (`#21262d`):** Interactive state for table rows, action items, and list entries.
- **Surface Selected (`#12243a`):** Active row and selected multi-select states.

### Borders
- **Border Card (`rgba(255, 255, 255, 0.12)` / nominal `#ffffff` low-alpha 1px):** Distinctive crisp bounding stroke separating cards and containers from the dark canvas.
- **Border Muted (`#30363d`):** Dividers, internal horizontal table rules, and sub-panel separators.
- **Border Control (`#3d444d`):** Unfocused input fields, button borders, and segmented control peripheries.

### Typography & Content
- **Foreground Strong (`#ffffff`):** Emphasized headings, metrics, and primary identifiers.
- **Foreground (`#e6edf3`):** Default body copy, labels, and primary metadata.
- **Foreground Muted (`#9198a1`):** Micro-labels, timestamps, breadcrumbs, and auxiliary notes.
- **Accent (`#58a6ff`):** Interactive links, project titles, focused borders, and active indicators.

### Status Tones (Construction Milestones)
- **Planejado (Planned):** Background `rgba(31, 111, 235, 0.12)` (`#1f6feb15`), Foreground `#58a6ff`.
- **Em Andamento (In Progress):** Background `rgba(210, 153, 34, 0.15)` (`#d2992220`), Foreground `#e3b341`.
- **Concluído (Completed):** Background `rgba(35, 134, 54, 0.18)` (`#23863625`), Foreground `#3fb950`.
- **Inativo / Pausado (Inactive):** Background `#30363d`, Foreground `#8b949e`.

## Typography

The type system is calibrated for rapid scannability, compact horizontal density, and clear numeric parsing. Primary headings utilize semibold weight (600) with tightened tracking for an authoritative, engineered feel. 

Special application rules:
- **Enterprise / Project Titles (`title-project`):** Set at 15px–16px, weight 600. Default color is `#58a6ff` (or `#ffffff` with a smooth `:hover` transition to `#58a6ff`). Titles must retain a monospace or strict tabular underline on keyboard navigation.
- **Numeric & Code References:** For construction unit codes, WBS (Work Breakdown Structure) IDs, and budget calculations, enforce `JetBrains Mono` to prevent column wobble and misaligned totals.
- **Tight Headings:** All modal, card, and section headers strictly use 600 weight. Avoid weights over 600 to prevent visual congestion in low-light environments.

## Layout & Spacing

The layout model adopts a GitHub-style high-density fluid grid structured within a maximum container width of `1280px` for standard operational consoles, expandable to `100%` on analytical tabular views.

### Structure & Grids
- **Desktop (1024px+):** 12-column layout with fixed 16px (`1rem`) gutters and 24px (`1.5rem`) outer canvas margins. Multi-pane arrangements frequently use an asymmetrical 280px fixed sub-navigation alongside a fluid content workspace.
- **Tablet (768px - 1023px):** Fluid layout condensing sidebars into top-level tab strips. Gutters maintain 16px.
- **Mobile (< 768px):** Single-column stacked workflow with 12px (`0.75rem`) gutters and 16px (`1rem`) screen margins. Dense list rows convert into card-like compact containers with full-width tap targets.

### Spacing Principles
- Vertical rhythm strictly follows a 4px sub-grid (`0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`).
- Internal padding for list items and inputs is optimized for tight vertical profiles (`8px` to `10px` vertical, `12px` to `16px` horizontal) to maximize displayed items per viewport.

## Elevation & Depth

Visual hierarchy does not rely on soft drop shadows or diffusion blurs. Instead, depth is produced through a disciplined matrix of **tonal stepping** and **micro-line boundaries**:

1. **Base Layer (Elevation 0):** `#010409` canvas background.
2. **Elevated Surfaces (Elevation 1):** `#0d1117` for modules, cards, and data lists. Contoured with a crisp 1px stroke of `rgba(255, 255, 255, 0.1)` (Card Border).
3. **Overlays & Dialogs (Elevation 2):** Modals, dropdown popovers, and flyout draw sheets sit on `#161b22`, defined by a 1px border of `#30363d` paired with a directional ambient cutoff: `0 8px 24px rgba(1, 4, 9, 0.75)`.
4. **Interactive Focus Planes:** Any focused component projects an explicit outline: `2px solid #58a6ff` with an `outline-offset: 2px`. Shadow rings are strictly prohibited in favor of precise bounding boxes.

## Shapes

The geometric framework follows a compact, soft curvature (`0.25rem` / 4px to 6px) honoring Git repository panels and operational utility consoles:

- **Inputs, Buttons, and Badges:** `4px` (`rounded-sm` / level 1) to `6px`. This creates clean structural alignment along continuous vertical edges.
- **Cards, Modals, and Outer Containers:** `6px` to `8px` (`0.5rem`).
- **Status Dots & Avatars:** Fully circular (`rounded-full` / 9999px) to establish instant optical distinction against rectangular layout blocks.

## Components

### Buttons
- **Primary:** Background `#1f6feb`, text `#ffffff`, border `1px solid rgba(255, 255, 255, 0.1)`. Hover state switches to `#388bfd`.
- **Secondary / Default:** Background `#21262d`, text `#e6edf3`, border `1px solid #3d444d`. Hover state updates to `#30363d` with border `#8b949e`.
- **Danger / Destructive:** Background `transparent`, text `#f85149`, border `1px solid rgba(248, 81, 73, 0.4)`. Hover: background `rgba(248, 81, 73, 0.1)`.
- **Dimensions:** Height 32px (compact) or 28px (dense table actions); padding 0 12px; font weight 500; font size 13px.

### List Rows (Repository-Style Lists)
- **Container:** Border `1px solid #30363d`, surface `#0d1117`, divided by 1px horizontal borders (`#21262d`).
- **Row Interaction:** Height 44px to 52px. Default background is transparent; hover background `#21262d` with transition duration `120ms`. Selected background is `#12243a`.
- **Left Column:** Project or item name rendered in `15px`, weight 600, color `#58a6ff` (or `#ffffff` transitioning to `#58a6ff` on hover).
- **Metadata Alignment:** Auxiliary info (WBS codes, stage deadlines, engineer in charge) is grouped horizontally in `12px` font with `#9198a1`.

### Status Badges (Compact)
- Built with a height of 20px, inline padding of 6px–8px, border-radius of 4px.
- Accompanied by a 6px circular dot (`rounded-full`) anchored 4px ahead of the label.
- **Planejado:** Background `rgba(31, 111, 235, 0.15)`, text `#58a6ff`, dot `#58a6ff`.
- **Em Andamento:** Background `rgba(210, 153, 34, 0.15)`, text `#e3b341`, dot `#e3b341`.
- **Concluído:** Background `rgba(35, 134, 54, 0.18)`, text `#3fb950`, dot `#3fb950`.
- **Inativo:** Background `#30363d`, text `#8b949e`, dot `#8b949e`.

### Input Fields & Controls
- **Base Style:** Background `#0d1117`, border `1px solid #3d444d`, color `#e6edf3`, placeholder `#9198a1`. Height: 32px. Padding: 4px 10px.
- **Focus State:** Border `#58a6ff`, outline `2px solid #58a6ff`, `outline-offset: 2px`.
- **Checkboxes & Radios:** Size 14x14px. Unchecked: border `1px solid #3d444d`, background `#0d1117`. Checked: background `#1f6feb`, border `#1f6feb` containing a sharp white glyph.

### Cards & Metrics
- Background `#0d1117`, outer border `1px solid rgba(255, 255, 255, 0.12)`, padding 16px.
- Card Header: Features an upper muted label in uppercase 11px font (`#9198a1`, letter spacing 0.05em), followed by the primary metric value in 24px weight 600 (`#ffffff`).