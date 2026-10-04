---
'@chassis-ui/docs': patch
---

Five fixes of the search dialog. The page scrolls again after a search result on the current page is opened: the dialog closed without removing the scroll lock of the body. The input has the focus when the dialog is opened with the button, so typing works at once. The keyboard shortcuts open the dialog as the button does: the page behind it no longer scrolls, and a click outside closes it. A click or Enter on a loading placeholder no longer closes the dialog and saves an empty visit. Escape closes the dialog in Safari when the focus is in the empty input.
