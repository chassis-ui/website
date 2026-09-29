---
'@chassis-ui/docs': patch
---

Google Analytics loads only after the visitor accepts. When `analytics.googleId` is set, production builds show a consent banner at the bottom of the page, and nothing is sent to Google and no cookie is set before the visitor accepts. The choice is kept in `localStorage`, so the sites served from one host share it. The footer has a "Cookie settings" button that opens the banner again, and a "Privacy" link to `/privacy/`. Declining stops Google Analytics and deletes its cookies.
