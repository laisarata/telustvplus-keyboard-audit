import ExcelJS from './node_modules/exceljs/dist/es5/exceljs.nodejs.js';

// ── Data ─────────────────────────────────────────────────────────────────────
const rows = [
  // 1. GLOBAL NAVIGATION
  ['Global Navigation', 'Tab', 'Tab moves focus through nav items (Home, TV Guide, etc.) and reaches main content area. Focus visible on nav icons.', 'Move focus to next interactive element', 'Implemented', 'Critical', 'WCAG 2.1 SC 2.1.1 – Tab navigation works across the nav rail and into content. No skip link exists, so users must Tab through all nav items before reaching content (see Skip Navigation Link row).'],
  ['Global Navigation', 'Shift+Tab', 'Shift+Tab navigates backwards correctly through nav items.', 'Move focus to previous interactive element', 'Implemented', 'Critical', 'WCAG 2.1 SC 2.1.1 – reverse Tab navigation works correctly.'],
  ['Global Navigation', 'Skip Navigation Link', 'No skip navigation link exists — users must Tab through the entire nav rail before reaching page content.', 'Skip repeated navigation and jump to main content', 'Missing', 'High', 'WCAG 2.1 SC 2.4.1 – required for AA compliance. Without a skip link, every keyboard user must Tab through all nav items on every page load. Fix: add a visually hidden "Skip to main content" link as the first focusable element on every page.'],
  ['Global Navigation', 'Enter / Space (open menu)', 'Enter/Space do not open the nav dropdown menu — the menu is mouse-only. Pages only reachable via dropdown are inaccessible to keyboard users.', 'Open navigation dropdown menu when the menu button is focused', 'Missing', 'Critical', 'WCAG 2.1 SC 2.1.1 – hard AA failure. The nav dropdown is completely inaccessible by keyboard. Fix: add keydown listeners for Enter and Space on the menu trigger button.'],
  ['Global Navigation', 'Esc (Escape)', 'Could not verify — dropdown cannot be opened via keyboard so Esc inside it cannot be tested.', 'Close open menus and return focus to the trigger element', 'To Be Audited', 'Medium', 'WCAG 2.1 SC 2.1.2 – blocked by Enter/Space fix. Once dropdown opens via keyboard, Esc must close it and return focus to the trigger button.'],
  ['Global Navigation', 'F6', 'F6 had no effect — pane switching not implemented.', 'Move between major UI panes/regions', 'Missing', 'Low', 'Not a WCAG requirement. A Windows/browser convention for panel navigation. Nice-to-have for power users.'],
  ['Global Navigation', 'Alt+Left / Alt+Right', 'Alt+Left/Right trigger browser back/forward correctly — app does not intercept these shortcuts.', 'Browser back/forward – must NOT be intercepted by the app', 'Implemented', 'Medium', 'WCAG 2.1 SC 2.1.4 – browser history navigation shortcuts work as expected and are not intercepted by the app.'],
  ['Global Navigation', '? or Shift+?', '? key had no effect — no keyboard shortcuts help overlay exists.', 'Display keyboard shortcuts help overlay', 'Missing', 'Low', 'Not a WCAG requirement. Best practice from YouTube/Netflix for shortcut discoverability. Does not affect compliance.'],

  // 2. AUTHENTICATION
  ['Authentication', 'Tab / Shift+Tab', 'Tab moves focus logically through the login form: email → password → Sign In button → Forgot password link. Shift+Tab navigates backwards correctly.', 'Navigate between email, password fields and buttons', 'Implemented', 'Critical', 'WCAG 2.1 SC 2.1.1 – full keyboard access on the login form is working. Focus order is logical and complete.'],
  ['Authentication', 'Enter / Return', 'Enter submits the login form when focused on the password field or the Sign In button.', 'Submit login form when focused on a field or button', 'Implemented', 'High', 'WCAG 2.1 SC 2.1.1 – Enter correctly submits the login form. Standard form submission behaviour is working.'],
  ['Authentication', 'Focus on page load', 'Focus automatically lands on the email field when the login page loads — users can start typing immediately without clicking.', 'Email field should receive focus automatically when the login page loads', 'Implemented', 'Medium', 'Best practice implemented — auto-focus on the email field reduces friction for keyboard-only users. No action needed.'],
  ['Authentication', 'Space / Enter (login button)', 'Both Space and Enter activate the Sign In button when it is focused.', 'Activate the Login/Sign In button using Space or Enter when it is focused', 'Implemented', 'Critical', 'WCAG 2.1 SC 2.1.1 – the Sign In button is correctly activatable via both Space and Enter. Standard button behaviour is working.'],
  ['Authentication', 'Error message accessibility', 'Error message appears visually after failed login but focus does not move to it — keyboard users must Tab to discover the error. Screen readers will not announce it automatically.', 'Error messages after failed login must be reachable and announced via keyboard', 'Missing', 'High', 'WCAG 2.1 SC 4.1.3 – status messages must be programmatically determined. Fix: add role="alert" or aria-live="assertive" to the error message container so screen readers announce it automatically on failed login, without requiring the user to Tab to find it.'],
  ['Authentication', 'Forgot password link', '"Forgot password?" link is reachable via Tab and activatable with Enter.', '"Forgot password?" link must be reachable via Tab and activatable with Enter', 'Implemented', 'High', 'WCAG 2.1 SC 2.1.1 – the Forgot password link is keyboard accessible. No action needed.'],

  // 3. CONTENT BROWSE & CAROUSELS
  ['Content Browse & Carousels', 'Tab / Shift+Tab', 'Tab reaches carousel cards and featured content. Focus moves card by card through all items in a row, then continues to the next row.', 'Move focus between carousels and featured content areas', 'Implemented', 'Critical', 'WCAG 2.1 SC 2.1.1 – Tab navigation reaches carousel content. However, with 20–30+ cards per row, users must Tab through every card individually. Arrow key navigation (see next row) would greatly reduce the number of keypresses needed.'],
  ['Content Browse & Carousels', 'Left / Right Arrow', 'Arrow keys do not move between carousel items — Tab must be used instead. Each card requires a separate Tab press.', 'Move between items within a carousel row', 'Missing', 'High', 'WCAG 2.1 SC 2.1.1 – the ARIA listbox/grid pattern requires arrow keys for within-row navigation. Without this, keyboard users must Tab through every single card. Fix: add role="listbox" or role="grid" on carousel containers with roving tabindex so arrow keys move between cards within a row.'],
  ['Content Browse & Carousels', 'Enter / Return', 'Enter on a focused card opens the content detail page correctly.', 'Open selected content detail page', 'Implemented', 'High', 'WCAG 2.1 SC 2.1.1 – Enter correctly activates focused cards and navigates to the detail page.'],
  ['Content Browse & Carousels', 'Home / End', 'Home/End keys had no effect on carousel navigation.', 'Jump to first / last item in a carousel row', 'Missing', 'Medium', 'ARIA grid pattern best practice. Not a hard WCAG requirement. Useful for power users to jump to start/end of a long carousel row. Lower priority than arrow key navigation.'],

  // 4. SEARCH
  ['Search', 'Tab', 'Tab reaches the search input. After typing, Tab moves focus into result cards in carousel rows.', 'Reach the search input from page start via Tab, then Tab into result cards after typing', 'Implemented', 'Critical', 'WCAG 2.1 SC 2.1.1 – search input and results are reachable via Tab. Core search flow is keyboard accessible.'],
  ['Search', 'Arrow keys', 'Arrow keys do not navigate between search result cards — Tab must be used to move through results one by one.', 'Move between result cards within a search results row', 'Missing', 'High', 'WCAG 2.1 SC 2.1.1 – search results use the same carousel layout as the home page. Arrow keys should navigate within a results row. Same fix as Content Browse: add role="listbox" or roving tabindex on result rows.'],
  ['Search', 'Enter / Return', 'Enter submits the search query and loads results correctly. Enter on a result card opens the content detail page.', 'Submit the search query and load results', 'Implemented', 'High', 'WCAG 2.1 SC 2.1.1 – Enter correctly submits search and activates result cards.'],
  ['Search', 'Esc (Escape)', 'Esc clears the search input when focused, allowing the user to retype without using the mouse.', 'Clear the search input or navigate away from the search page', 'Implemented', 'Medium', 'WCAG 2.1 SC 2.1.1 – Esc correctly clears the search field. Expected keyboard behaviour is working.'],

  // 5. EPG / TV GUIDE GRID
  ['EPG / TV Guide Grid', 'Filter — Tab', 'Filter button ("All channels") is reachable via Tab, but pressing Enter/Space does not open it — so reaching it has no practical value for keyboard users.', 'Filter button ("All channels") must be reachable via Tab', 'Partial', 'Critical', 'WCAG 2.1 SC 2.1.1 – the filter button is in the Tab order but cannot be activated via keyboard (see Enter/Space row). Being reachable but not operable is a hollow win. Fix the Enter/Space issue to make this fully functional.'],
  ['EPG / TV Guide Grid', 'Filter — Enter/Space', 'Enter and Space do not open the filter dropdown when the button is focused — keyboard users cannot filter channels by category.', 'Enter or Space must open the filter dropdown when the button is focused', 'Missing', 'Critical', 'WCAG 2.1 SC 2.1.1 – keyboard users are permanently stuck on "All channels" with no way to filter by Sports, Movies, etc. Fix: add keydown listeners for Enter and Space on the filter button to open the dropdown.'],
  ['EPG / TV Guide Grid', 'Filter — Arrow keys', 'Cannot be tested — dropdown does not open via keyboard. Blocked by Enter/Space fix.', 'Arrow keys must navigate between filter options once the dropdown is open', 'To Be Audited', 'High', 'ARIA listbox pattern – once the dropdown opens via keyboard, verify that Up/Down Arrow move between options. Retest after Enter/Space fix is implemented.'],
  ['EPG / TV Guide Grid', 'Filter — Esc', 'Cannot be tested — dropdown does not open via keyboard. Blocked by Enter/Space fix.', 'Esc must close the filter dropdown and return focus to the filter button', 'To Be Audited', 'High', 'WCAG 2.1 SC 2.1.2 – verify after Enter/Space fix. Esc must close the dropdown and return focus to the filter button trigger.'],
  ['EPG / TV Guide Grid', 'Left Arrow', 'Left/Right Arrow keys scroll the grid horizontally when it is focused, but do not move focus between individual programme cells — no cell becomes selected or activatable.', 'Move between time slots (e.g., 8:00 PM → 8:30 PM show)', 'Missing', 'High', 'WCAG 2.1 SC 2.1.1 – arrow keys scroll the grid visually but do not implement cell navigation. The ARIA grid pattern requires arrow keys to move focus between individual cells. Fix: implement focusable grid cells with roving tabindex so Left/Right Arrow moves focus between time slots.'],
  ['EPG / TV Guide Grid', 'Right Arrow', 'Right Arrow scrolls the grid horizontally but does not move focus to the next programme cell.', 'Move between time slots (e.g., 8:00 PM → 8:30 PM show)', 'Missing', 'High', 'WCAG 2.1 SC 2.1.1 – same as Left Arrow. Scrolling is not the same as cell navigation. Keyboard users cannot focus individual programmes.'],
  ['EPG / TV Guide Grid', 'Up Arrow', 'Up/Down Arrow keys scroll the grid vertically when focused, but do not move focus between channel rows — no cell becomes selected or activatable.', 'Move between different channels (e.g., CBC → CTV)', 'Missing', 'High', 'WCAG 2.1 SC 2.1.1 – Up/Down Arrow scroll visually but do not navigate between channel rows. Fix: implement focusable grid cells with roving tabindex so Up/Down Arrow moves focus between channels.'],
  ['EPG / TV Guide Grid', 'Down Arrow', 'Down Arrow scrolls the grid vertically but does not move focus to the next channel row.', 'Move between different channels (e.g., CBC → CTV)', 'Missing', 'High', 'WCAG 2.1 SC 2.1.1 – same as Up Arrow. Visual scrolling only, no cell focus navigation.'],
  ['EPG / TV Guide Grid', 'Tab / Shift+Tab', 'Grid is reachable via Tab but requires 11 Tab presses from the top of the page. Once focused, the grid is a dead end — no programme can be selected and Shift+Tab is the only way out.', 'Move focus between grid and surrounding UI controls', 'Partial', 'Critical', 'WCAG 2.1 SC 2.1.1 – the grid is technically in the Tab order but is not usable. 11 Tab presses to reach it is excessive (recommend a Skip to Guide link). Once inside, no programme is selectable and focus cannot move forward — it is effectively a keyboard dead end. Fix: implement a proper ARIA grid pattern with focusable cells and Enter to activate.'],
  ['EPG / TV Guide Grid', 'Page Up / Page Down', 'Page Up/Down scrolls the guide grid once it is focused (after 11 Tab presses).', 'Scroll the page up or down by a full page', 'Implemented', 'Medium', 'Scroll via Page Up/Down works once the grid is focused. However the grid is not practically usable since no programme can be selected.'],
  ['EPG / TV Guide Grid', 'Home / End', 'Home/End keys had no effect on the grid row.', 'Jump to first / last item in a grid row', 'Missing', 'Medium', 'ARIA grid pattern best practice. Home/End not implemented. Lower priority than fixing cell selection.'],
  ['EPG / TV Guide Grid', 'Enter / Return', 'Enter has no effect when the grid is focused — no programme can be selected or activated via keyboard. The grid is a scroll-only dead end.', 'Select the program to see more details or start watching', 'Missing', 'Critical', 'WCAG 2.1 SC 2.1.1 – without Enter on a focused programme, keyboard users cannot watch or get details on anything from the guide. This is the core interaction failure on the EPG page. Fix: implement focusable grid cells with tabindex and Enter/Space to activate programme details.'],
  ['EPG / TV Guide Grid', 'Spacebar', 'Space scrolls the grid when it is focused — same as Page Down behaviour. Does not select or activate any programme.', 'Secondary action or toggle a favourite channel', 'Missing', 'Medium', 'Space only scrolls the grid, it does not activate any programme or action. Not functioning as an interactive control.'],
  ['EPG / TV Guide Grid', 'N (Now)', 'Missing — grid does not jump to current time', 'Jump the grid back to the current time when scrolled into the future', 'Missing', 'Medium', 'Useful shortcut to reset the grid to "now" after scrolling. Not a WCAG requirement but improves usability for long-session users. Dependent on grid being Tab-reachable.'],
  ['EPG / TV Guide Grid', 'D (Day) / Alt+Right Arrow', 'Missing — grid does not advance to next day', 'Jump to the next day\'s schedule', 'Missing', 'Low', 'Convenience shortcut for jumping to tomorrow\'s schedule. Nice-to-have for power users, not a compliance issue. Dependent on grid being Tab-reachable.'],

  // 6. CONTENT DETAIL PAGE
  ['Content Detail Page', 'Tab / Shift+Tab', 'Tab reaches content area (Watch, Watchlist, More buttons) after ~7 presses. Shift+Tab navigates backwards correctly.', 'Navigate between Watch, Add to Watchlist, Episodes tabs and other controls', 'Implemented', 'Critical', 'WCAG 2.1 SC 2.1.1 – Tab navigation works. Note: ~7+ presses before reaching page content (global nav consumes many tab stops). Recommend adding a "Skip to content" link (SC 2.4.1) to reduce this to 1–2 presses.'],
  ['Content Detail Page', 'Enter / Return', 'Enter activated the focused content button (navigated to the correct action).', 'Activate the focused button or link (Watch, episode, tab)', 'Implemented', 'High', 'WCAG 2.1 SC 2.1.1 – Enter key correctly activates focused buttons. Standard activation pattern is working.'],
  ['Content Detail Page', 'Arrow keys', 'Arrow keys did not navigate between season/episode tabs — tabs are not implementing the ARIA tab pattern.', 'Navigate between season/episode tabs using arrow keys', 'Missing', 'Medium', 'ARIA Authoring Practices (Tab pattern) – when focus is inside a tablist, Left/Right Arrow should move between tabs. Currently Tab must be used instead, which is non-standard and confusing for screen reader users. Fix: add role="tablist" / role="tab" and implement arrow key roving tabindex.'],
  ['Content Detail Page', 'Spacebar', 'Spacebar toggled the Add to Watchlist button (confirmed working).', 'Toggle the Add to Watchlist button (add or remove from watchlist)', 'Implemented', 'High', 'WCAG 2.1 SC 2.1.1 – Spacebar activates the Watchlist toggle correctly. Standard button behaviour is working.'],
  ['Content Detail Page', 'Esc (Escape)', 'The "More" info popup opens via Enter key, but Esc does NOT dismiss it. Focus is not moved into the modal when it opens — keyboard users are trapped and must use the mouse to click the × close button.', 'Close overlay opened by the "More" button (show info popup)', 'Missing', 'High', 'WCAG 2.1 SC 2.1.2 (No Keyboard Trap) – the "More" popup opens via keyboard (Enter works) but does not manage focus. On open, focus must move to the first focusable element inside the popup (e.g. the × close button). Add an Esc key listener on the popup container. On close, restore focus to the "More" button. Without this fix, keyboard users cannot close the popup.'],
  ['Content Detail Page', 'Focus on page load', 'Focus lands on BODY when the detail page loads — no meaningful element receives focus automatically.', 'Focus should land on a meaningful element when the detail page loads', 'Missing', 'Medium', 'WCAG 2.1 SC 2.4.3 (Focus Order) – on SPA route change, the browser does not automatically move focus. Focus lands on BODY, giving screen reader users no context about the new page. Fix: on route change to a detail page, programmatically move focus to the page <h1> (show title) or the primary Watch/Play button. This helps all keyboard and screen reader users immediately orient to the page.'],

  // 7. MEDIA PLAYER
  ['Media Player', 'Spacebar', 'Spacebar toggled play/pause — confirmed working during manual test.', 'Play / Pause the video', 'Implemented', 'High', 'WCAG 2.1 SC 2.1.1 – most common play/pause shortcut. Correctly implemented.'],
  ['Media Player', 'K', 'K key had no effect on playback — manual test confirmed not implemented.', 'Play / Pause the video (YouTube-style alternative)', 'Missing', 'Medium', 'Common in modern streaming platforms (YouTube, Netflix). Low barrier to implement — add a keydown listener for "k" alongside the existing Spacebar handler.'],
  ['Media Player', 'Left / Right Arrow', 'Both Left and Right Arrow keys seek correctly — confirmed during manual test. Behaviour may vary slightly by content type.', 'Seek backward / forward in the video', 'Implemented', 'High', 'WCAG 2.1 SC 2.1.1 – standard seek behaviour. Correctly implemented.'],
  ['Media Player', 'J', 'J key had no effect — manual test confirmed not implemented.', 'Rewind 10 seconds', 'Missing', 'Medium', 'YouTube/widely adopted standard. Complements arrow key seeking. Add keydown listener for "j" to rewind 10s.'],
  ['Media Player', 'L', 'L key had no effect — manual test confirmed not implemented.', 'Fast-forward 10 seconds', 'Missing', 'Medium', 'YouTube/widely adopted standard. Add keydown listener for "l" to fast-forward 10s.'],
  ['Media Player', 'Up / Down Arrow', 'Up/Down Arrow keys change volume — confirmed during manual test.', 'Volume up / down when player is focused', 'Implemented', 'High', 'WCAG 2.1 SC 2.1.1 – volume control via keyboard correctly implemented.'],
  ['Media Player', 'M (Mute)', 'M key toggles mute/unmute — confirmed during manual test.', 'Mute / unmute audio', 'Implemented', 'High', 'WCAG 2.1 SC 2.1.1 – mute toggle via keyboard correctly implemented.'],
  ['Media Player', 'F (Full Screen)', 'F key enters fullscreen — confirmed during manual test.', 'Toggle full-screen mode', 'Implemented', 'Medium', 'Standard browser video shortcut. Correctly implemented.'],
  ['Media Player', 'T (Theater mode)', 'T key had no visible effect — manual test confirmed not implemented.', 'Toggle theater / mini mode', 'Missing', 'Low', 'YouTube standard. Nice-to-have for power users. Not a WCAG compliance issue.'],
  ['Media Player', 'C (Captions)', 'C key had no effect on captions — manual test confirmed not implemented.', 'Toggle Closed Captions on or off', 'Missing', 'High', 'WCAG 2.1 SC 1.2.2 – captions must be accessible. Keyboard users cannot toggle captions without a mouse. High priority — affects deaf and hard-of-hearing users. Add keydown listener for "c" to toggle the captions track.'],
  ['Media Player', '+ / - (Caption size)', '+/- had no effect on caption size — manual test confirmed not implemented.', 'Increase / decrease caption font size', 'Missing', 'Medium', 'WCAG 2.1 SC 1.4.4 – text must be resizable. Keyboard shortcut to adjust caption size improves readability for low-vision users.'],
  ['Media Player', 'V or D (Described Video)', 'V key had no visible effect — manual test confirmed not implemented.', 'Toggle audio description for visually impaired users', 'Missing', 'High', 'WCAG 2.1 SC 1.2.5 – audio description must be accessible via keyboard. Affects blind and low-vision users. Add keydown listener for "v" or "d" to toggle the described video audio track.'],
  ['Media Player', '0–9 (Number keys)', 'Number keys had no effect — manual test confirmed not implemented.', 'Jump to 0%–90% position in the video', 'Missing', 'Medium', 'YouTube/Netflix standard. Useful for power users and keyboard navigation. Add keydown listener for digit keys to seek to percentage position.'],
  ['Media Player', 'Shift+, / Shift+.', 'Shift+. had no effect on playback speed — manual test confirmed not implemented.', 'Decrease / increase playback speed', 'Missing', 'Medium', 'YouTube standard. Important for users who need slower playback (cognitive accessibility). Add keydown listeners for Shift+< and Shift+> to adjust video.playbackRate.'],
  ['Media Player', 'Shift+N / Shift+P', 'Shift+N did not advance to next video — manual test confirmed not implemented.', 'Next / previous video in playlist or queue', 'Missing', 'Medium', 'YouTube and Netflix standard. Useful for binge-watching keyboard users.'],
  ['Media Player', 'Esc (Escape)', 'Esc exits fullscreen — confirmed during manual test.', 'Exit fullscreen or close overlay', 'Implemented', 'Medium', 'WCAG 2.1 SC 2.1.1 – Esc correctly exits fullscreen mode.'],
  ['Media Player', 'Tab (player controls)', 'Tab cycles through all visible player controls. Note: "Episode List" panel is not included in the Tab order — keyboard users cannot reach it.', 'Move focus between player controls (play, volume, captions, full screen)', 'Implemented', 'Critical', 'WCAG 2.1 SC 2.1.1 – player controls are reachable via Tab. However, the "Episode List" panel is excluded from the Tab order, meaning keyboard users cannot browse or select episodes without a mouse. Recommend adding the Episode List panel to the focus order.'],

  // 8. CONTEXTUAL MENU
  ['Contextual Menu', 'Context Menu key or Shift+F10', 'Menu can be opened via keyboard simulation (Playwright ContextMenu key event) but NOT on a real MacBook — no physical Context Menu key exists and Fn+Shift+F10 does not trigger the menu. For Mac users (the primary audience) the menu is mouse right-click only.', 'Open contextual menu on the focused card (keyboard equivalent of right-click)', 'Missing', 'Critical', 'WCAG 2.1 SC 2.1.1 – the menu is effectively mouse-only for Mac users. Best fix: add a visible ⋯ button on each card (appears on hover/focus) as a real focusable button — same pattern used by Netflix, Disney+ and YouTube. This removes dependency on the Context Menu key entirely and works on all keyboards.'],
  ['Contextual Menu', 'Up / Down Arrow', 'Menu opens via keyboard simulation but arrow keys do NOT move focus between items (Record, Record series, Details). Focus stays on the same item regardless of arrow key presses.', 'Navigate between menu items once the contextual menu is open', 'Missing', 'High', 'ARIA menu pattern (WCAG 2.1 SC 2.1.1) – once a menu is open, Up/Down Arrow must move focus between items. Tab must NOT navigate inside a menu. Currently nothing moves focus inside the menu. Fix: add keydown listeners for ArrowDown/ArrowUp with roving tabindex on menu items.'],
  ['Contextual Menu', 'Enter / Return', 'Menu opens via keyboard simulation but Enter does NOT activate the focused menu item — the menu stays open and no action is triggered.', 'Activate the focused menu item', 'Missing', 'High', 'WCAG 2.1 SC 2.1.1 – Enter must activate the focused item (e.g. start a recording). After activation, focus must return to the card that opened the menu. Currently Enter has no effect inside the menu.'],
  ['Contextual Menu', 'Esc (Escape)', 'Menu opens via keyboard simulation but Esc does NOT close it — the menu stays open and keyboard users cannot dismiss it without clicking elsewhere with a mouse.', 'Close the contextual menu and return focus to the card that triggered it', 'Missing', 'High', 'WCAG 2.1 SC 2.1.2 (No Keyboard Trap) – Esc must close the menu and return focus to the card that triggered it. Without this, an open menu is a keyboard trap. Fix: add a keydown listener for Escape on the menu container.'],
  ['Contextual Menu', 'Tab (inside menu)', 'Tab does NOT close the menu or move focus outside it — focus stays trapped inside the menu, violating the ARIA menu pattern.', 'Tab should NOT move between menu items – only arrow keys should', 'Missing', 'High', 'ARIA menu pattern – Tab inside an open menu should close it and move focus to the next element outside. Currently Tab is trapped inside. Combined with Esc not working, the menu is a full keyboard trap once opened.'],

  // 9. MODALS & OVERLAYS
  ['Modals & Overlays', 'Esc (Escape)', 'Esc does NOT close the modal — tested on the delete confirmation modal (Recordings) and the More info popup (Content Detail). Keyboard users must use the mouse to dismiss modals.', 'Close modal/dialog and return focus to trigger element', 'Missing', 'High', 'WCAG 2.1 SC 2.1.2 (No Keyboard Trap) – Esc must close any modal/dialog and return focus to the element that triggered it. Fix: add a keydown listener for Escape on all modal containers that closes the dialog and restores focus to the trigger element.'],
  ['Modals & Overlays', 'Tab / Shift+Tab (focus trap)', 'No focus trap — Tab escapes the modal to background page content. Tested on the delete confirmation modal (Recordings). Also, focus does not move into the modal on open; users must press Tab twice to reach the first button.', 'Focus must be trapped inside modal while it is open', 'Missing', 'Critical', 'ARIA dialog pattern (WCAG 2.1 SC 2.1.2) – two failures: (1) Focus does not move into the modal on open — it must move to the first focusable element inside. (2) Tab escapes to background content — focus must be trapped inside the modal while it is open. Fix: on modal open, call focus() on the first interactive element inside; intercept Tab/Shift+Tab to cycle only within the modal.'],
  ['Modals & Overlays', 'Enter / Return', 'Enter activates buttons inside the modal (e.g. Confirm/Cancel on delete confirmation in Recordings) once focus is manually tabbed to them.', 'Activate buttons within modal (Confirm, Cancel, etc.)', 'Implemented', 'High', 'WCAG 2.1 SC 2.1.1 – Enter correctly activates modal buttons once focused. Standard button activation is working inside modals.'],

  // 10. ACCOUNT & SETTINGS
  ['Account & Settings', 'Tab / Shift+Tab', 'Settings controls are not reachable via Tab — keyboard users cannot navigate to language, captions, or described video preferences.', 'Navigate between all settings controls and form fields', 'Missing', 'Critical', 'WCAG 2.1 SC 2.1.1 – all interactive elements must be keyboard accessible. Settings controls (language selector, CC toggle, described video toggle) are unreachable via Tab. This means keyboard-only users cannot change any of their preferences. Fix: ensure all settings form controls have tabindex="0" and are in the natural DOM focus order.'],
  ['Account & Settings', 'Enter / Return', 'Enter did not activate focused settings controls — buttons appear focused but do not respond to Enter.', 'Activate buttons and save changes', 'Missing', 'High', 'WCAG 2.1 SC 2.1.1 – focused buttons must be activatable via Enter. Currently Enter has no effect on settings controls. Fix: ensure buttons use native <button> elements or have role="button" with keydown listeners for Enter/Space.'],
  ['Account & Settings', 'Arrow keys', 'Arrow keys correctly navigate between radio button options (e.g. Language selector) — confirmed working.', 'Navigate radio buttons and select/dropdown options', 'Implemented', 'Medium', 'ARIA radio group pattern — arrow key navigation between radio options is correctly implemented.'],
  ['Account & Settings', 'Spacebar', 'Spacebar correctly toggles checkboxes (CC, Described Video settings) — confirmed working.', 'Toggle checkboxes (e.g. CC, Described Video preferences)', 'Implemented', 'High', 'WCAG 2.1 SC 2.1.1 – Spacebar toggles checkbox controls correctly. Standard behaviour is working for checkboxes.'],

  // 11. TOOLTIP / TUTORIAL OVERLAY
  ['Tooltip / Tutorial Overlay', 'Esc (Escape)', 'Esc did not dismiss the tooltip/tutorial overlay — keyboard users cannot close it with Escape.', 'Dismiss tooltip or tutorial overlay with Escape key', 'Missing', 'High', 'WCAG 2.1 SC 2.1.2 (No Keyboard Trap) – Esc must dismiss any overlay that appears on screen. The tutorial overlay can be progressed via Tab+Enter (Next/Done buttons work), but Esc is a standard and expected dismissal method. Add a keydown listener for Escape on the overlay container that closes it and returns focus to the trigger element.'],
  ['Tooltip / Tutorial Overlay', 'Tab (reach buttons)', 'Tab correctly reaches Next and Done buttons inside the tutorial overlay — confirmed working.', 'Tab must be able to reach Next / Done / Close buttons inside the overlay', 'Implemented', 'Critical', 'WCAG 2.1 SC 2.1.1 – Tab correctly reaches interactive buttons inside the overlay. No keyboard trap for Tab navigation.'],
  ['Tooltip / Tutorial Overlay', 'Enter (activate button)', 'Enter activates the Next/Done button inside the tutorial overlay — confirmed working.', 'Enter activates the focused Next / Done button to progress or close the overlay', 'Implemented', 'High', 'WCAG 2.1 SC 2.1.1 – Enter correctly activates the focused button. Standard button activation is working.'],
];

