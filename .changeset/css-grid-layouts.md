---
'@chassis-ui/docs': minor
---

**Breaking.** The package needs `@chassis-ui/css` 0.6.0 or later: the peer range is `>=0.6.0`, it was `^0.5.0-0`. The layouts use the CSS grid of css 0.6, `.grid` with `col-span-*`, in place of the flexbox grid, `.row` with `.col-*`, which css 0.6 deprecates and css 0.7 removes. The header of `SingleLayout`, the sections list of `DocsLayout`, the footer and the lists of the header are grids. `NavLink` no longer sets a width: the lists of the header are two columns below `lg` by themselves. The loading rows of the search use the fraction widths, `w-4/12`. `.cxd-gutter` sets `--cx-container-padding` in place of `--cx-gutter-x`, with the same page margin of 1rem. The pages look as before, except that the footer columns are separated by the gutter of the breakpoint and move by a few pixels. See [UPGRADING.md](https://github.com/chassis-ui/website/blob/main/packages/docs/UPGRADING.md#from-06-to-07) for the classes to replace in a site's own pages.
