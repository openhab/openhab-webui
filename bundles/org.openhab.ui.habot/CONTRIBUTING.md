# Contributing to HABot

You need NodeJS 24.22.1 or later and npm 11.19.1 or later installed.

The legacy build toolchain needs `NODE_OPTIONS="--openssl-legacy-provider --require ./node-compat.cjs"` to be set when running `npm run build` or `npm run dev` from the `web` folder.
The Maven build sets this automatically.