// ── Colour palette ────────────────────────────────────────────────────────────
const COLORS = {
  // Header
  headerBg:   '1A1A2E',
  headerFont: 'FFFFFF',

  // Category stripe (alternating per category group)
  catBgA:     'E8EAF6',
  catBgB:     'F3F4F6',

  // Status
  implemented: { bg: 'C6EFCE', font: '276221' },
  missing:     { bg: 'FFC7CE', font: '9C0006' },
  partial:     { bg: 'FFEB9C', font: '9C6500' },
  toBeAudited: { bg: 'F2F2F2', font: '595959' },

  // Impact
  critical:   { bg: 'FF0000', font: 'FFFFFF' },
  high:       { bg: 'FF6B35', font: 'FFFFFF' },
  medium:     { bg: 'FFD166', font: '333333' },
  low:        { bg: 'A8D8A8', font: '1A5E1A' },

  // Title row
  titleBg:    '4B0082',
  titleFont:  'FFFFFF',

  border:     'CCCCCC',
};

function statusStyle(status) {
  if (status === 'Implemented')   return COLORS.implemented;
  if (status === 'Missing')       return COLORS.missing;
  if (status === 'Partial')       return COLORS.partial;
  return COLORS.toBeAudited;
}

function impactStyle(impact) {
  if (impact === 'Critical') return COLORS.critical;
  if (impact === 'High')     return COLORS.high;
  if (impact === 'Medium')   return COLORS.medium;
  return COLORS.low;
}

