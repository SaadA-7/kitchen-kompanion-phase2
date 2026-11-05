# Phase 2.1 completion plan

Update: The added keyboard placeholders, reserved space, and special form layouts were subsequently reverted at the user's request. The original Shopping keyboard stand-in is preserved. PDFs, screenshots, and ZIP are refreshed to match.

Requested scope: connect Kitchen and Recipes, show keyboard placement for inventory editing, verify the implemented tasks, prepare the two required PDFs, and package a standalone offline ZIP. Work directly in this repository; preserve existing teammate features.

1. Add a failing offline Chrome check for ingredient aliases, expiration, refresh after edits, and keyboard layout.
2. Read real inventory data in Recipes, use explicit aliases, exclude expired/zero-quantity food, and refresh when inventory changes. Show an unfinished-state Preferences screen with a return action.
3. Reserve a keyboard area under a scrollable inventory dialog; show the same placement on recipe text entry. Keep actions reachable.
4. Test the inventory, recipe authoring/search, shopping, saved-list reuse, and purchase-transfer paths. Capture screenshots at 640x960. Fix observed regressions.
5. Produce a task/startup PDF and a design rationale PDF with separate horizontal/vertical text sections and screenshot appendices. Distinguish implemented behavior, rationale, limitations, and unverified course-specific requirements. Do not invent team roles or historical feedback.
6. Package runtime files, icons, starting instructions, and both PDFs. Extract the ZIP and test that copy offline in Chrome. Record the actual host/browser; do not claim a clean Windows 10 test.

Task classifications are the team's proposed classifications, subject to instructor assessment. Two deep candidates are authoring/revising a full recipe and reviewing/transferring multiple grocery purchases. The five moderate candidates are adding food, editing food, searching recipes, adding shopping items, and saving/reusing a named list. Three shallow tasks are location filtering, sorting, and purchase checkmarks.
