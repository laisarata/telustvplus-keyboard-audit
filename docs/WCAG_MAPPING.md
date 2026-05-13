# WCAG 2.1 AA — Test Coverage Mapping
**Project:** TELUS TV+ Keyboard Accessibility Audit  
**Maintained by:** Lais Arata (Poatek)  
**Last updated:** May 2026

This document maps all 75 existing test cases to WCAG 2.1 AA success criteria, and shows which criteria have no test coverage yet.

---

## 1. Test Cases → WCAG Criteria

### 1. Global Navigation (8 tests)

| Test | WCAG SC(s) |
|------|-----------|
| Tab — move focus to next interactive element | SC 2.1.1, SC 2.4.3 |
| Shift+Tab — move focus to previous interactive element | SC 2.1.1, SC 2.4.3 |
| Skip Navigation Link — skip to main content | SC 2.4.1 |
| Enter/Space — open navigation dropdown menu | SC 2.1.1, SC 4.1.2 |
| Esc — close open menus/tooltips | SC 2.1.1 |
| F6 — move between major UI panes | SC 2.1.1 |
| Alt+Left — browser back (must not be intercepted) | SC 2.1.1 |
| ? — display keyboard shortcuts help overlay | SC 2.1.4 |

### 2. Authentication (6 tests)

| Test | WCAG SC(s) |
|------|-----------|
| Tab/Shift+Tab — navigate login form fields | SC 2.1.1, SC 2.4.3 |
| Enter/Return — submit login form | SC 2.1.1 |
| Focus on page load — auto-focus email field | SC 2.4.3 |
| Space/Enter — activate login button | SC 2.1.1 |
| Error message — keyboard accessible after failed login | SC 3.3.1, SC 4.1.3 |
| "Forgot password" link — reachable via Tab | SC 2.1.1, SC 2.4.4 |

### 3. Content Browse & Carousels (4 tests)

| Test | WCAG SC(s) |
|------|-----------|
| Tab/Shift+Tab — move focus between carousels | SC 2.1.1, SC 2.4.3 |
| Left/Right Arrow — move between items in carousel | SC 2.1.1 |
| Enter/Return — open content detail page | SC 2.1.1 |
| Home/End — jump to first/last carousel item | SC 2.1.1 |

### 4. Search (4 tests)

| Test | WCAG SC(s) |
|------|-----------|
| Tab — focus search input | SC 2.1.1 |
| Tab — navigate from input into search results | SC 2.1.1 |
| Enter/Return — submit search | SC 2.1.1 |
| Esc — clear search field or navigate away | SC 2.1.1 |

### 5. EPG / TV Guide Grid (15 tests)

| Test | WCAG SC(s) |
|------|-----------|
| Filter — Tab to reach filter button | SC 2.1.1 |
| Filter — Enter/Space to open dropdown | SC 2.1.1, SC 4.1.2 |
| Filter — Arrow keys to navigate options | SC 2.1.1 |
| Filter — Esc to close dropdown | SC 2.1.1 |
| Left Arrow — navigate time slots backward | SC 2.1.1 |
| Right Arrow — navigate time slots forward | SC 2.1.1 |
| Up Arrow — navigate channels up | SC 2.1.1 |
| Down Arrow — navigate channels down | SC 2.1.1 |
| Tab/Shift+Tab — move focus in/out of grid | SC 2.1.1, SC 2.1.2 |
| Page Up/Page Down — scroll grid | SC 2.1.1 |
| Home/End — jump to first/last item in grid row | SC 2.1.1 |
| Enter/Return — select program | SC 2.1.1 |
| Spacebar — toggle favourite / secondary action | SC 2.1.1 |
| N — jump grid to current time | SC 2.1.1 |
| D — jump to next day schedule | SC 2.1.1 |

### 6. Content Detail Page (6 tests)

| Test | WCAG SC(s) |
|------|-----------|
| Tab/Shift+Tab — navigate controls on detail page | SC 2.1.1, SC 2.4.3 |
| Enter/Return — activate focused button | SC 2.1.1 |
| Arrow keys — navigate episode/season tabs | SC 2.1.1, SC 4.1.2 |
| Spacebar — toggle Watchlist button | SC 2.1.1 |
| Esc — dismiss overlay opened via "More" button | SC 2.1.1, SC 2.1.2 |
| Focus on page load — meaningful focus target | SC 2.4.3 |

