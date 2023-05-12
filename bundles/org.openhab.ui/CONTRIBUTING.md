# Contributing to the openHAB UI

The [standard contributing and community guidelines for the openHAB project](https://github.com/openhab/openhab-core/blob/main/CONTRIBUTING.md), including signing off your commits, also apply for the development of the UI.

The repository for web user interfaces, including this project, is located at https://github.com/openhab/openhab-webui and the code of this project, including this file, is found in the `bundles/org.openhab.ui` folder.

## Prerequisites

This project is built using [Vue.js](https://vuejs.org/), [webpack](https://webpack.js.org/) and [Framework7](https://framework7.io).

You need Node 16.14.0 or later and npm 8.6.0. Change to the `web` directory, gather the necessary dependencies with `npm install` then the scripts below will be available.

## NPM Scripts

* `npm start` - run the development server (see below)
* `npm run build-prod` - build web app for production (note: no need to prepare a production version when submitting a PR, the build server will do it)
* `npm run build-cordova-prod` - build cordova's `www` folder from source and build a Cordova app
* `npm run dev` - run the development server (same as above)
^* `npm run dev:blockly` - run the development server with Blockly source-maps (allows Blockly debugging)
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

## PWA

This is a PWA. Don't forget to check what is inside of your `service-worker.js`. It is also recommended that you disable the service worker (or enable "Update on reload") in your browser's dev tools during development.

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
