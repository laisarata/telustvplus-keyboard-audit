# TELUS TV+ Keyboard Accessibility Audit

## Project Overview
Keyboard accessibility audit for the TELUS TV+ web platform, conducted by Lais Arata (Product Designer) using a hybrid approach: AI-assisted automated testing (Playwright) + manual verification.

## What Was Done
- Audited **75 keyboard interactions** across **11 UI categories**
- Combined automated tests (Playwright) with manual testing for DRM-protected content (Media Player)
- Documented all findings with severity ratings, WCAG references, and fix recommendations
- Created an interactive visual report styled with the TELUS TV+ design system
- Published the report publicly on GitHub Pages
- Documented accessibility standards and Canadian compliance requirements

## Key Results
| Status | Count | % |
|--------|-------|---|
| ✅ Implemented | 28 | 37% |
| ❌ Missing | 36 | 48% |
| 🟡 Partial | 3 | 4% |
| 🔁 To Be Audited | 8 | 11% |

## Critical Issues Found
- No skip navigation link (11 Tab presses before content)
- Nav dropdown is mouse-only (Enter/Space don't work)
- EPG TV Guide grid is a keyboard dead end — nothing selectable
- No focus trap in modals — Tab escapes to background
- Esc doesn't close modals
- Captions (C) and described video (V) shortcuts missing in Media Player
- Settings controls not reachable via Tab

## Important Links
- **Live Report:** https://laisarata.github.io/telustvplus-keyboard-audit/audit-report.html
- **Spreadsheet:** https://docs.google.com/spreadsheets/d/1YFTstmRE0yygWlmBF-MFAg25GsMxJjEh/edit?usp=sharing
- **GitHub Repo:** https://github.com/laisarata/telustvplus-keyboard-audit

## Folder Structure
```
telus-a11y-tests/
├── docs/                        # Documentation and reports
│   ├── AUDIT_REPORT.md          # Full markdown report with methodology and findings
│   ├── audit-report.html        # Visual HTML report (published on GitHub Pages)
│   ├── TTV_Keyboard_Accessibility_Audit.xlsx  # Spreadsheet with all 75 test results
│   └── STANDARDS_REFERENCE.md  # Accessibility standards used and Canadian compliance
├── tests/                       # Playwright test suites
│   ├── keyboard-audit.spec.ts   # Main automated test suite (75 tests)
│   ├── a11y.spec.ts
│   └── login.spec.ts
├── scripts/
│   ├── auth/                    # Authentication scripts
│   │   ├── open-login.mjs       # Opens browser and saves session
│   │   ├── check-auth.mjs       # Verifies session is valid
│   │   └── auth-state.json      # Saved browser session (gitignored)
│   ├── inspect/                 # Exploratory/debug scripts (not part of test suite)
│   └── utils/                   # Utility scripts
│       ├── update-spreadsheet.mjs  # Writes test results to Google Sheets
│       ├── open-home.mjs
│       ├── open-player.mjs
│       └── ...
├── screenshots/
│   ├── explore/                 # Screenshots from exploration scripts
│   └── manual/                  # Screenshots from manual testing
├── results/                     # Generated test outputs
│   ├── test-results.json
│   ├── audit_export.csv
│   └── explore-report.json
├── helpers/
│   └── write-result.ts          # Helper to write results during test runs
├── CLAUDE.md                    # This file
├── playwright.config.ts
└── package.json
```

## How to Run Tests
1. Run `node scripts/auth/open-login.mjs` to log in and save session
2. Run `npx playwright test` to execute all 75 automated tests
3. Run `node scripts/utils/update-spreadsheet.mjs` to update the spreadsheet with results

## Next Steps (Planned Iteration)
- [x] Research Canadian accessibility standards (AODA, EN 301 549)
- [x] Document standards reference with Canadian compliance mapping → `docs/STANDARDS_REFERENCE.md`
- [ ] Map all 78 WCAG 2.1 AA criteria to existing 75 test cases
- [ ] Write new test cases for CAN/ASC – EN 301 549:2024 Clause 7 (Media Player: captions, audio description, user controls)
- [ ] Create AODA compliance checklist mapping current findings to IASR obligations
- [ ] Re-run audit with expanded standard coverage
- [ ] Update report and spreadsheet with new findings

## Notes
- **DRM limitation:** Media Player tests must be done manually — Playwright cannot play Widevine-encrypted streams
- **Auth expiry:** Session tokens expire in ~1 hour — re-run `scripts/auth/open-login.mjs` before each test session
- **Time saved:** ~16.5h saved on first run vs fully manual; ~120h saved across 3 retests
- **Canadian compliance:** TELUS is subject to AODA (Ontario, overdue since 2021) and ACA Digital Regulations (federal, deadline 2028). See `docs/STANDARDS_REFERENCE.md` for details.