### 7. Media Player (17 tests)

| Test | WCAG SC(s) |
|------|-----------|
| Spacebar — play/pause | SC 2.1.1 |
| K — play/pause (YouTube-style) | SC 2.1.1 |
| Left/Right Arrow — seek | SC 2.1.1 |
| J — rewind 10s | SC 2.1.1 |
| L — fast-forward 10s | SC 2.1.1 |
| Up/Down Arrow — volume | SC 2.1.1 |
| M — mute/unmute | SC 2.1.1 |
| F — full screen | SC 2.1.1 |
| T — theater mode | SC 2.1.1 |
| C — toggle captions | **SC 1.2.2**, SC 2.1.1 |
| +/- — caption font size | **SC 1.4.4**, SC 2.1.1 |
| V — toggle described video / audio description | **SC 1.2.5**, SC 2.1.1 |
| 0–9 — jump to position | SC 2.1.1 |
| Shift+,/. — playback speed | SC 2.1.1 |
| Shift+N/P — next/previous video | SC 2.1.1 |
| Esc — close overlay / exit full screen | SC 2.1.1 |
| Tab — move focus between player controls | SC 2.1.1 |

### 8. Contextual Menu (5 tests)

| Test | WCAG SC(s) |
|------|-----------|
| Context Menu key / Shift+F10 — open menu | SC 2.1.1 |
| Up/Down Arrow — navigate menu items | SC 2.1.1, SC 4.1.2 |
| Enter/Return — activate menu item | SC 2.1.1 |
| Esc — close contextual menu | SC 2.1.1 |
| Tab (inside menu) — must NOT move between items | SC 2.1.1 |

### 9. Modals & Overlays (3 tests)

| Test | WCAG SC(s) |
|------|-----------|
| Esc — close modal/dialog | **SC 2.1.2**, SC 2.1.1 |
| Tab/Shift+Tab — focus trap inside modal | **SC 2.1.2** |
| Enter/Return — activate buttons within modal | SC 2.1.1 |

### 10. Account & Settings (4 tests)

| Test | WCAG SC(s) |
|------|-----------|
| Tab/Shift+Tab — navigate settings controls | SC 2.1.1, SC 2.4.3 |
| Enter/Return — activate buttons, save changes | SC 2.1.1 |
| Arrow keys — navigate radio buttons / dropdowns | SC 2.1.1 |
| Spacebar — toggle checkboxes | SC 2.1.1 |

### 11. Tooltip / Tutorial Overlay (3 tests)

| Test | WCAG SC(s) |
|------|-----------|
| Esc — dismiss tooltip overlay | SC 2.1.1 |
| Tab — navigate through tooltip steps | SC 2.1.1 |
| Enter/Space — advance to next tooltip step | SC 2.1.1 |

---

## 2. WCAG 2.1 AA Criteria → Coverage Status

Legend: ✅ Covered | ⚠️ Partial | ❌ Not covered | 🔭 Out of keyboard scope

### Principle 1 — Perceivable

