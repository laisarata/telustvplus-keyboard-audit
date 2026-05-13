# Accessibility Standards Reference
**Project:** TELUS TV+ Keyboard Accessibility Audit  
**Maintained by:** Lais Arata (Poatek)  
**Last updated:** May 2026

This document lists all accessibility standards and sources used to define, scope, and evaluate the 75 test cases in this audit. It maps the legal obligations applicable to TELUS as an Ontario-based, federally regulated telecommunications provider — **Canadian standards are the primary compliance framework for this project.**

---

## 1. Canadian Legal & Regulatory Standards ⚡ Priority

TELUS is subject to two layers of Canadian accessibility law: provincial (AODA) and federal (ACA). Both are in force or approaching enforcement. This section should be treated as the primary compliance lens for all test planning.

---

### AODA — Accessibility for Ontarians with Disabilities Act
**Integrated Accessibility Standards Regulation (IASR), O. Reg. 191/11**  
🔗 https://www.ontario.ca/laws/regulation/110191  
🔗 https://www.ontario.ca/page/how-make-websites-accessible

**What it is:** Ontario provincial law requiring organizations to make their websites and web content accessible. The technical baseline mandated is WCAG 2.0 Level AA. WCAG 2.2 AA is now the recommended level for practical and future-proof compliance.

**Who it applies to:** Public-sector organizations of any size, and private-sector organizations with 50+ employees operating in Ontario. **Compliance deadline was January 1, 2021 — this is already overdue.**

**Why it applies to TELUS:** TELUS operates in Ontario and employs over 50 people. The TELUS TV+ web platform is subject to AODA requirements today.

**Compliance gaps identified in this audit:**

| WCAG SC | Issue found | AODA status |
|---------|-------------|-------------|
| SC 2.4.1 | No skip navigation link | ❌ Active violation |
| SC 2.1.1 | Nav dropdown, EPG grid, Contextual menu, Settings — mouse-only | ❌ Active violation |
| SC 2.1.2 | No focus trap in modals, Esc doesn't close | ❌ Active violation |
| SC 4.1.3 | Login error not announced to screen readers | ❌ Active violation |
| SC 1.2.2 | C key (captions) missing in Media Player | ❌ Active violation |
| SC 1.2.5 | V key (audio description) missing in Media Player | ❌ Active violation |

---

### ACA — Accessible Canada Act + Digital Technologies Accessibility Regulations
**Accessible Canada Act (S.C. 2019, c. 10)**  
🔗 https://laws-lois.justice.gc.ca/eng/acts/A-0.6/  
🔗 https://accessible.canada.ca/  
🔗 https://gazette.gc.ca/rp-pr/p1/2024/2024-12-21/html/reg5-eng.html

**What it is:** Federal Canadian legislation aiming for a barrier-free Canada by 2040. In December 2025, the government finalized the **Digital Technologies Accessibility Regulations** under the ACA — the most significant expansion of digital accessibility obligations for federally regulated private entities in Canadian history.

**Compliance timeline:**
- Federal public-sector entities: **December 5, 2027**
- Large federally regulated private-sector entities (including TELUS): **December 5, 2028**

**Why it applies to TELUS:** TELUS is a federally regulated telecommunications provider under the CRTC. It falls squarely under the ACA and the new digital regulations.

**Technical standard referenced by the ACA digital regulations:** CAN/ASC – EN 301 549:2024 (see below). Meeting this standard is how TELUS demonstrates ACA compliance for digital products.

---

### CAN/ASC – EN 301 549:2024 ⚡ Key technical standard
**Accessibility requirements for ICT products and services**  
🔗 https://accessible.canada.ca/creating-accessibility-standards/canasc-en-301-5492024-accessibility-requirements-ict-products-and-services  
🔗 https://accessible.canada.ca/creating-accessibility-standards/summary-can-asc-en-301-5492024-accessibility-requirements-ict-products-and-services-en-301-5492021-idt  
🔗 https://accessible.canada.ca/sites/default/files/2024-05/can-asc-en301549-accessibilityrequirements_ict_productsservices.pdf (full PDF)

