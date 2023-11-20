# Contributing to the openHAB UI

The [standard contributing and community guidelines for the openHAB project](https://github.com/openhab/openhab-core/blob/main/CONTRIBUTING.md), including signing off your commits, also apply for the development of the UI.

The repository for web user interfaces, including this project, is located at <https://github.com/openhab/openhab-webui> and the code of this project, including this file, is found in the `bundles/org.openhab.ui` folder.

## Prerequisites

This project is built using [Vue.js](https://vuejs.org/), [webpack](https://webpack.js.org/) and [Framework7](https://framework7.io).

You need Node 16.14.0 or later and npm 8.6.0. Change to the `web` directory, gather the necessary dependencies with `npm install` then the scripts below will be available.

## NPM Scripts

* `npm start` - run the development server (see below)
* `npm run build-prod` - build web app for production (note: no need to prepare a production version when submitting a PR, the build server will do it)
* `npm run build-cordova-prod` - build cordova's `www` folder from source and build a Cordova app
* `npm run dev` - run the development server (same as above)
* `npm run dev:blockly` - run the development server with Blockly source-maps (allows Blockly debugging)
* `npm run test:unit` - start the Jest test runner and run the unit tests
* `npm run test:unit:watch` - start the Jest test runner, run the unit tests, keep running and watch for changes
* `npm run test:e2e` - start Cypress and run the e2e tests
* `npm run test:e2e:gui` - open the Cypress GUI

## Development server

Before starting the development server with `npm start`, you should have an instance of openHAB (either a complete distribution or the demo app) running on _localhost:8080_.
The development server will run on the next available port (for instance, 8081) and proxy requests to well-known openHAB URLs like the REST API or icon servlet, forwarding them to their equivalent on port 8080.
If you wish to change the target of these forwards and use a remote instance, set the `OH_APIBASE` environment variable to the desired URL (e.g. `OH_APIBASE=http://openhab-dev:8080`) before running `npm start`.

You can also run the unit tests (`test/jest`) and e2e (`test/cypress`) tests using the abovementioned commands.
Cypress is configured to assume the development server is running on port 8081 - you can change that in `cypress.json` but remember not to commit.
You can also use Majestic GUI to run the unit tests and temporarily collect code coverage and view coverage reports (it is disabled by default for performance reasons): install it globally with `npm install -g majestic`, and run `majestic` in the root web folder to open Majestic in a browser window.

## Vue DevTools

Since openHAB's MainUI is using Vue, it is really helpful to install the [Vue DevTools](https://devtools.vuejs.org/) in your browser.
Please note that you can only use the Vue DevTools with the development server.

Some of its very helpful features are:

* Access to all Vue components of the current page in a tree model (like the `Elements` tab of the browsers DevTools)
* Read (and write) `props`, `data` and `computed` of Vue components.
* Select a component by clicking on it (very helpful when you want to change something in MainUI, but don't know which component you have to edit).
* Access to the Vuex storage.

## How Do I?

This FAQ tries to provide some guidance on how to start off with some common changes to MainUI.

### Edit an existing page?

In general, it is a good start to open the [web/src/pages](web/src/pages) directory.
In this directory, open the sub-folders according to the path of the MainUI page.
E.g.: You want to edit `/settings/transformations`. Open [web/src/pages/settings/transformations](web/src/pages/settings/transformations). You'll find `transformations-list.vue` and `transformation-edit.vue`, it should be self-explaining which page does what.

When you open a `.vue` file, check out the `template` tags for the structure of the page. You will note, that several UI structures are packed into Vue components, which you can directly open from the `template` tags inside your IDE.
E.g. for IntelliJ-based IDEs: To open a component from the `template` tags, press `CTRL` and then click on the component name. To follow the example with the transformations, open `transformation-edit.vue`, and search for `transformation-general-settings` inside the `template` tags. `CTRL` + click on it, and the Vue component will open up.

Instead of following the way described above, you can also use the [Vue DevTools](#vue-devtools) to find out which component you need to modify.

### Edit or add a widget?

UI widgets are Vue components, not pages, therefore you'll find them in the [web/src/components/widgets/standard](web/src/components/widgets/standard) directory.

When opening one of those widgets you can use in the UI, e.g. `oh-clock-card.vue`, you'll notice that it basically wraps the `oh-clock.vue` component from [web/src/components/widgets/system](web/src/components/widgets/system).
If you now want to modify the functionality or appearance of the clock widget, your changes usually need to be done inside the wrapped component, in this case `oh-clock.vue`, not `oh-clock-card.vue`.

In case you want to edit widget parameters, make sure to adjust the widget's parameter definition in [web/src/assets/definitions/widgets/system](web/src/assets/definitions/widgets/system).
After editing those definitions, it is required to regenerate the component docs, see [Documentation & Resources](#documentation--resources)

### Edit or add Blockly blocks?

* Blocks are defined within [blockly-editor.vue](web/src/components/config/controls/blockly-editor.vue).
* Blocks are implemented inside the [web/src/assets/definitions/blockly](web/src/assets/definitions/blockly) directory.
* Each block requires a _Blockly.Blocks_ section that defines the visual representation and a _javascriptGenerator_ section that implements the code generation of the block.
* Please refer to the [visualisation](https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks) and [code generation](https://developers.google.com/blockly/guides/create-custom-blocks/code-generation/overview) documentation on how to define blocks.
* Also follow the [Blockly Best Practices](https://developers.google.com/blockly/guides/app-integration/best-practices) and [Blockly Style guide](https://developers.google.com/blockly/guides/create-custom-blocks/style-guide)

### Update the FAQ or Quick Start of the developer sidebar's help?

The "How do I..." and "Quick Start" sections are created from JSON definitions located at the [web/src/assets/definitions/help](web/src/assets/definitions/help).

## PWA

This is a PWA. Don't forget to check what is inside your `service-worker.js`. It is also recommended that you disable the service worker (or enable "Update on reload") in your browser's dev tools during development.

## Cordova

The Cordova project is located in the `cordova` folder. You shouldn't modify content of the `cordova/www` folder. Its content will be correctly generated when you call `npm run build-cordova-prod` (see [NPM Scripts](#npm-scripts)).

## Documentation & Resources

The openHAB docs provide a [Component Reference](https://www.openhab.org/docs/ui/components/) as well as docs for each component.
You can find the components docs in the [`doc/components`](doc/components) folder.
To generate the auto-generated parts of these component docs, run `node generate.js` inside the [`doc/components/src`](doc/components/src) folder.

### Framework7

* [Framework7 Core Documentation](https://framework7.io/docs/)
* [Framework7 Vue Documentation](https://framework7.io/vue/)

* [Framework7 Icons Reference](https://framework7.io/icons/)
* [Community Forum](https://forum.framework7.io)
