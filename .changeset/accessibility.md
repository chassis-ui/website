---
'@chassis-ui/docs': patch
---

A code block can take focus, so that a keyboard can scroll one that is wider than the page. The Google Fonts stylesheet is linked from the head instead of imported by the styles, so the browser requests it with the page, not after the stylesheet that imported it.
