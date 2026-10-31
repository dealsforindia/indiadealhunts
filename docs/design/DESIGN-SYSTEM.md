# Design system contract

Intent comes from BRIEF.md; implementation tokens live in src/emerald.css and theme state in src/utils/themeManager.ts. This document is a contract, not evidence of implementation.

## Materials
- Content: opaque neutral/charcoal reading surfaces; product imagery retains its own colours.
- Context: frosted, readable panels with restrained grain, upper edge lighting and lower inner shadow.
- Navigation: thin smoked glass, curved specular rim, selected lens and visible focus. Background alpha affects surface only.
- Distinct light/dark token values; avoid tinting every plane green. Emerald highlights action/data; yellow may distinguish a meaningful secondary series. Error/warning colours remain semantic.
- A continuous background texture can connect panels. Do not add independent glows to every card or make dense text transparent.

## Type and composition
Use installed Plus Jakarta Sans stack. Large relatively light values/headings; quieter explanatory labels. Unequal panel sizes establish priority. Dense data areas and breathing room coexist. Exact type/spacing scale must be measured and consolidated before broad application; no fabricated approved values.

## Ownership and debt
main.tsx loads index/mobile/premium/premium-dark/commerce/mobile-reference/emerald/pixel-companion CSS. Multiple layers compete. Inspect computed winners before changing; consolidate a component's affected declarations rather than adding another sheet. Current glass is CSS approximation, not optical lensing.

## Delivery
Product cards remain data-backed. Shared fields/buttons/selects/sheets must cover focus, pressed, selected, disabled, loading, failure and empty content where relevant. Define optical effects in an isolated layer; preserve DOM text and controls. No mandatory new shader library.


## Foundation values — implemented 2026-10-30, rendered review pending
| Role | Light | Dark |
|---|---|---|
| Canvas | #f3f2ee | #0b100e |
| Content | #fffefa | #161d19 |
| Secondary | #e9e9e3 | #202923 |
| Ink | #202824 | #edf0e8 |
| Muted text | #59655d | #afbbb0 |
| Accent | #246348 | #b9e58b |

Historical aliases now share a single bridge. Hero background is theme-owned rather than a separate hardcoded green gradient. Product-price weight reduced to550; no claim of a finished typography audit. Ten solid text-background pairs pass4.5:1; translucent compositing still needs rendered review. Evidence: tests/artifacts/material-token-contrast.json.
