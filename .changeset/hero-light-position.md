---
'@chassis-ui/docs': patch
---

The light of the `Hero` stays behind the illustration at every width: from `lg` its centre follows the right half of the container, up to the width of the container, and 32rem below the top of the hero whether a rail follows or not; below `lg` it is in the middle. The script that leans the light towards the pointer reads that centre from the styles (`.cxd-hero-light-centre`) instead of fixed numbers. The light of `Steps` is placed by the share of the panel, so it stays behind its rails on phones too.