function applyBorder(cell) {
  cell.border = {
    top:    { style: 'thin', color: { argb: 'FF' + COLORS.border } },
    left:   { style: 'thin', color: { argb: 'FF' + COLORS.border } },
    bottom: { style: 'thin', color: { argb: 'FF' + COLORS.border } },
    right:  { style: 'thin', color: { argb: 'FF' + COLORS.border } },
  };
}

// ── Build workbook ────────────────────────────────────────────────────────────
const wb = new ExcelJS.Workbook();
wb.creator = 'TELUS A11y Audit';
wb.created = new Date();

// ════════════════════════════════════════════════════════════════════════════
// Sheet 1 — Keyboard Shortcut Audit
// ════════════════════════════════════════════════════════════════════════════
const ws = wb.addWorksheet('Keyboard Shortcut Audit', {
  views: [{ state: 'frozen', ySplit: 2 }],
});

// Column widths
ws.columns = [
  { key: 'category',   width: 26 },
  { key: 'shortcut',   width: 30 },
  { key: 'current',    width: 45 },
  { key: 'standard',   width: 38 },
  { key: 'status',     width: 16 },
  { key: 'impact',     width: 14 },
  { key: 'notes',      width: 60 },
  { key: 'lasttested', width: 14 },
];

// ── Row 1: Title ──────────────────────────────────────────────────────────────
const titleRow = ws.addRow(['TELUS TV+ Keyboard Accessibility Audit', '', '', '', '', '', '', '']);
ws.mergeCells('A1:H1');
const titleCell = ws.getCell('A1');
titleCell.font    = { bold: true, size: 14, color: { argb: 'FF' + COLORS.titleFont }, name: 'Arial' };
titleCell.fill    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
titleRow.height   = 32;

