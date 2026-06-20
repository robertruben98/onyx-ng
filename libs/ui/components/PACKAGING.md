# Consuming @robertruben98/onyx-ui

Private package on GitHub Packages. In the consuming project add an `.npmrc`:

    @robertruben98:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}

(`NODE_AUTH_TOKEN` = a GitHub PAT with `read:packages`.) Then:

    npm install @robertruben98/onyx-ui

Load the global styles **in this order** (tokens first, then an optional theme):

    "node_modules/@robertruben98/onyx-ui/styles/tokens.css",
    "node_modules/@robertruben98/onyx-ui/styles/themes/dark.css"

Import components from `@robertruben98/onyx-ui`. Requires Angular 19 (peer dependency).
