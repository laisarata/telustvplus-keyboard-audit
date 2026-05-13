# TELUS TV+ Keyboard Accessibility Audit — Report
**Date:** May 2026  
**Auditor:** Lais Arata (Poatek)  
**Method:** Hybrid — Playwright automation + manual verification  
**Scope:** 75 keyboard interactions across 11 UI categories  

---

## 1. Time Investment

### Phase Breakdown (Actual)

| Phase | Description | Time |
|-------|-------------|------|
| **Planning** | Define scope, identify categories, map all keyboard shortcuts to test | ~2 h |
| **Setup** | Scaffold Playwright project, write auth flow, configure spreadsheet output | ~3 h |
| **Test authoring** | Write 75 automated test cases across 11 categories | ~5 h |
| **Debugging** | DRM/Widevine blocker, concurrent stream limit, CDP investigation, focus issues | ~4 h |
| **Automated test runs** | Execute tests, review results, fix flaky checks | ~1 h |
| **Manual testing** | Media Player (17 shortcuts), Authentication, Modals, EPG grid | ~2 h |
| **Spreadsheet & report** | Update results, write severity notes, WCAG references | ~1.5 h |
| **Total** | | **~18.5 h** |

---

### If Done Entirely Manually

| Phase | Description | Estimated Time |
|-------|-------------|----------------|
| Research | Study WCAG, ARIA patterns, industry standards (YouTube, Netflix, ARIA APG) to define what to test | ~4 h |
| Test plan | Design 75 test cases, decide scope, categories, and pass/fail criteria | ~3 h |
| Spreadsheet setup | Create and format the spreadsheet structure, columns, colour coding | ~2 h |
| Test execution | 75 tests × ~10 min each (navigate, set up state, try key, record result) | ~12.5 h |
| Documentation | Write WCAG references, severity ratings, and fix recommendations for each item | ~10 h |
| Final report | Write up findings summary, roadmap, and observations | ~3 h |
| **Total** | | **~35 h** *(conservative — could reach 40–45 h for a first-time auditor)* |

---

### Time Saved — First Run

| | Automated + Manual | Fully Manual |
|---|---|---|
| **First run** | ~18.5 h | ~35 h |
| **Net saving (first run)** | **~16.5 h** | — |

Nearly **half the time** saved on the first run alone — primarily because automation generates WCAG references, severity notes, and spreadsheet output automatically alongside each test result.

### Time Saved — On Every Retest

Every time a fix is deployed and the audit needs to be re-run:

| | Automated | Manual |
|---|---|---|
| **Full retest** | ~3 min | ~35 h |
| **Targeted retest (1 category)** | ~30 sec | ~3 h |

If the audit is re-run **3 times** (e.g. after each sprint of fixes), automation saves approximately **120 hours** over its lifetime vs. doing everything manually each time.

---

## 2. Results Summary

| Status | Count | % |
|--------|-------|---|
| ✅ Implemented | 28 | 37% |
| ❌ Missing | 36 | 48% |
| 🟡 Partial | 3 | 4% |
| 🔁 To Be Audited | 3 | 4% (blocked by bugs) |
| **Total** | **75** | |

### By Category

| Category | Implemented | Missing | Partial | To Be Audited |
|----------|------------|---------|---------|---------------|
| Global Navigation | 3 | 4 | 0 | 1 |
| Authentication | 5 | 1 | 0 | 0 |
| Content Browse & Carousels | 2 | 2 | 0 | 0 |
| Search | 3 | 1 | 0 | 0 |
| EPG / TV Guide Grid | 2 | 10 | 1 | 2 |
| Content Detail Page | 3 | 2 | 0 | 0 |
| Media Player | 6 | 10 | 0 | 0 |
| Contextual Menu | 0 | 5 | 0 | 0 |
| Modals & Overlays | 1 | 2 | 0 | 0 |
| Account & Settings | 2 | 2 | 0 | 0 |
| Tooltip / Tutorial Overlay | 2 | 1 | 0 | 0 |

---

## 3. Critical Findings

| Priority | Category | Issue | WCAG |
|----------|----------|-------|------|
| 🔴 Critical | Global Navigation | No skip navigation link — 11 Tab presses before content | SC 2.4.1 |
| 🔴 Critical | Global Navigation | Nav dropdown mouse-only — Enter/Space don't open it | SC 2.1.1 |
| 🔴 Critical | EPG / TV Guide Grid | Grid is a keyboard dead end — nothing selectable | SC 2.1.1 |
| 🔴 Critical | EPG / TV Guide Grid | Enter doesn't activate programmes — guide is view-only | SC 2.1.1 |
| 🔴 Critical | EPG / TV Guide Grid | Filter dropdown mouse-only — users stuck on "All channels" | SC 2.1.1 |
| 🔴 Critical | Contextual Menu | No keyboard equivalent to right-click on MacBook | SC 2.1.1 |
| 🔴 Critical | Modals & Overlays | No focus trap — Tab escapes to background while modal is open | SC 2.1.2 |
| 🔴 Critical | Account & Settings | Settings controls not reachable via Tab | SC 2.1.1 |
| 🟠 High | Media Player | C key doesn't toggle captions | SC 1.2.2 |
| 🟠 High | Media Player | V key doesn't toggle described video / audio description | SC 1.2.5 |
| 🟠 High | Modals & Overlays | Esc doesn't close modals — keyboard users must use mouse | SC 2.1.2 |
| 🟠 High | Content Detail | "More" popup opens via keyboard but Esc doesn't close it | SC 2.1.2 |
| 🟠 High | Authentication | Error messages not announced to screen readers | SC 4.1.3 |