// ── Row 2: Column headers ─────────────────────────────────────────────────────
const headers = ['Category', 'Shortcut / Key', 'TTV+ Current Behavior', 'Industry Standard', 'Status', 'Impact', 'Notes & Recommendations', 'Last Tested'];
const headerRow = ws.addRow(headers);
headerRow.height = 24;
headerRow.eachCell(cell => {
  cell.font      = { bold: true, color: { argb: 'FF' + COLORS.headerFont }, name: 'Arial', size: 10 };
  cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.headerBg } };
  cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  applyBorder(cell);
});

// ── Data rows ─────────────────────────────────────────────────────────────────
const categories = [...new Set(rows.map(r => r[0]))];
const catIndex = Object.fromEntries(categories.map((c, i) => [c, i]));

for (const row of rows) {
  const [category, shortcut, current, standard, status, impact, notes] = row;
  const dataRow = ws.addRow([category, shortcut, current, standard, status, impact, notes]);
  dataRow.height = 42;

  // Base row background (alternating per category)
  const rowBg = catIndex[category] % 2 === 0 ? COLORS.catBgA : COLORS.catBgB;

  dataRow.eachCell((cell, colNumber) => {
    cell.font      = { name: 'Arial', size: 9 };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + rowBg } };
    applyBorder(cell);

    // Status column (5)
    if (colNumber === 5) {
      const s = statusStyle(status);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + s.bg } };
      cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF' + s.font } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    }

    // Impact column (6)
    if (colNumber === 6) {
      const s = impactStyle(impact);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + s.bg } };
      cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF' + s.font } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    }

    // Category column (1) — bold
    if (colNumber === 1) {
      cell.font = { name: 'Arial', size: 9, bold: true };
    }
  });
}

