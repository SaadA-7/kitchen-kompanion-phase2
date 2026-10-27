# Inventory Editing Implementation Plan

**Goal:** Let a household member correct an existing food item and demonstrate a moderate checkpoint task.

**Architecture:** Reuse the existing food modal in add/edit modes. Preserve item IDs when saving edits and persist through the existing localStorage functions. Keep all three teammate tab placeholders intact.

**Tech Stack:** Plain HTML, CSS, JavaScript; no application dependencies or network calls.

## Design

Each inventory card gets an explicitly labeled Edit button. Editing preloads the existing name, quantity, unit, storage location, ownership, and expiration. Save updates that item; Cancel, close, and Escape discard changes. The dialog restores focus on close and announces a successful save. Blank names and invalid quantities/expiration cannot be saved. User-entered text renders literally. Editing is a moderate task, not a claimed deep task.

## Tasks

- [x] Add a browser regression check for editing, persistence, cancel, validation, literal text, filtering, and the existing add/quantity/owner controls; confirm editing fails before implementation.
- [x] Update index.html, app.js, and styles.css to reuse the existing form and persist edits without creating a duplicate.
- [x] Run the browser check offline at 640x960, inspect screenshots, and review the diff.
- [x] Save a concise checkpoint contribution draft and screenshots documenting only tested behavior. Credit AI assistance and leave contributor name for the user to fill in.

## Review Focus

Cancel must not mutate storage. Editing under active filters must refresh results. Existing item IDs and unrelated records must survive. Literal HTML-like names must remain text. Reopening Add must clear edit state. The bottom navigation must remain visible at the specified device size.
