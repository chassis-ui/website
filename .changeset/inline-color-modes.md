---
'@chassis-ui/docs': patch
---

The color mode script is inline in the head and runs before the first paint. It was a module, which runs after the document is parsed, so a page in dark mode showed light first.
