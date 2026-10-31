# Design contract

Updated 2026-10-30. Derived from explicit user feedback; proposed details must remain labelled.

## Intent
IndiaDealHunts should feel expressive, crafted, fluid, and useful. The functional skeleton is accepted. The user rejects generic minimal redesigns, screenshot imitation, flat recolouring, clutter, and hero-only polish. Both themes and every page need equal attention.

## Accepted inspiration
Cryon: layered translucent surfaces, fine charts, readable numeric hierarchy. Kinetiq: depth, connected information panels, selective colour. Velox/Travique/Aurevia/Voltera: connected desktop/mobile systems. Travel Planner: expressive imagery and mobile composition. Adapt principles to shopping tasks; do not duplicate layouts or branding.

## Visual rules
- Build a coherent palette per theme. Accidental navy/blue panels inside emerald UI are a known defect, not intentional variety. Semantic warning/error/store colours can differ for a reason.
- Transparency is a surface treatment: use background alpha, not parent opacity that fades text. Contrast must survive real content and backgrounds.
- Dark: layered near-black/charcoal and emerald accents. Light: distinct readable neutral surfaces and deeper emerald accents. Exact tokens remain to be audited; no finalized palette is implied.
- Charts explain actual observed prices: legible values, hover/touch inspection, range controls, clear missing-data states. Decorative fake graphs are unacceptable.
- Richness comes from composition, texture, meaningful transitions, product imagery, and responsive states; not uniform pills, glows, or an indiscriminate blur on every card.

## Motion and character
- Motion must connect actions: filter/result changes, save feedback, details, compare tray, chart inspection. Honour reduced motion and touch interaction; optional sound is user-controlled.
- Mascot resembles the user's approved pixel character: dark wavy hair, sunglasses, dark jacket, blue checked shirt/jeans. Maintain a fixed canvas and foot baseline across poses.
- Story: look right/hand to forehead; track a winged emerald ball; reach/catch; bring it to hands; wait; tap to throw toward screen and reveal a real deal. Sadness only after inactivity.
- Ball must stay at the visible hand, including waiting/sadness. Separate handless sad artwork cannot hold a ball at the pelvis. More registered transition drawings are needed for natural movement; easing alone does not fix pose jumps.
- User likes https://vimeo.com/511205372 as a ball direction, with refinement still needed. No specific final wing/material implementation has been approved.

## Explicit removal
Wall of Happiness is removed from navigation/routing. Keep it removed unless requested otherwise.