**What it is:** Canada's national adoption of the European EN 301 549 standard (based on EN 301 549:2021), published by Accessibility Standards Canada in May 2024. This is the ICT accessibility standard referenced by the ACA's digital regulations and the primary technical reference for TELUS's federal compliance.

**Why it matters beyond WCAG:** WCAG covers only web content. CAN/ASC – EN 301 549:2024 covers the full ICT stack — websites, software applications, hardware, documents, and **time-based media / video players**. This makes it the right standard to evaluate the TELUS TV+ Media Player and EPG grid as ICT components, not just as web content.

---

#### Clause 7 — ICT with Video Capabilities (full breakdown)

This is the most critical clause for the TELUS TV+ audit. It applies directly to the Media Player and any component that displays synchronized audio and video.

**7.1 — Caption processing**

| Sub-clause | Requirement | Current status in TELUS TV+ |
|------------|-------------|----------------------------|
| 7.1.1 | Captioning playback — ICT shall display captions when available | 🔁 Not yet audited |
| 7.1.2 | Captioning synchronisation — captions must be synchronized with audio | 🔁 Not yet audited |
| 7.1.3 | Preservation of captioning — when converting/recording, caption data must be preserved | 🔁 Not yet audited |
| 7.1.4 | Captions characteristics — user must be able to adjust font, size, colour, contrast of captions | 🔁 Not yet audited |
| 7.1.5 | Spoken subtitles — where TTS is provided, captions must be speakable | 🔁 Not yet audited |

**7.2 — Audio description**

| Sub-clause | Requirement | Current status in TELUS TV+ |
|------------|-------------|----------------------------|
| 7.2.1 | Audio description playback — ICT shall play audio description when available | 🔁 Not yet audited |
| 7.2.2 | Audio description synchronisation — AD must be synchronized with video | 🔁 Not yet audited |
| 7.2.3 | Preservation of audio description — when converting/recording, AD track must be preserved | 🔁 Not yet audited |

**7.3 — User controls for captions and audio description**

| Sub-clause | Requirement | Current status in TELUS TV+ |
|------------|-------------|----------------------------|
| 7.3 | Captions and AD controls must be **at least as prominent as primary playback controls** (play/pause) — they cannot be buried in settings menus | ❌ Missing — C key not implemented, AD controls not keyboard accessible |

> **Why 7.3 matters:** This is the clause that directly fails the C key (captions) and V key (described video) findings from the current audit. It goes further than WCAG SC 1.2.2 and 1.2.5 — it requires not just that captions exist, but that the user can **control them as easily as play/pause**. The current Settings page isn't keyboard accessible at all, which is a direct violation.

---

#### Clause 9 — Web content (WCAG 2.1 AA)

Clause 9 incorporates WCAG 2.1 Level AA by reference. All 78 WCAG 2.1 AA success criteria apply to the TELUS TV+ web interface under CAN/ASC – EN 301 549:2024. The 6 SCs currently mapped in this audit are a starting point — the full WCAG 2.1 AA checklist needs to be systematically covered.

---

#### Clause 11 — Software (non-web)

Clause 11 applies to software components that are not web content. The TELUS TV+ Media Player and EPG grid may qualify as embedded software components in addition to being web content — in which case Clause 11 requirements apply on top of Clause 9. This needs legal/technical verification.

---

### CRTC — Canadian Radio-television and Telecommunications Commission
**Broadcasting Regulatory Policy CRTC 2025-344**
🔗 https://crtc.gc.ca/eng/archive/2025/2025-344.htm
🔗 https://crtc.gc.ca/eng/info_sht/b321.htm
🔗 https://crtc.gc.ca/eng/consultation/cc.htm

**What it is:** The CRTC is Canada's federal broadcasting and telecommunications regulator. It has jurisdiction over broadcasters, broadcasting distribution undertakings (BDUs), and — following the Online Streaming Act (Bill C-11, 2023) — online streaming services operating in Canada. TELUS TV+ is subject to CRTC requirements both as a telecom provider and as an online streaming undertaking.

**Why it applies to TELUS:** TELUS is a federally regulated telecommunications and broadcasting company under CRTC jurisdiction. TELUS TV+ as an online streaming service falls under the expanded scope of the Broadcasting Act as amended by Bill C-11.

**Key requirements and deadlines:**

