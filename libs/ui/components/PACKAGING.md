# Consuming @robertruben98/onyx-ui

Private package on GitHub Packages. In the consuming project add an `.npmrc`:

    @robertruben98:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}

(`NODE_AUTH_TOKEN` = a GitHub PAT with `read:packages`.) Then:

    npm install @robertruben98/onyx-ui

Load the global styles **in this order** — `styles/tokens.css` MUST be imported BEFORE any `styles/themes/*.css`:

    "node_modules/@robertruben98/onyx-ui/styles/tokens.css",
    "node_modules/@robertruben98/onyx-ui/styles/themes/dark.css"

`tokens.css` defines all `--ui-*` custom properties that theme files override. Loading a theme before tokens results in undefined variables.

## Theme activation classes

Apply theme activation classes on `document.documentElement` (the `<html>` element):

| Class                | Purpose                                                | Example                                                          |
| -------------------- | ------------------------------------------------------ | ---------------------------------------------------------------- |
| `.onyx-dark`         | Dark mode (re-maps semantic tokens to dark palette)    | `document.documentElement.classList.toggle('onyx-dark', isDark)` |
| `.onyx-theme-<name>` | Brand preset (re-maps semantic tokens to client brand) | `document.documentElement.classList.add('onyx-theme-acme')`      |

Both classes are independent and composable — dark mode and a brand preset can be active simultaneously.

Import components from `@robertruben98/onyx-ui`. Requires Angular 19 (peer dependency).