// ════════════════════════════════════════════════════════════════════════════
// Sheet 2 — Summary
// ════════════════════════════════════════════════════════════════════════════
const ws2 = wb.addWorksheet('Summary');

ws2.columns = [
  { width: 28 },
  { width: 14 },
  { width: 14 },
  { width: 14 },
  { width: 16 },
];

// ── Status counts ─────────────────────────────────────────────────────────────
const statusCounts = { Implemented: 0, Missing: 0, Partial: 0, 'To Be Audited': 0 };
const categoryCounts = {};
const highPriority = [];

for (const row of rows) {
  const [category, shortcut, , , status, impact, notes] = row;
  statusCounts[status] = (statusCounts[status] ?? 0) + 1;
  if (!categoryCounts[category]) categoryCounts[category] = { Implemented: 0, Missing: 0, Partial: 0, 'To Be Audited': 0 };
  categoryCounts[category][status] = (categoryCounts[category][status] ?? 0) + 1;
  if ((impact === 'High' || impact === 'Critical') && status !== 'Implemented') {
    highPriority.push([shortcut, category, impact, notes]);
  }
}

const total = rows.length;

function addSummaryHeader(sheet, text, cols = 3) {
  const row = sheet.addRow([text]);
  sheet.mergeCells(`A${row.number}:${String.fromCharCode(64 + cols)}${row.number}`);
  const cell = sheet.getCell(`A${row.number}`);
  cell.font  = { bold: true, size: 11, color: { argb: 'FFFFFFFF' }, name: 'Arial' };
  cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.headerBg } };
  cell.alignment = { horizontal: 'left', vertical: 'middle' };
  row.height = 22;
  return row;
}