| Requirement | Deadline | Scope |
|---|---|---|
| Described video on all new original scripted programs | **December 17, 2027** | Online streaming & on-demand services |
| Audio description for all news and information programming | **December 17, 2027** | Online streaming & on-demand services |
| Search tool for users to find AD/captioned content | **December 17, 2027** | Online streaming & on-demand services |
| Annual consultation with blind/partially sighted communities | Ongoing | Online streaming undertakings |
| Caption accuracy — pre-recorded content | Ongoing | 100% accuracy target |
| Caption accuracy — live English programming | Ongoing | 98% accuracy (NER model) |
| Caption accuracy — live French programming | Ongoing | 85% accuracy (NER model) |

> **Note:** Caption accuracy requirements for online streaming services are still being finalized — the CRTC ran a consultation from June–December 2024. The accuracy standards above currently apply to traditional broadcasters; online streaming equivalents are expected to follow.

**What this adds beyond WCAG and CAN/ASC EN 301 549:**

WCAG and EN 301 549 address *how* captions and AD are controlled (keyboard access, UI prominence). CRTC goes further and addresses *what* is available (content coverage, accuracy, discoverability):

| CRTC Requirement | In scope for this audit? |
|---|---|
| AD available on scripted programming (content coverage) | ⚠️ Partially — we verified AD plays but not catalogue coverage |
| Caption accuracy (100% for pre-recorded) | ⚠️ Out of scope for keyboard audit — requires separate content audit |
| Search tool to find accessible content | ✅ In scope — testable UI feature |
| User controls for captions/AD prominent in player | ✅ Covered via Clause 7.3 |

**Compliance gaps identified in this audit:**

| Requirement | Issue found | Status |
|---|---|---|
| AD controls prominent in player | CC and AD only accessible via Settings — not in player bar | ❌ Violation |
| Search for accessible content | No dedicated search filter for captioned or AD content found | ⚠️ To verify |

---

## 2. Core Technical Standards

### WCAG 2.1 Level AA
**Web Content Accessibility Guidelines 2.1**  
🔗 https://www.w3.org/TR/WCAG21/

**What it is:** The primary international standard for web accessibility, published by the W3C. Organized around four principles (Perceivable, Operable, Understandable, Robust) and 78 success criteria across three conformance levels (A, AA, AAA).

**Why we use it:** WCAG 2.1 AA is the foundational reference for all 75 test cases in this audit, and is incorporated into both AODA and CAN/ASC – EN 301 549:2024 (Clause 9). Every pass/fail criteria, severity rating, and fix recommendation maps back to a specific success criterion.

**Level targeted:** AA

**Success Criteria referenced in this audit:**

| SC | Name | Tests |
|----|------|-------|
| 1.2.2 | Captions (Prerecorded) | Media Player — C key |
| 1.2.5 | Audio Description (Prerecorded) | Media Player — V key |
| 2.1.1 | Keyboard | Nav dropdown, EPG grid, Contextual menu, Settings |
| 2.1.2 | No Keyboard Trap | Modals & Overlays |
| 2.4.1 | Bypass Blocks | Skip navigation link |
| 4.1.3 | Status Messages | Login error announcement |

> **Note:** Only 6 of the 78 WCAG 2.1 AA criteria are explicitly flagged in current findings. Future iterations should cover the full AA checklist systematically.

---

### WCAG 2.2 Level AA
**Web Content Accessibility Guidelines 2.2**  
🔗 https://www.w3.org/TR/WCAG22/

**What it is:** The current latest version of WCAG (published October 2023), adding 9 new success criteria on top of WCAG 2.1, mainly focused on cognitive accessibility and mobile/touch interactions.

**Why we include it:** WCAG 2.2 AA is recommended for future-proof AODA compliance. EN 301 549 V4.1.0 (expected 2026) will incorporate WCAG 2.2 AA, which will then flow into the next revision of CAN/ASC.

**Key additions relevant to this project:**

| SC | Name | Relevance |
|----|------|-----------|
| 2.4.11 | Focus Not Obscured (Minimum) | Focus indicator visibility in carousels, EPG |
| 2.4.12 | Focus Not Obscured (Enhanced) | Enhanced focus visibility |
| 2.5.3 | Label in Name | Icon buttons in Media Player |
| 2.5.8 | Target Size (Minimum) | Touch targets in EPG grid and player controls |
| 3.2.6 | Consistent Help | Keyboard shortcuts help overlay (? key) |

