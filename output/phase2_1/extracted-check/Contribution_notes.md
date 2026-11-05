# Inventory and recipe integration contribution

- Connected Recipes to the existing Kitchen inventory reader.
- Corrected expiration checks to use the Kitchen data field.
- Added explicit ingredient aliases for the demo data, including Large eggs/Eggs and Fresh spinach/Spinach.
- Excluded expired and zero-quantity food from recipe availability.
- Refreshed recipe cards and open details after inventory changes and when revisiting Recipes.
- Added an unfinished-state message and return action to Preferences.
- Checked the existing and new flows with offline browser automation and captured screenshots.
- Prepared startup/task documentation, a design rationale, and the offline package.

These changes extend existing team work. Existing Kitchen, Shopping, saved-list, transfer, and recipe code should retain their actual contributors' credit. This implementation and document draft were prepared with Codex assistance; the team must supply its agreed individual contribution report.