| SC | Name | Level | Coverage | Tests / Notes |
|----|------|-------|----------|---------------|
| 1.1.1 | Non-text Content | A | 🔭 | Alt text, icon labels — requires visual/ARIA audit, not keyboard |
| 1.2.1 | Audio-only and Video-only | A | 🔭 | Transcript/alternative availability — not keyboard scope |
| 1.2.2 | Captions (Prerecorded) | A | ✅ | Media Player — C key (currently ❌ Missing) |
| 1.2.3 | Audio Description or Media Alternative | A | 🔭 | Existence of AD track — not keyboard scope |
| 1.2.4 | Captions (Live) | AA | ❌ | Live TV player not yet tested — new test needed |
| 1.2.5 | Audio Description (Prerecorded) | AA | ✅ | Media Player — V key (currently ❌ Missing) |
| 1.3.1 | Info and Relationships | A | 🔭 | Semantic HTML, headings, ARIA roles — screen reader / ARIA audit |
| 1.3.2 | Meaningful Sequence | A | ⚠️ | Tab order tests partially cover this — no dedicated test |
| 1.3.3 | Sensory Characteristics | A | 🔭 | Instructions not relying on shape/color — not keyboard scope |
| 1.3.4 | Orientation | AA | 🔭 | Screen rotation — not applicable to desktop web |
| 1.3.5 | Identify Input Purpose | AA | ❌ | Login form autocomplete attributes — new test needed |
| 1.4.1 | Use of Color | A | 🔭 | Color not used as sole indicator — visual audit |
| 1.4.2 | Audio Control | A | ⚠️ | M (mute) test covers volume control — not auto-play control |
| 1.4.3 | Contrast (Minimum) | AA | 🔭 | Color contrast — visual/automated audit (axe, Lighthouse) |
| 1.4.4 | Resize Text | AA | ✅ | Media Player — +/- caption size (currently ❌ Missing) |
| 1.4.5 | Images of Text | AA | 🔭 | Visual audit |
| 1.4.10 | Reflow | AA | 🔭 | 320px viewport testing — separate audit needed |
| 1.4.11 | Non-text Contrast | AA | 🔭 | Focus indicator contrast — visual audit (partially implied by 2.4.7) |
| 1.4.12 | Text Spacing | AA | 🔭 | CSS text spacing override — separate audit needed |
| 1.4.13 | Content on Hover or Focus | AA | ❌ | Tooltips and hover states — new test needed (tooltip overlay exists) |

### Principle 2 — Operable

| SC | Name | Level | Coverage | Tests / Notes |
|----|------|-------|----------|---------------|
| 2.1.1 | Keyboard | A | ✅ | Core SC — covered by 70+ tests across all categories |
| 2.1.2 | No Keyboard Trap | A | ✅ | Modals focus trap, EPG Tab, Detail Esc overlay |
| 2.1.4 | Character Key Shortcuts | A | ⚠️ | ? overlay tested; N, D, C, V, K etc. tested — no test for *disabling/remapping* shortcuts |
| 2.2.1 | Timing Adjustable | A | ❌ | Session timeout warning / extension — new test needed |
| 2.2.2 | Pause, Stop, Hide | A | ❌ | Auto-playing carousels or animations — new test needed |
| 2.3.1 | Three Flashes or Below Threshold | A | 🔭 | Flash/animation audit — not keyboard scope |
| 2.4.1 | Bypass Blocks | A | ✅ | Skip navigation link (currently ❌ Missing) |
| 2.4.2 | Page Titled | A | ❌ | Browser title tag — quick automated check, new test needed |
| 2.4.3 | Focus Order | A | ⚠️ | Tab order verified across categories — no dedicated logical-order test |
| 2.4.4 | Link Purpose (In Context) | A | ⚠️ | "Forgot password" link tested; card links not explicitly verified |
| 2.4.5 | Multiple Ways | AA | 🔭 | Site navigation options — not keyboard-specific |
| 2.4.6 | Headings and Labels | AA | 🔭 | Heading structure — screen reader / ARIA audit |
| 2.4.7 | Focus Visible | AA | ⚠️ | Implied by all Tab movement tests — no dedicated visible focus test |
| 2.5.1 | Pointer Gestures | A | 🔭 | Touch/pointer — not desktop keyboard scope |
| 2.5.2 | Pointer Cancellation | A | 🔭 | Mouse down/up behavior — not keyboard scope |
| 2.5.3 | Label in Name | A | ❌ | Icon buttons in player (play, volume) — new test needed |
| 2.5.4 | Motion Actuation | A | 🔭 | Device motion — not applicable to desktop web |

### Principle 3 — Understandable

| SC | Name | Level | Coverage | Tests / Notes |
|----|------|-------|----------|---------------|
| 3.1.1 | Language of Page | A | 🔭 | HTML lang attribute — quick automated check |
| 3.1.2 | Language of Parts | AA | 🔭 | Lang attribute on bilingual content — automated check |
| 3.2.1 | On Focus | A | ⚠️ | Implied by Tab tests — no explicit test for unexpected context change on focus |
| 3.2.2 | On Input | A | ❌ | Unexpected changes on form input — new test needed for search, dropdowns |
| 3.2.3 | Consistent Navigation | AA | 🔭 | Nav order consistency across pages — structural audit |
| 3.2.4 | Consistent Identification | AA | 🔭 | Consistent component naming — structural audit |
| 3.3.1 | Error Identification | A | ⚠️ | Login error test partially covers this — error must be keyboard reachable |
| 3.3.2 | Labels or Instructions | A | ❌ | Form field labels — ARIA audit for login, settings, search |
| 3.3.3 | Error Suggestion | AA | ❌ | Login error suggests correction — new test needed |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | AA | 🔭 | Confirm dialogs for destructive actions — partially covered by Modal tests |

