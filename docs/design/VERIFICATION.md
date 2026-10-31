# Verification protocol

## Evidence levels
- Implemented: inspectable code change.
- Checked: named command with actual result.
- Visually verified: screenshot inspected at a named viewport/theme/state.
- Motion verified: actual playback/interaction inspected; screenshots alone do not prove timing or continuity.
- Accepted: user acceptance when provided. Do not silently infer it from absence of criticism.

## Baseline
Previous build and selected tests passed; new broad UI acceptance has not occurred. Local port5193 had no listener on 2026-10-30 preflight. Restart preview before visual work. Existing CSS/markup is not a verified baseline screenshot.

## Each slice
1. Record requirement IDs, components, current defects and intended result.
2. Run appropriate check/build and relevant tests (package.json). Avoid broad repeats without a new reason.
3. Inspect phone/desktop, both themes, affected open/empty/loading/error states; keyboard/touch and reduced motion.
4. For animation inspect interruption, repeated taps, offscreen pause and loading failure. Profile rendering before claims about FPS or device performance.
5. Save captures under tests/artifacts with slice-theme-viewport-state names. Record actual paths/results; never fabricate captures.
6. Preserve unrelated edits and real affiliate behaviour; don't submit external forms/purchases during UI verification.
7. Record defects and remaining checks. If browser access is blocked, progress on independent work but keep visual status pending.

Real device: Motorola Edge 40 Neo + Chrome. Responsive emulation is useful but does not prove phone GPU performance. Ask user for a brief real-device check after a concrete preview is ready.
