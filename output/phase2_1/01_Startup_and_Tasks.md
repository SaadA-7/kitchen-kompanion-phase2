# Kitchen Kompanion startup and tasks

Kitchen Kompanion is an offline medium-fidelity household food prototype. This guide explains how to run the submitted files and gives ten concrete tasks that a reviewer can attempt. Task depth is proposed for assessment: two deep, five moderate, and three shallow tasks span Kitchen, Shopping, and Recipes.

Extract the entire ZIP into one folder. Open the prototype folder and double-click index.html in desktop Chrome. Keep styles.css, all JavaScript files, and the icons folder beside index.html. No server, npm commands, account, installation, or Internet connection is needed to run the app.

The current interface is designed at 640 by 960 CSS pixels. In Chrome DevTools, turn on the device toolbar, choose Responsive, enter width 640 and height 960, and use a comfortable preview zoom. This describes the implemented size; the separate course device-specifications document should still be checked by the team.

Use a dedicated fresh Chrome profile for the initial demonstration. A fresh run contains nine Kitchen items, seven Shopping items, and six recipes. Whole wheat bread and Large eggs start checked as purchased. Changes persist in the browser profile, so opening another ordinary tab does not reset the scenario.

To repeat all scenarios, clear this prototype file's local storage in a dedicated test profile and reload. Relevant keys are kk_inventory, kk_shopping, kk_purchase_reviews, kk_purchase_transfer, kk_saved_lists, and kitchen-recipes. Do this only between completed task attempts. The visible Reset Demo Data button restores Kitchen inventory only; it does not reset Shopping, saved lists, or recipes.

Start on My Kitchen. Use the bottom bar to move between Kitchen, Shopping, and Recipes. Preferences contains an explicit unfinished-state message and a Back to Kitchen action. Preferences is not counted as an implemented feature or task.

Typing uses the desktop keyboard. Inventory editing and recipe authoring use their original form layouts. Shopping retains its existing noninteractive keyboard stand-in. The initial task scenarios use the sample data. Run the purchase-transfer task before changing the two initially checked purchases.

Verification for this build used offline desktop Chrome at 640 by 960 on the available Windows host. It was not a clean Windows 10 installation test or a user study. The separate course task-scenarios document was not supplied for this preparation, so coverage of those additional scenarios remains for the team to confirm.

# Deep task candidates

 - D1 - Review and put away two grocery purchases. Goal: record accurate storage details before groceries enter Kitchen. Starting from the fresh sample Shopping list, select Finish shopping (2). Review Whole wheat bread: keep 1 loaf, choose Pantry, and enter a date seven days from the day of testing. Save the review. Review Large eggs: keep 12 count, choose Fridge, use the same date, and save. Choose Review transfer, inspect the two batches, then Confirm transfer (2). Select View Kitchen.

D1 success: Kitchen contains two additional food batches, including their storage locations and expiration dates. The original inventory batches remain. The two purchased Shopping entries are removed, and the other five unpurchased entries remain. Reloading must not transfer the groceries again. This is a proposed deep task because it involves repeated data entry, a review overview, individual forms, a final confirmation, and changes across Shopping and Kitchen.

 - D2 - Author and revise a complete household recipe. Goal: keep a reusable recipe based on food in Kitchen. Open Recipes and choose + Add Recipe. Name it Spinach and cheese eggs; enter 12 minutes, 2 servings, and the description A quick meal using food already in the kitchen. Enter Eggs, Spinach, and Cheese on separate ingredient lines. Enter these instruction lines: Whisk eggs. / Cook spinach in a nonstick pan. / Add eggs and cheese; cook until set. Save Recipe.

D2 continued: select Can Make, open the new recipe, and check the ingredients and instructions in its detail view. Choose Edit Recipe, append Serve immediately. as a fourth instruction line, and save. Reopen the recipe and reload to confirm that the revision persists.

