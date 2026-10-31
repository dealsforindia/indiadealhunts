# IndiaDealHunts

<!-- impeccable:product-schema 1 -->

Confirmed with the owner on 2026-10-30. This file records product truth; visual decisions and unfinished implementation remain in `docs/design/`.

## Platform

web

## Users

Shoppers in India looking for worthwhile offers across merchants. Their job is to discover products, inspect available price evidence, compare and save candidates, and then buy from the merchant.

## Product Purpose

Help shoppers find offers and make informed purchase decisions. Success means users can move from discovery to evidence and comparison to a merchant destination without losing their context or being misled by unsupported discount claims.

## Operating Context

- Responsive website: desktop and mobile, with both light and dark appearance.
- Priority real-device check: Motorola Edge 40 Neo using Chrome, as specified by the owner. Responsive emulation does not establish real-device animation performance.
- The owner identifies the site as indiadealhunts.me. The current local review URL is http://127.0.0.1:5193/; it is a development preview, not a production destination.
- Existing application: React 19, TypeScript, Vite and Tailwind CSS. Motion, Recharts, Three and Lucide are already installed.

## Capabilities and Constraints

- Preserve the existing shopping skeleton: discovery/search, category and store filters, discounts, saved products, comparison, price evidence, profile, shopping tools and merchant links.
- Preserve existing informational, contact and deal-submission flows.
- Current work refines existing UI and interactions. Do not introduce new features, dashboards, sections or workspaces as a side effect.
- Price history and other evidence depend on actual available observations. Never promise a fixed 90-day history without supporting data.
- Preserve real data, affiliate destinations, unrelated uncommitted changes and working behavior. Publication, deployment and broad rollback are separate actions.
- Wall of Happiness has been explicitly removed and must stay removed unless requested again.

## Brand Commitments

- Name: IndiaDealHunts.
- The owner wants a distinctive, expressive and fluid experience, with readable information and deliberate detail. Generic minimalism, screenshot cloning and uniform recoloring have been rejected.
- Preserve the owner's approved likeness-based pixel character identity rather than substituting a generic cute robot. Its expressions, position and held props must remain coherent.
- The latest catcher and winged-ball asset redesigns require the owner's image approval before replacing site assets.
- Accepted visual references and their intended use are recorded in `docs/design/BRIEF.md` and `docs/design/REFERENCES.md`; they are inspiration, not evidence of implementation quality.

## Evidence on Hand

- The existing application and its real offer feed, with explicit missing/loading/error states.
- Owner-provided screenshots, photographs, feedback and approved character references in the conversation.
- Character assets and manifests under `public/brand/expressions/`, plus existing catch assets under `public/brand/`.
- Requirements and guardrails: `docs/design/REQUIREMENTS.md` and `docs/design/GUARDRAILS.md`.
- Coverage and verification records: `docs/design/PAGE-MATRIX.md`, `docs/design/VERIFICATION.md` and `docs/design/STATE.md`.
- These records include unfinished work. A passing build is not rendered or motion evidence. Historical README performance claims have not been independently established by initialization.
- Do not fabricate reviews, prices, savings, historical series, live activity, notifications or testimonials.

## Product Principles

1. Preserve useful shopping flows and real evidence while refining their presentation.
2. Keep discovery, evaluation and merchant actions connected and understandable.
3. Treat mobile and desktop, light and dark, and loading/empty/error states as parts of the same product.
4. Make personality and animation support the task; preserve predictable controls and touch alternatives.
5. Report implementation, test results, rendered verification and open defects separately.

## Accessibility & Inclusion

Preserve keyboard operation, visible focus, readable contrast, usable touch controls and reduced-motion behavior. Hover must not be the only way to use an action. Optional sound must be user-controlled. No formal accessibility certification has been established.

## Open Product Decisions

No unique competitive-positioning claim or quantified performance promise was confirmed. Do not invent one. Broader visual and motion acceptance remains unfinished and is tracked in `docs/design/STATE.md`.
