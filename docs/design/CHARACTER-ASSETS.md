# Approved character assets — 2026-10-31

Both image drafts below were approved by the owner as the basis of animation assets in chat2026-10-31.

- Holding draft: `C:/Users/Neel/.codex/generated_images/01a18385-6971-7551-832c-313b199a2216/exec-15e3cb08-01e8-4a4e-b5aa-3ea592ac484b.png`. Runtime export: `public/brand/approved-catcher.webp` (512×768, transparent, deterministic downscale/WebP export; original retained).
- Ball draft: `C:/Users/Neel/.codex/generated_images/01a18385-6971-7551-832c-313b199a2216/exec-cb71ca0a-b0c2-4e03-a61a-6bae0a9d9670.png`. Implementation basis: emerald sphere, champagne metal equator/hinges, attached feather wings in `emeraldBallScene.ts`. This is procedural geometry based on the approved draft, not an imported/rigged Meshy model.

Generation mode: built-in image generation. Holding prompt: one independent full-body pixel character preserving the supplied wave image's identity/adult proportions, hands cupped just below the chest holding a small emerald ball, same full height, transparent background; no sheet or multiple poses. Ball prompt: one premium emerald glass sphere with champagne metal equator and wings physically attached at hinge sockets, single product concept on neutral studio ground; no person. These record the recovered prompt specifications, not invented exact transcripts.

`scripts/register-companion.py` measures opaque head/foot landmarks and exports `src/utils/companion-registration.json`. It does not crop or modify source drawings. Every catch pose, approved holding image and90 individual reaction frames aligns to82% visible body height and95.5% foot baseline. Registration cannot correct between-frame anatomy/lighting drift or replace missing transition artwork.
