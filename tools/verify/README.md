# tools/verify — render-verification harness (lane V, card W3-3)

Drives the **built** `apps/docs` site (`dist/docs`) in headless Chrome through the real
`ThemeService` path (localStorage → class on `<html>`), then measures — with transitions
disabled — every `--ui-*` custom property on each component host, the painted colour /
border / radius of every element in the live demos (overlays opened), the WCAG ratio of
every text node, and screenshots each page. Optionally repeats with the theme classes moved
to `<body>` to emulate a consumer scoping a theme to a subtree.

```bash
npm run build:tokens && npx ng build docs --configuration production
PLAYWRIGHT_NODE_MODULES=<dir with playwright installed>/node_modules \
  node tools/verify/render-matrix.mjs <label> dist/docs <outDir> [html,body] [ids] [outName] [shotsAll]
python3 tools/verify/analyze-matrix.py <outDir> <label> [label2 ...]
```

Output: `<outDir>/<label>/matrix.json` + `<outDir>/<label>/shots/<theme>/<id>.png`.
Uses system Chrome (`channel: 'chrome'`); no project dependency is added.
