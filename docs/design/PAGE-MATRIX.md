# Coverage matrix

Every row requires light/dark at desktop 1440×900 and phone 393×852; additionally 360px narrow and 1024px intermediate overflow checks. These are proposed CSS test viewports, not claimed Motorola dimensions. User's real-device target: Motorola Edge 40 Neo, Chrome.

| Surface | Code entry | States to inspect | Status |
|---|---|---|---|
| Discovery/search | App, HeroBanner, DealToolbar, PublicDealCard | Default/query/filter/load/empty/error/list/detail | Pending rendered audit |
| Discounts | TopDiscountsPage | Tier/store/search/reset/empty/grid/list | Reworked; unverified |
| Worth | WorthScorePage | Available/missing evidence/selection | Pending |
| Saved | SavedLootPage | Empty/populated/remove/compare | Pending |
| Profile | ProfilePage | Signed out/in, appearance, form feedback | Pending |
| About/verification/contact | AboutPage, HowWeVerify, ContactPage | Long content/links/forms | Pending |
| Submit deal | SubmitDeal | Input/validation/submission result | Pending; avoid live submission in tests |
| Product/evidence | DealDetailsPage, price-history components | Available/stale/missing/loading/error | Pending |
| Comparison | CompareDrawer, ProductSpecCompareModal | 0/1/multiple/remove/missing specs | Pending |
| Tools | ToolsHubModal and tools/* | Picker/calculation/validation | Inventory exists; per-tool audit pending |
| Shared navigation/footer | Navbar, ThemeToggle, Footer, category rail | Open/closed/focus/sticky/scroll/theme | Reported defects; partial fixes |
| Mascot | DealOrb, companionScene, pixel-companion.css | Full cycle/tap/inactivity/failure/offscreen | Below user acceptance |

Find exact component owners with targeted rg before editing. Secondary modal inventory is not exhausted by this matrix; add surfaces discovered during each journey audit.
