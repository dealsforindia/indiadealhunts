# IndiaDealHunts working instructions

Scope: this app only. Latest explicit user direction wins.

## Load little, retain decisions
- `PRODUCT.md` records the owner-confirmed product brief for Impeccable. Its workflow default lives only in `.impeccable/config.json`; keep visual decisions in `docs/design/`.
- Before implementation read `docs/design/GUARDRAILS.md`; select requirement IDs from `docs/design/REQUIREMENTS.md` and the next packet from `docs/design/WORK-QUEUE.md`.
- Read DESIGN-SYSTEM.md for materials, INTERACTIONS.md for motion, PAGE-MATRIX.md for coverage, VERIFICATION.md for evidence only when relevant (all under docs/design).
- Read `docs/design/BRIEF.md` for UI work; read `docs/design/STATE.md` for current status. Read `docs/design/REFERENCES.md` only for research or visual decisions.
- Use the project workflow skill `indiadealhunts-ui` at `skills/indiadealhunts-ui/SKILL.md` for UI, theme, chart, or mascot work.
- Use Cloudflare's `security-audit` skill at `.agents/skills/security-audit/SKILL.md` for security audits, vulnerability hunting, and endpoint verification.
- Search targeted files with rg; avoid dumping whole source files, generated assets, lockfiles, or the conversation. Update state with concise verified facts after meaningful work.
- Existing `DESIGN.md` describes a Mobbin reference, not the approved current direction. Older QA and roadmap files are historical evidence, not proof the current build passes.

## Preserve the product
- Keep the working shopping skeleton and real data: search, filters, saves, comparison, price evidence, tools, profile, and mobile navigation.
- Preserve unrelated uncommitted work. No deployment, bulk rollback, or dependency additions implied by a styling request.
- Do not invent deals, reviews, history, savings, live-feed claims, or notifications to fill the design.

## Known implementation boundaries
- React 19 + TypeScript + Vite + Tailwind 4. Installed: Motion, Recharts, Three, Lucide. Reuse these where suitable; no need to add libraries for polish.
- CSS import order is in `src/main.tsx`; several historical layers compete. Find the winning selector/token before changing it; avoid another global override sheet.
- Themes: `src/utils/themeManager.ts`; mascot: `src/components/DealOrb.tsx`, `src/utils/companionScene.ts`, `src/pixel-companion.css`.

## Verification and reporting
- `npm run check` for TS changes; `npm run build` for integration; relevant tests from package.json. Documentation-only changes need link/content checks, not a production build.
- UI changes require actual light/dark, mobile/desktop, and relevant open/empty/loading states. If browser access is unavailable, state visual verification is pending; never treat a build or source inspection as rendered evidence.
- Distinguish implemented, tested, visually verified, proposed, and unfinished. Do not claim the whole site finished after a local fix.

User correction: refine the existing UI and flows. Do not introduce new sections, dashboards, workspaces or features as part of visual refinement. The added DiscoveryWorkspace was explicitly rejected and removed.
