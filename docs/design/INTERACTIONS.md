# Interaction contract

Use Motion for UI transitions, Recharts for evidence graphs, Three for isolated ball/optical scenes, Web Audio for opt-in sounds. These are existing tools, not proof of quality. Timings below remain proposals except the user's 10-second catch sequence.

| Trigger | Required behaviour | Important states |
|---|---|---|
| Navigation change | Selected control moves with spatial continuity; content transition preserves orientation | Keyboard, rapid changes, reduced motion |
| Open menu/theme | Panel originates at trigger; focus stays visible; Escape/outside close; no exiting invisible panel intercepting input | Phone edge, footer opens upward, scroll height |
| Search/filter | Retain query/selection; result update communicates what changed without a full-page flash | Pending, zero, error, clear/reset |
| Save | Immediate understandable confirmation; retain item identity | Saved/unsaved, persistence failure |
| Compare | Tray and details keep selected products recognizable | Add/remove, full, empty, phone sheet |
| Chart range/inspection | Preserve axis meaning and show actual dated price; hover and touch inspection | Sparse/no history, loading, target line |
| Theme | All visible surfaces/text update coherently without stale blue panels | System choice, reload, open sheets |
| Mascot idle/catch | Exact R13 phases; fixed feet; head/hand follow ball; contact anchors per frame | Paused offscreen, decoded assets, failure fallback |
| Mascot tap | Wind-up before release; ball originates at hand; reveal actual deal once | Early tap queue, repeated tap, reduced motion |
| Mascot inactivity | Proper sad holding pose; ball never sits at pelvis | Hover reaction must not interrupt catch/throw |
| Sound enabled | Quiet optional flutter/catch/whoosh/reveal coordinated to action | Off by default unless persisted opt-in; muted tab |

Before implementation specify duration/easing, interruption policy and fallback for the affected row. Do not select arbitrary global timing for all actions. No audio assets or final sound design currently approved. Proper sad holding and transition artwork remain required.
