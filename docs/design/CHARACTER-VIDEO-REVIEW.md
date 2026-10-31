# Character recording review — 2026-10-30

Source: owner-provided `C:/Users/Neel/OneDrive/Videos/Captures/ChatGPT 2026-10-30 23-25-39.mp4` (51.743s, 1920×1052, 60fps). Reviewed full-recording overview frames at2s intervals and character close-ups at0.25s intervals for1–12s,23–31s and42–51.7s. This is temporal frame inspection, not an FPS or audio-quality measurement. Temporary review frames are under `.build-check/character-video-review/`.

## Observed defects

| Recording time | Evidence | Required correction |
|---|---|---|
| 2–6s | Forehead/looking poses are held for long intervals, then the arm switches abruptly to the next pose. Ball moves continuously while body movement is stepped. | Author registered transition drawings; keep intentional holds but connect head, shoulder, elbow and wrist movement. More easing on the ball cannot fix missing character drawings. |
| 6.25–10.75s;23–24s | Reach/contact/retraction switches between isolated key poses. Ball and wrist change location abruptly at the hand-off, especially extended hand to near shoulder. | One shared timeline for hand pose, contact point and ball. Ball follows visible hand after contact, with transition anchors between drawings. |
| 4.5–10s | Ball appears as a shiny sphere with faint, leaf-like wing shapes. It does not read as a compact mechanical winged object. | Owner-approved ball/wing image first; visible connected roots, consistent wing silhouette and fold, then implement. No asset approval inferred from this recording. |
| 24.25–27.75s | During thinking reaction the green ball disappears while text still says `Caught one. Tap to throw!`; it returns on the holding pose around28s. | Holding reactions must preserve the prop and its contact. Do not hide it to accommodate handless reaction artwork. Use ball-compatible reactions or defer those reactions until a safe phase. |
| 24.25s versus28s;44.75–48s | Switching between the catch atlas and individual reaction frames changes apparent character scale, silhouette and position. Returning to the holding drawing looks smaller. Reaction drawings also change geometry between frames. | Match visible body height, foot baseline, head scale and character proportions across assets; same canvas dimensions alone are insufficient. Redesign catcher with approval before replacement. |
| 30.25–30.75s;42.25–43s | Throw starts from an isolated wind-up pose, then a detached sphere travels toward screen-left and disappears. Reads as sideways translation rather than an object coming toward the viewer. | Define release frame/contact anchor, connect wind-up/release/follow-through, and animate depth/perspective after release. Preserve ball material identity between stage and thrown object. |
| 43.75–44.5s | Offer card overlays the character's torso; only head/feet remain exposed. Reveal interrupts the character's composition. | Reposition/reflow the existing offer reveal so product information and character do not occlude one another at the shipped viewport. No new feature needed. |
| 48–51.7s | Character remains in forward extended-arm pose although prompt says idle/hover. | Reset to explicit idle drawing when throw completes and after reaction exit; eliminate competing imperative sprite updates. |

## Code-linked causes (source-confirmed, not inferred animation performance)

- `src/utils/companionScene.ts`: catchPose selects around one drawing per second for much of10s; held-ball anchors jump from pose8 `[91,32]` to pose9 `[40,38]` without intermediate registered drawings.
- `src/components/DealOrb.tsx` and `src/pixel-companion.css`: hover reactions use a separate `<img object-fit=contain>` while catch uses a360×460 atlas cell; no shared visible-body registration metadata is applied. data-reacting hides the ball entirely.
- `DealOrb.tsx`: throw origin is hardcoded at30%/30% of actor bounds; thrown object is a separate CSS sphere. Release is not driven by a measured hand anchor for the release drawing.
- `finishThrow()` imperatively resets sprite position, but the throwing RAF can still write pose14; the complete-phase effect returns without asserting an idle pose. This is a likely race behind the observed stuck arm; must reproduce and verify after correction.
- The reaction clock is240ms per image. Fifteen separately generated images do not guarantee continuous animation: registration and between-frame anatomy are still essential.

## Fix order and acceptance

1. Produce one approved catcher image matching existing identity/body height and an approved connected-wing ball design. Keep them out of live assets until approval.
2. Establish fixed body registration and measured hand anchors for each used pose/frame. Check idle→catch→hold→reaction→throw→idle at the same scale.
3. Repair state ownership: one active sequence; no stale RAF overwrites; no prop disappearance during holding; safe reaction scheduling.
4. Build coherent approach/contact/retraction/release transitions. Test interruption by hover, tap, repeated tap, visibility changes and reduced motion.
5. Refine the existing reveal geometry and verify both themes, desktop and phone. Performance must be measured separately on the owner's Motorola Edge40Neo/Chrome.

No runtime code or character/ball assets changed during this review. The recording establishes the defects above, not that every planned expression, sadness state, mobile interaction or sound was exercised.
