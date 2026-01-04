# Contributing to the openHAB UI

The [standard contributing and community guidelines for the openHAB project](https://github.com/openhab/openhab-core/blob/main/CONTRIBUTING.md), including signing off your commits, also apply for the development of the UI.

The repository for web user interfaces, including this project, is located at <https://github.com/openhab/openhab-webui> and the code of this project, including this file, is found in the `bundles/org.openhab.ui` folder.

## Prerequisites

This project is built using [Vue.js 3](https://vuejs.org/), [Vite](https://vite.dev/) and [Framework7 v7](https://v7.framework7.io).
[Pinia](https://pinia.vuejs.org/) is used as store.
[VitePWA](https://vite-pwa-org.netlify.app/) is used to generate a service worker and pre-cache UI assets.

You need Node v24.11.0 or later and npm 11.7.0 or later installed.
If you use a Node version manager like [nvm](https://github.com/nvm-sh/nvm), change to the `web` directory and run `nvm use`.

Change to the `web` directory, gather the necessary dependencies with `npm install` then the scripts below will be available.

## NPM Scripts

### Production

* `npm run build` - build web app for production (note: no need to prepare a production version when submitting a PR, the build server will do it)
* `npm run build:mvn` - build web app through Maven for production (note: no need to prepare a production version when submitting a PR, the build server will do it)

### Development

* `npm run start` / `npm run dev` - run the development server
* `npm run OLD:dev:blockly` - run the development server with Blockly source-maps (allows Blockly debugging)
* `npm run test:unit` - start the Vitest test runner and run the unit tests
* `npm run test:unit:watch` - start the Vitest test runner, run the unit tests, keep running and watch for changes
* `npm run lint` - run linter to detect code style errors
* `npm run lint:fix` - run linter and fix code style errors
* `npm run typescript:check` - run TypeScript compiler and check for type errors

## Development server

Before starting the development server with `npm run dev`, you should have an instance of openHAB (either a complete distribution or the demo app) running on _localhost:8080_.
The development server will run on the next available port (for instance, 8081) and proxy requests to well-known openHAB URLs like the REST API or icon servlet, forwarding them to their equivalent on port 8080.
If you wish to change the target of these forwards and use a remote instance, set the `OH_APIBASE` environment variable to the desired URL (e.g. `OH_APIBASE=http://openhab-dev:8080`) before running `npm run dev`.

## Vue DevTools

Since openHAB's MainUI is using Vue, it is really helpful to install the [Vue DevTools](https://devtools.vuejs.org/) in your browser.
Please note that you can only use the Vue DevTools with the development server.

Some of its very helpful features are:

* Access to all Vue components of the current page in a tree model (like the `Elements` tab of the browsers DevTools)
* Read (and write) `props`, `data` and `computed` of Vue components.
* Select a component by clicking on it (very helpful when you want to change something in MainUI, but don't know which component you have to edit).
* Access to the Pinia storage.

## Coding Guidelines

- Vue Reactivity (see [Vue.js: Essentials: Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals)) must be used where possible. No direct DOM manipulation!
- Vue directives such as `v-if`, `v-else`, `v-show`, `v-for` should be placed before other attributes in the `<template>`:

  Bad style:

  ```html
  <div ref="someDiv" color="blue" @click="toggle" v-if="ready>
  ```

  Good style:

  ```html
  <div v-if="ready"  ref="someDiv" color="blue" @click="toggle">
  ```

- Props (see [Vue.js: Components In-Depth: Props](https://vuejs.org/guide/components/props.html)) are a one-way data binding from parent to child and must not be mutated by the child component. Emit events (see [Vue.js: Components In-Depth: Events](https://vuejs.org/guide/components/events.html)) to share data from child to parent.
- Computed properties (see [Vue.js: Essentials: Computed Properties](https://vuejs.org/guide/essentials/computed.html)) should be used instead of method calls for getting prop values in the `<template>`. Methods re-evaluate on every rerender, negatively impacting performance.
- Conditional HTML attributes on HTML elements should be unset using `null` if the condition is false: `condition ? true : null`. This does not apply for Vue components.
- All embedded `<style>` should have a component-specific top-level class as parent to prevent leaking styles to other components.

For new components, additional guidelines apply:

- TypeScript should be used over plain JavaScript. See [Vue.js: TypeScript with Composition API](https://vuejs.org/guide/typescript/composition-api.html).
- The Composition API and composables should be used instead of the Options API and mixins. See [Vue.js: Introduction: API Styles](https://vuejs.org/guide/introduction.html#api-styles).
- Components should be imported through `<script setup>` to make sure Vite doesn't accidentally tree-shake them.

## How Do I?

This FAQ tries to provide some guidance on how to start off with some common changes to MainUI.

### Edit an existing page?

In general, it is a good start to open the [web/src/pages](web/src/pages) directory.
In this directory, open the sub-folders according to the path of the MainUI page.

For example:
You want to edit `/settings/transformations`. Open [web/src/pages/settings/transformations](web/src/pages/settings/transformations).
You'll find `transformations-list.vue` and `transformation-edit.vue`, it should be self-explaining which page does what.

When you open a `.vue` file, check out the `template` tags for the structure of the page.
You will note, that several UI structures are packed into Vue components, which you can directly open from the `template` tags inside your IDE.
For example for IntelliJ-based IDEs:
To open a component from the `template` tags, press `CTRL` and then click on the component name.
To follow the example with the transformations, open `transformation-edit.vue`, and search for `transformation-general-settings` inside the `template` tags. `CTRL` + click on it, and the Vue component will open up.

Instead of following the way described above, you can also use the [Vue DevTools](#vue-devtools) to find out which component you need to modify.

### Edit or add a widget?

UI widgets are Vue components, not pages, therefore you'll find them in the [web/src/components/widgets/standard](web/src/components/widgets/standard) directory.

When opening one of those widgets you can use in the UI, e.g. `oh-clock-card.vue`, you'll notice that it basically wraps the `oh-clock.vue` component from [web/src/components/widgets/system](web/src/components/widgets/system).
If you now want to modify the functionality or appearance of the clock widget, your changes usually need to be done inside the wrapped component, in this case `oh-clock.vue`, not `oh-clock-card.vue`.

In case you want to edit widget parameters, make sure to adjust the widget's parameter definition in [web/src/assets/definitions/widgets/system](web/src/assets/definitions/widgets/system).
After editing those definitions, it is required to regenerate the component docs, see [Documentation & Resources](#documentation--resources).

### Edit or add Blockly blocks?

* Blocks are defined within [blockly-editor.vue](web/src/components/config/controls/blockly-editor.vue).
* Blocks are implemented inside the [web/src/assets/definitions/blockly](web/src/assets/definitions/blockly) directory.
* Each block requires a _Blockly.Blocks_ section that defines the visual representation and a _javascriptGenerator.forBlock_ section that implements the code generation of the block.
* Please refer to the [visualization](https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks) and [code generation](https://developers.google.com/blockly/guides/create-custom-blocks/code-generation/overview) documentation on how to define blocks.
* Also follow the [Blockly Best Practices](https://developers.google.com/blockly/guides/app-integration/best-practices) and [Blockly Style guide](https://developers.google.com/blockly/guides/create-custom-blocks/style-guide).

### Update the FAQ or Quick Start of the developer sidebar's help?

The "How do I..." and "Quick Start" sections are created from JSON definitions located at the [web/src/assets/definitions/help](web/src/assets/definitions/help) directory.

### Update the add-on names and documentation links for automation languages?

Edit the [web/src/assets/automation-languages.js](web/src/assets/automation-languages.js) file.

### Update the code snippets, editor mode assignment and documentation links for transformations?

Edit the [web/src/assets/transformations.js](web/src/assets/transformations.js) file.

## Documentation & Resources

The openHAB docs provide a [Component Reference](https://www.openhab.org/docs/ui/components/) as well as documentation for each `oh-` widget component.
You can find the component documentation in the [`doc/components`](doc/components) folder.
To generate the auto-generated parts of these component docs, run `node generate.js` inside the [`doc/components/src`](doc/components/src) folder.

### Vue / Pinia

- [Vue.js Documentation](https://vuejs.org/guide/introduction.html)
- [Pinia Documentation](https://pinia.vuejs.org/introduction.html)

### Framework7

- [Framework7 Core Documentation](https://v7.framework7.io/docs/)
- [Framework7 Vue Documentation](https://v7.framework7.io/vue/)
- [Framework7 Icons Reference](https://framework7.io/icons/)
- [Community Forum](https://forum.framework7.io)