---

## 4. Pros & Cons of This Automation Approach

### ✅ Pros

| Benefit | Detail |
|---------|--------|
| **Speed on retest** | Full 75-item audit runs in ~3 minutes after fixes are deployed |
| **Consistency** | Every test runs the same way every time — no human fatigue or variation |
| **Living document** | Spreadsheet auto-updates after every run — always reflects current state |
| **Scalability** | Adding new tests for new features takes minutes, not hours |
| **Evidence trail** | Each result includes exact observed behaviour, not just pass/fail |
| **WCAG mapping** | Severity and WCAG references generated automatically alongside results |

### ❌ Cons

| Limitation | Detail |
|------------|--------|
| **DRM content** | Playwright's Chromium can't play Widevine-encrypted streams — Media Player required full manual testing |
| **Auth fragility** | TELUS TV+ session tokens expire quickly (~1 hr), requiring re-login before each run |
| **Concurrent stream limit** | Each test run risks accumulating ghost sessions on the TELUS server |
| **Visual judgment gaps** | Automation detects DOM changes but can't judge if a visual change is meaningful |
| **No screen reader coverage** | Keyboard accessibility ≠ screen reader accessibility — VoiceOver/NVDA tests not included |
| **Blocked tests** | 3 items couldn't be tested due to existing bugs (filter dropdown, nav dropdown) |
| **Platform dependency** | Tests assume a specific browser (Chrome) and OS (macOS) — results may differ on Windows/Firefox |

---

## 5. Interesting Observations

### 🎯 The EPG grid is the biggest single failure
The TV Guide grid is reachable via keyboard (after 11 Tab presses) but is completely non-interactive — it scrolls but no programme can ever be focused or selected. For a core feature of a TV platform, this means the entire programme guide is inaccessible to keyboard users.

### 🔐 DRM is an unexpected automation barrier
TELUS TV+ uses Widevine DRM for all video streams. Playwright's bundled Chromium doesn't include the Widevine CDM plugin, which means automated tests can never verify actual video playback. This is a known limitation across the entire industry for streaming platform testing — even with a valid logged-in session, the stream fails silently. Any keyboard shortcut that requires actual video playback must be tested manually.

### ♿ The most impactful missing features affect users who need them most
The two highest-priority missing Media Player shortcuts — **C (captions)** and **V (described video)** — are the ones that directly affect deaf and blind users. These are the users most likely to be using keyboard-only navigation, and they're the ones who can't access the accessibility features they need most.

### 🖱️ The Contextual Menu is a Mac-specific accessibility gap
The right-click contextual menu (Record, Record Series, Details) has no keyboard equivalent on MacBook. The Context Menu key exists on Windows keyboards but not on Apple hardware. Fn+Shift+F10 (the macOS equivalent) does not trigger the menu. Since TELUS TV+ is primarily used on macOS/Apple TV, this is a significant gap. The fix — adding a visible ⋯ button on each card — would solve the issue on all platforms.

### 🔄 Modal accessibility is a systemic failure, not isolated
The same three modal failures (no focus trap, Esc doesn't close, focus doesn't move in on open) were found on every modal we tested — the More info popup, the delete confirmation dialog, and likely all others. This is not a one-off bug but a systemic architectural pattern that needs to be fixed at the modal component level.

### ⏱️ Authentication is a bright spot
Despite the app having significant keyboard accessibility issues, the login flow is well-implemented — focus lands on the email field automatically, Tab order is logical, Enter and Space work on all buttons. The only gap is error message announcement (no `role="alert"`), which is a one-line fix.

---

## 6. Recommended Fix Priority

### Sprint 1 — Quick wins (1–2 days each)
1. Add `role="alert"` to login error messages
2. Add skip navigation link to all pages
3. Add Esc key listener to all modal components
4. Move focus into modal on open; add focus trap

### Sprint 2 — Core interactions (3–5 days each)
5. Fix Enter/Space on nav dropdown
6. Fix Enter/Space on EPG filter dropdown
7. Add keyboard shortcut C for captions toggle in Media Player
8. Add keyboard shortcut V for described video toggle in Media Player
9. Fix Tab order in Account & Settings

### Sprint 3 — EPG grid (1–2 weeks)
10. Implement focusable grid cells with roving tabindex
11. Add Enter/Space to activate programme details from grid
12. Add ⋯ button on cards as keyboard alternative to right-click contextual menu

---

## 7. What's Not Covered (Future Audit Scope)

- **Screen reader testing** (VoiceOver on macOS/iOS, NVDA on Windows)
- **Windows keyboard testing** (some shortcuts differ, Context Menu key available)
- **Mobile / touch device testing**
- **High contrast mode / forced colours**
- **Zoom / reflow testing** (200%, 400% zoom)
- **Logged-out experience** beyond the login form
- **Search results keyboard navigation** (arrow keys in result rows)
- **Live TV player** keyboard shortcuts (separate from VOD player)

---

*Report generated: May 2026 | Tools: Playwright, ExcelJS, Claude*