function addSummarySubHeader(sheet, cells) {
  const row = sheet.addRow(cells);
  row.eachCell(cell => {
    cell.font  = { bold: true, size: 10, name: 'Arial' };
    cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    applyBorder(cell);
  });
  row.height = 18;
  return row;
}

// Title
const summaryTitle = ws2.addRow(['TELUS TV+ Keyboard Accessibility Audit — Summary']);
ws2.mergeCells(`A1:E1`);
const stCell = ws2.getCell('A1');
stCell.font  = { bold: true, size: 14, color: { argb: 'FF' + COLORS.titleFont }, name: 'Arial' };
stCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + COLORS.titleBg } };
stCell.alignment = { horizontal: 'center', vertical: 'middle' };
summaryTitle.height = 32;

ws2.addRow([]);

// Overall status
addSummaryHeader(ws2, 'Overall Status', 3);
addSummarySubHeader(ws2, ['Status', 'Count', '% of Total']);

const statusColors = {
  'Implemented':   COLORS.implemented,
  'Missing':       COLORS.missing,
  'Partial':       COLORS.partial,
  'To Be Audited': COLORS.toBeAudited,
};

for (const [status, count] of Object.entries(statusCounts)) {
  const r = ws2.addRow([status, count, `${Math.round((count / total) * 100)}%`]);
  r.height = 18;
  const sc = statusColors[status];
  r.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + sc.bg } };
    cell.font = { name: 'Arial', size: 10, color: { argb: 'FF' + sc.font } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    applyBorder(cell);
  });
  r.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
}

