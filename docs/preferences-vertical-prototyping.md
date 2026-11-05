# Vertical prototyping in the Preferences tab

## Current implementation

The Preferences tab currently contains a heading, a message explaining that preferences are not implemented, and a Back to Kitchen button. This establishes where preferences belong in the overall navigation and gives users a way to leave the unfinished screen. It demonstrates the horizontal structure of the app, but it does not yet implement a vertical preferences task: users cannot enter, review, or save a setting.

## Proposed vertical task

A vertical prototype would develop one preferences task from beginning to end. For example, a household member could configure an expiration reminder by opening Preferences, selecting a reminder category, entering how many days before expiration they want a reminder, reviewing an example reminder, and saving the setting. Returning to Preferences would show the saved selection. This is a proposed task, not existing functionality.

The prototype could show a sample reminder inside Preferences rather than send an actual device notification. That would let a reviewer assess whether the setting labels, input controls, review screen, and confirmation communicate the result. It would not establish that reminders appear in the other tabs or that a notification service is implemented.

## Design rationale and evaluation

The task should show the current value before editing so that users can recognize their existing choice. Review and Save would give users a chance to catch a mistake before committing. Cancel should preserve the previous setting, invalid input should receive a specific explanation, and a confirmation should make the saved result visible. Reopening the setting would test whether the prototype preserves the choice across navigation and reloads.

Evaluation should follow one complete scenario, such as changing the reminder lead time from three days to two days, inspecting the sample reminder, saving, and returning to confirm the value. The task's depth should be classified from the interactions actually implemented. A single toggle is shallow; a form with data entry may be moderate; a deeper classification requires a more involved task spanning multiple views. The current placeholder should not be counted as a moderate or deep task.

## Short version for the report

The Preferences tab currently represents the horizontal structure of the application by providing a dedicated place for settings and a clear return action. It does not yet support a complete vertical task. A proposed vertical extension is configuring an expiration reminder through input, review, save, and confirmation. This would allow us to evaluate whether users understand the settings and their consequences. The reminder flow remains proposed and is not counted among the prototype's implemented tasks.
