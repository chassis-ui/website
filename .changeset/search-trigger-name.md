---
'@chassis-ui/docs': patch
---

The search trigger of the header takes its accessible name from its label, "Search docs…" by default, instead of an `aria-label` that left out the shortcut hint the trigger shows, ⌘K or Ctrl K. axe-core 4.14 reports that as `label-content-name-mismatch`. The hint is `aria-hidden`, and `aria-keyshortcuts` still announces the shortcut. Below the `lg` breakpoint the label is visually hidden instead of `display: none`, so the icon-only trigger keeps its name. Nothing changes on screen.