// Total row
const totalRow = ws2.addRow(['Total', total, '100%']);
totalRow.height = 18;
totalRow.eachCell(cell => {
  cell.font = { bold: true, name: 'Arial', size: 10 };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  applyBorder(cell);
});
totalRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };

ws2.addRow([]);

// Status by category
addSummaryHeader(ws2, 'Status by Category', 5);
addSummarySubHeader(ws2, ['Category', 'Implemented', 'Missing', 'Partial', 'To Be Audited']);

for (const [cat, counts] of Object.entries(categoryCounts)) {
  const r = ws2.addRow([cat, counts.Implemented || 0, counts.Missing || 0, counts.Partial || 0, counts['To Be Audited'] || 0]);
  r.height = 18;
  r.eachCell((cell, col) => {
    cell.font = { name: 'Arial', size: 10 };
    cell.alignment = { horizontal: col === 1 ? 'left' : 'center', vertical: 'middle' };
    applyBorder(cell);
  });
  r.getCell(1).font = { name: 'Arial', size: 10, bold: true };
}

ws2.addRow([]);

// High priority gaps
addSummaryHeader(ws2, 'High-Priority Gaps (Impact: High or Critical, Status: not Implemented)', 4);
addSummarySubHeader(ws2, ['Shortcut', 'Category', 'Impact', 'Notes']);

for (const [shortcut, category, impact, notes] of highPriority) {
  const r = ws2.addRow([shortcut, category, impact, notes]);
  r.height = 36;
  const imp = impactStyle(impact);
  r.eachCell((cell, col) => {
    cell.font = { name: 'Arial', size: 9 };
    cell.alignment = { vertical: 'middle', wrapText: true };
    applyBorder(cell);
    if (col === 3) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + imp.bg } };
      cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF' + imp.font } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    }
  });
}

// ── Save ──────────────────────────────────────────────────────────────────────
await wb.xlsx.writeFile('TTV_Keyboard_Accessibility_Audit.xlsx');
console.log(`✅ Spreadsheet updated — ${rows.length} items across ${categories.length} categories.`);
