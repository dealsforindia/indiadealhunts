# IndiaDealHunts search: reference research

Research date: 2026-10-30. Research only; no application changes.

## Starting point and scope

The supplied screenshot shows a dense command-search popup: search input, store chips, six small-thumbnail product rows, right-aligned prices and View actions, trending chips, and an All12Engines footer. The design question is how to give these existing elements a distinct, readable shopping identity. Preserve the current data, result ordering, filtering, links, empty/loading states, and search behavior. The concepts below do not require a new search provider or new features.

## What the references actually establish

- **Raycast:** one focused input above a results list, live search, Up/Down selection, Enter for the primary action, and contextual placeholder copy. Its documented Compact Mode expands from an input when typing. Useful lesson: make one active result and one primary action unmistakable. Do not copy its extra commands, favorites, or action panel. [Official Search Bar manual](https://manual.raycast.com/search-bar).
- **Linear:** a quick-search menu, title-match highlighting, and filters used to narrow results. Its recent searches/issues are documented product features, not a reason to add history here. Useful lesson: a calm text hierarchy and clear distinction between query, scope, and results. [Official Search documentation](https://linear.app/docs/search).
- **Algolia:** its own documentation search uses a modal for space and a full-screen mobile experience; its preview panel exposes information about the selected result without navigating away. Useful lesson: separate fast scanning from larger visual inspection when the screen permits it. This is a pattern reference, not a recommendation to install Algolia. [First-party implementation article](https://www.algolia.com/blog/ux/replicating-the-algolia-documentation-search-with-autocomplete).

These sources document interaction patterns. They do **not** substantiate the exact colors, dimensions, animation timings, or IndiaDealHunts layout proposed below. Motion playback was not verified; this research used official written documentation rather than a recorded interaction audit.

## Three concrete directions

### 1. Hunt Console — speed first

Desktop: a centered, generous-width command panel with a strong search field, one quiet line of store filters, and six consistent result rows. Enlarge thumbnails enough to identify products; use a two-line title maximum, subdued store metadata, and a stable price column. Give the active row a subtle brand-tinted surface with a narrow leading accent. Retain View as the existing action and keep trending and engine information below a divider.

Mobile: full-screen search, fixed top input/close controls, horizontally scrollable store chips, and a single independently scrolling result area. Put price below the product title when needed, preserving readable text and comfortable tap targets.

Reference connection: Raycast's input/list hierarchy and active selection. Distinct identity: warm IndiaDealHunts accent, product imagery, and prominent rupee prices rather than launcher-style monochrome commands.

Tradeoff: lowest structural change, but less visually different from today's popup.

### 2. Deal Editorial — recommended

Desktop: a wider, quietly framed search surface. A shallow header contains the input and existing store chips. Results become airy product rows with larger square images, product title and store in the middle, and bold price plus View at the end. Separate trending chips into a clearly labeled, visually quieter band; keep the engine footer as small supporting information. Avoid a nested card around every row: one surface, dividers, and strong typography provide the structure.

Mobile: a full-screen, image-led list using the same information. Each row keeps image on the left, title/store on the right, then price and View on a shared lower line. Keep the query visible while results scroll; store chips retain horizontal scrolling. Existing trending content stays reachable without competing with matches.

Reference connection: Linear's calm grouping plus Algolia's use of modal space. Distinct identity: a shopping publication feel driven by product images, restrained typography, and price rhythm.

Tradeoff: fewer matches fit in a viewport, but all current results remain available through scrolling. Best balance of recognizability, scan speed, and a visible improvement over six tiny rows.

### 3. Product Spotlight — most visual

Desktop: a two-column modal: existing result list on the left and a larger rendering of the selected result on the right. The preview repeats only existing image, title, store, price, and View link; it introduces no new metadata. Keep store filters directly under the input and trending/footer content secondary. Keyboard or pointer selection changes the preview without changing ranking or automatically navigating.

Mobile: collapse to the single image-led result list from direction 2. Do not introduce a second preview screen or force an extra tap before the existing View action.

Reference connection: Algolia's documented selected-result preview panel. Distinct identity: a product inspection surface with a large image rather than a text-only command palette.

Tradeoff: selection/preview coordination adds implementation complexity and can distract from comparing prices. Choose only if existing images are sufficiently reliable and the modal has desktop width to spare.

## Motion proposals, explicitly not reference claims

For any direction: a short opacity and slight vertical entrance for the search surface; a restrained background-color transition for the active row; immediate query editing. Do not stagger result rows on every keystroke, animate layout while typing, or turn loading into decorative motion. Respect reduced-motion settings by removing movement. Exact timings should be chosen during implementation and visual review, not presented as measured behavior from these products.

## Recommendation

Proceed with **Deal Editorial**, retaining Hunt Console's disciplined active-row and keyboard treatment wherever those interactions already exist. It addresses the screenshot's main weakness—small images and competing dense elements—without changing the search contract. Review a desktop and narrow-mobile mockup before implementation; do not add history, AI search, new filters, recommendations, or new backend dependencies.