### Principle 4 — Robust

| SC | Name | Level | Coverage | Tests / Notes |
|----|------|-------|----------|---------------|
| 4.1.1 | Parsing | A | 🔭 | HTML validation — automated tool (W3C validator) |
| 4.1.2 | Name, Role, Value | A | ⚠️ | Implied by ARIA pattern tests (dropdown, grid, menu, modal) — no dedicated ARIA audit |
| 4.1.3 | Status Messages | AA | ✅ | Login error announcement (currently ❌ Missing) |

---

## 3. Coverage Summary

| Category | A criteria (30 total) | AA criteria (20 total) | Total |
|----------|-----------------------|------------------------|-------|
| ✅ Covered by existing tests | 7 | 3 | **10** |
| ⚠️ Partial coverage | 7 | 1 | **8** |
| ❌ No coverage — new tests needed | 5 | 4 | **9** |
| 🔭 Out of keyboard scope | 11 | 12 | **23** |
| **Total** | **30** | **20** | **50** |

> **Note:** WCAG 2.1 AA has 50 applicable success criteria at levels A and AA combined. The "out of scope" criteria require visual, screen reader, or automated tooling audits — they are valid and important, but outside the scope of a keyboard-only audit.

---

## 4. New Tests Needed (priority order)

These are the ❌ criteria with no coverage that are achievable within a keyboard/Playwright audit:

| Priority | SC | Name | What to test |
|----------|----|------|-------------|
| 🔴 High | 1.2.4 | Captions (Live) | C key or caption toggle in Live TV player |
| 🔴 High | 2.4.7 | Focus Visible | Dedicated test: verify focus ring is visible on every interactive element |
| 🟠 Medium | 1.3.5 | Identify Input Purpose | Login form inputs have `autocomplete` attributes (email, password) |
| 🟠 Medium | 2.1.4 | Character Key Shortcuts | Verify player shortcuts can be disabled or remapped (currently no toggle exists) |
| 🟠 Medium | 2.4.2 | Page Titled | Check `<title>` tag is meaningful on each main page |
| 🟠 Medium | 2.5.3 | Label in Name | Verify icon buttons (play, mute, full screen) have accessible names matching visible label |
| 🟡 Low | 1.4.2 | Audio Control | Test whether auto-playing audio (if any) can be stopped via keyboard |
| 🟡 Low | 2.2.1 | Timing Adjustable | Verify session timeout warning is keyboard accessible |
| 🟡 Low | 3.2.2 | On Input | Verify no unexpected context change on search input or dropdowns |
| 🟡 Low | 3.3.2 | Labels or Instructions | Verify form field labels are programmatically associated |
| 🟡 Low | 3.3.3 | Error Suggestion | Verify login error message suggests what to fix |
| 🟡 Low | 1.4.13 | Content on Hover or Focus | Verify tooltip content is dismissible via Esc without moving focus |

---

## 5. Criteria Needing Non-Keyboard Tooling

These require tools outside Playwright to verify. They should be addressed in a separate audit phase:

- **Automated (axe / Lighthouse):** SC 1.4.3, 1.4.11, 4.1.1, 3.1.1, 3.1.2, 2.4.6
- **Visual inspection:** SC 1.1.1, 1.4.1, 1.4.5, 1.4.10, 1.4.12, 1.3.3, 2.3.1
- **Screen reader (VoiceOver / NVDA):** SC 1.3.1, 1.3.2, 4.1.2, 3.2.3, 3.2.4
- **Multi-page structural audit:** SC 2.4.5, 3.2.3, 3.2.4

---

*Document created: May 2026 | Based on WCAG 2.1: https://www.w3.org/TR/WCAG21/*
