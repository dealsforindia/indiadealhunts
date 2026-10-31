# Requirements ledger

Source: available conversation through 2026-10-30. Latest code-first direction supersedes earlier Figma import and restore discussions. Status here is deliberately conservative: partial means code exists without complete rendered acceptance.

| ID | Requirement / acceptance | Current status |
|---|---|---|
| R01 | Preserve existing shopping skeleton and actual data; core flows remain functional | Preserve; regression checks exist |
| R02 | Expressive crafted UI, not generic minimalism or cloned layouts; varied composition and clear hierarchy | Unfinished |
| R03 | Coherent dark and light palettes across every page/state; no accidental navy/pink remnants | Partial; full audit pending |
| R04 | Smoked controls, frosted contextual panels, opaque reading surfaces; varied transparency and directional edge light | CSS approximation; unverified |
| R05 | Texture: fine grain, ribbed/metal background, selective colour illumination without text obstruction | Partial; unverified |
| R06 | Glass interaction: press/focus/hover/open continuity; optical refraction distinguished from blur | Motion/CSS partial; refraction absent |
| R07 | Charts: true observations, fine lines, subdued grid/fill, readable dates/values, range controls and touch inspection; honest missing history | Existing functionality; polish unverified |
| R08 | Search/filter/results transitions maintain context; reset/loading/empty/error states work | Partial |
| R09 | Product detail/store comparison/price evidence/save/alert form one coherent journey | Existing pieces; integration polish unfinished |
| R10 | Saved deals, profile, tools, discount and informational pages share the system | Unfinished |
| R11 | Deliberate phone UI in both themes, usable touch targets/sheets/navigation; no clipping or overlap | Partial; reported defects open |
| R12 | Pixel mascot identity and fixed frame registration, multiple expressions and head directions | Assets exist; motion unfinished |
| R13 | 0–1s look right/forehead; 2–4s track upward; 5–8s reach/catch; 9–10s bring ball into hands; tap throws toward screen and reveals real deal | Partial timeline; visual continuity unverified |
| R14 | Sad expression only after inactivity, still visibly holding ball; random hover reactions compatible with main story | Sad holding artwork missing; hover scheduling unresolved |
| R15 | Small lively emerald winged ball; reference Vimeo511205372 liked but needs refinement; stays in hands, folds wings, convincing flight/throw | Below user acceptance |
| R16 | Optional coherent sound for key interactions, never forced/autoplaying | Limited success chime; unfinished |
| R17 | Optimized assets/animation: preload needed frames, offscreen pause, reduced motion, no jumping or unnecessary loading | Partial; real-device performance unmeasured |
| R18 | Remove Wall of Happiness from product navigation/routing | Implemented; unused source remains |
| R19 | Fix category clipping/sticky overlap/footer appearance popover and cross-theme detail defects | Partial; rendered acceptance pending |
| R20 | Research techniques and verify actual interaction, no screenshot-based motion claims | Protocol established; playback evidence limited |
| R21 | Compact persistent context, guardrails, small task packets and truthful evidence | Documentation implemented; maintain each slice |

## Superseded / rejected
- Figma as primary implementation target: user switched to code.
- Cute generic robot/orb as final mascot: user selected likeness-based pixel character.
- Minimalist downgrade, unrelated shopping examples, Jordan Hughes Workflows & Integrations: rejected.
- Generated catalogue mockup with invented claims and delivery selector: not approved.

Do not mark an item verified from source or unit tests alone when its acceptance is visual/interactive.
