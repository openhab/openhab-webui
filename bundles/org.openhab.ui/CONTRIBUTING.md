# Contributing to the openHAB UI

This project is built using [Vue.js](https://vuejs.org/), [webpack](https://webpack.js.org/) and [Framework7](https://framework7.io).

You need Node 8.10.0 or later and npm 5.6.0. Gather the necessary dependencies with `npm install` then the scripts below will be available.

## NPM Scripts

* `npm start` - run development server
* `npm run build-prod` - build web app for production (note: no need to prepare a production version when submitting a PR, the build server will do it)
* `npm run build-cordova-prod` - build cordova's `www` folder from source and build a Cordova app
* `npm run test:unit` - start the Jest test runner and run the unit tests
* `npm run test:unit:watch` - start the Jest test runner, run the unit tests, keep running and watch for changes
* `npm run test:e2e` - start Cypress and run the e2e tests
* `npm run test:e2e:gui` - open the Cypress GUI

## PWA

This is a PWA. Don't forget to check what is inside of your `service-worker.js`. It is also recommended that you disable service worker (or enable "Update on reload") in browser dev tools during development.

## Cordova

The Cordova project is located in `cordova` folder. You shouldn't modify content of `cordova/www` folder. Its content will be correctly generated when you call `npm run cordova-build-prod`.

## Documentation & Resources

### Framework7

* [Framework7 Core Documentation](https://framework7.io/docs/)
* [Framework7 Vue Documentation](https://framework7.io/vue/)

* [Framework7 Icons Reference](https://framework7.io/icons/)
* [Community Forum](https://forum.framework7.io)