---

### ARIA Authoring Practices Guide (APG)
**WAI-ARIA Authoring Practices Guide 1.2**  
🔗 https://www.w3.org/WAI/ARIA/apg/

**What it is:** W3C guidance on how to implement accessible interactive UI patterns using ARIA roles, states, and properties. Defines expected keyboard interaction models for common components.

**Why we use it:** The APG provides the expected keyboard behaviour for each UI pattern tested. When a component deviates from APG patterns, that deviation is the basis for a "Missing" or "Partial" result.

**Patterns referenced in this audit:**

| Pattern | Applies to |
|---------|-----------|
| [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Modals & Overlays — focus trap, Esc to close |
| [Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) | Global Navigation dropdown |
| [Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) | EPG / TV Guide grid navigation |
| [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) | Content Detail "More" popup |
| [Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) | Media Player volume/scrubber controls |

---

## 3. Industry Benchmarks

The keyboard shortcuts tested for the Media Player were scoped by cross-referencing major streaming and video platforms. These are not normative standards — they inform what keyboard users of streaming platforms already expect.

| Platform | Reference |
|----------|-----------|
| YouTube | https://support.google.com/youtube/answer/7631406 |
| Netflix | https://help.netflix.com/en/node/62438 |
| Apple TV+ (web) | https://support.apple.com/en-ca/guide/tvplus |
| BBC iPlayer | https://www.bbc.co.uk/accessibility/forproducts/guides/html/ |

---

## 4. Standards Coverage Map

| Standard | Status in audit | Priority | Gap |
|----------|----------------|----------|-----|
| AODA / IASR | Mapped via WCAG columns in spreadsheet | 🔴 Overdue | Active violations documented |
| ACA Digital Regs + CAN/ASC – EN 301 549:2024 Clause 7 | ✅ Audited (6 test cases) | 🔴 High (deadline 2028) | 7.1.4 and 7.3 failing |
| CAN/ASC – EN 301 549:2024 Clause 9 (WCAG 2.1 AA) | Partially mapped (6 of 78 SCs) | 🔴 High | 72 SCs not yet systematically tested |
| CRTC (Broadcasting / Online Streaming) | Partially — player controls and AD verified | 🔴 High (DV deadline 2027) | Caption accuracy, catalogue coverage, search tool not yet audited |
| WCAG 2.1 AA | Partially mapped (6 of 78 SCs) | 🟠 Medium | Same as Clause 9 above |
| WCAG 2.2 AA | Not yet mapped | 🟡 Future | 9 new SCs — plan for next iteration |
| ARIA APG | Partially applied (5 patterns) | 🟠 Medium | Combobox, carousel patterns not yet covered |
| EN 301 549 V4.1.0 (draft) | Monitor only | 🟡 Future | Expected 2026, will include WCAG 2.2 |

---

## 5. Recommended Next Steps

**Phase 1 — Canadian compliance (priority)**
1. ✅ Map AODA status to all findings — active violations documented in spreadsheet
2. ✅ Audit CAN/ASC – EN 301 549:2024 Clause 7 — 6 test cases completed; 7.1.4 and 7.3 are failing
3. Add CRTC to audit scope — verify search tool for accessible content; flag caption accuracy for separate content audit
4. Verify whether Media Player and EPG grid qualify as Clause 11 (software) components — if yes, expand test scope accordingly

**Phase 2 — Full WCAG coverage**

4. Map all 78 WCAG 2.1 AA criteria to existing test cases — identify which are covered, which are passing-by-default, and which need new tests
5. Add WCAG 2.2 AA delta — write test cases for the 9 new success criteria relevant to the platform

**Phase 3 — Future-proofing**

6. Monitor EN 301 549 V4.1.0 release (expected 2026) — once published, assess delta from V3.2.1 and update test scope
7. Reassess AODA technical baseline if Ontario updates its regulations to reference WCAG 2.2

---

*Document created: May 2026 | Sources: W3C, ETSI, Accessibility Standards Canada, Government of Ontario, Canada Gazette*
