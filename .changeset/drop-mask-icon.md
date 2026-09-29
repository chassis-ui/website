---
'@chassis-ui/docs': patch
---

The head no longer links `safari-pinned-tab.svg` as a `mask-icon`. The docs build of chassis-assets has no such file, so every page asked for one that returned 404. Safari has used the regular favicon for pinned tabs since version 12.