D2 success: the saved recipe has the entered description, cooking time, serving count, three ingredient names, and four instruction steps after revision. Can Make includes it because the demo Kitchen contains Large eggs, Fresh spinach, and Cheddar cheese. This is proposed as deep because the task requires detailed structured authoring, inspection on a separate detail screen, and a revision round. The instructor may classify its depth differently.

Depth boundaries: opening a tab is not a task by itself. Save and Cancel are alternate outcomes of a task, not separate tasks. Different foods entered into the same form do not create additional distinct tasks. Recipe availability checks the presence of positive, unexpired food quantities; it does not calculate whether there is enough food for a serving count.

# Moderate tasks

 - M1 - Add a food item. In Kitchen choose + Add food. Enter Whole milk, quantity 1, unit count, Fridge, Shared, and 7 days until expiration. Save to Kitchen. Success: one additional food card shows those details and remains after reload. This task creates a new inventory record through several fields.

 - M2 - Correct an existing food record. In Kitchen choose Edit on Fresh spinach. Set quantity to 3 cups, location to Freezer, ownership to Alex's, and expiration to 30 days. Save changes. Success: the same item is updated without increasing the item count, and the expiration sort moves it below sooner-expiring foods. Reopen, change a value, and Cancel to verify that unsaved changes do not replace the saved record.

 - M3 - Find and inspect a recipe using an ingredient. In Recipes select All Recipes and search for spinach. Open Spinach Omelette and compare its ingredient availability with Kitchen. With the original sample inventory, Eggs, Spinach, and Cheese are available and Butter is missing. Success: the result responds to entered search text and its detail view explains the missing ingredient. If M2 was completed, spinach is still available but is no longer expiring soon.

 - M4 - Add an item to buy with a useful note. In Shopping choose + Add item. Enter Butter, quantity 1, unit pack, and the note Unsalted. Save. Success: Butter appears unchecked on the active shopping list with its quantity and note, and remains after reload. Purchase checkmarks do not automatically move food to Kitchen.

 - M5 - Save and selectively reuse a routine list. After M4, open Saved lists and choose Save current list. Name the snapshot Weekly groceries and save it. Return to Shopping, open Butter, and Remove it. Reopen Saved lists and Preview Weekly groceries. Inspect the selection: existing active-list items are disabled, while Butter is available. Choose Add selected (1). Success: one unchecked Butter entry returns with its note, without duplicating existing active-list entries.

Use realistic data rather than repeating the same task with different ingredient names. These five moderate task candidates, together with D1 and D2, form seven moderate-or-better candidates across three feature sets. Completion and design quality matter in addition to the proposed count.

# Shallow tasks and evaluation notes

 - S1 - View food stored in one location. In Kitchen choose Fridge. Success: only Fridge items are displayed and the inventory count reflects the current results. Choose All to restore the full view. With a fresh sample, Fridge contains four items. The result can differ after editing or purchase transfer.

 - S2 - Sort the inventory. In Kitchen choose Sort: Name (A-Z). Success: with the original sample inventory, Bananas appears first. Return to Sort: Expiration (Soonest) to see Fresh spinach first. Sorting by different fields is one task, not several tasks.

 - S3 - Mark a shopping item purchased. In Shopping check Milk. Success: its row gains the purchased appearance, the purchased count increases by one, and Finish shopping reflects the new count. Uncheck it to undo the purchase mark. Checking and unchecking are one task; neither action alone transfers groceries to Kitchen.

Other supported behaviors include editing/removing Shopping entries, Undo removal, searching Kitchen, changing ownership badges, adjusting inventory quantities, deleting recipes after confirmation, and the Use Expiring recipe filter. These are not added to the ten-task count to avoid overstating coverage.

When evaluating the prototype, record the browser state and starting data along with each task result. Saved state and previous tasks affect counts and recommendations. If a task fails, record the input and the screen where it failed rather than replacing it with a screenshot of a different scenario.
