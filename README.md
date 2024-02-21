# 👁️ Iconish

A web app that aligns and minifies SVG icons for the web.

Exporting icons as SVG from tools like Figma can be hit or miss. The code is messy, and colors may not match.

With Iconish, you can quickly tidy and sync your icon sets. Align colors, refine paths, and shrink code size for the best possible finish.

:point_right: Take a look at [Iconish](https://iconish.vercel.app/) :point_left:

## Performance

⚡ **Iconish is built with performance in mind and has been tested with icon sets containing hundreds of icons without lag.**

This is pretty crazy feat when you consider that each icon runs through a number of custom path transformations and then optimized and minified with [SVGO](https://github.com/svg/svgo), not to mention each SVG has its own code editor!

I’ve used [Million.js](https://million.dev/) to render the UI and [Zustand](https://github.com/pmndrs/zustand) to avoid state issues within React. A virtual list was added to help keep the UI butter-smooth when scrolling. On top of this, I’ve used a caching strategy to only re-render the list of SVGs when a hash is updated.

There’s still more caching to add but I’m happy with the performance wins so far.

## Tech used

- [Next.js](https://nextjs.org/) - Framework
- [Million.js](https://million.dev/) - Faster React
- [TailwindCSS](https://tailwindcss.com/) - Styling framework
- [Radix UI](https://www.radix-ui.com/) - Component library
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [SVGO](https://github.com/svg/svgo) - SVG optimizer
- [Virtuoso](https://virtuoso.dev/) - Virtual list
- [CodeMirror](https://codemirror.net/) - Code editor

Note that is beta software so there will be bugs - feel free to [post issues](https://github.com/ben-rogerson/iconish/issues/new) as they’re found.
