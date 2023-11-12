# openHAB Web Interface Add-ons

<img align="right" width="220" src="./logo.svg" type="image/svg+xml"/>

[![GitHub Actions Build Status](https://github.com/openhab/openhab-webui/actions/workflows/ci-build.yml/badge.svg?branch=main)](https://github.com/openhab/openhab-webui/actions/workflows/ci-build.yml)
[![Jenkins Build Status](https://ci.openhab.org/job/openHAB-WebUI/badge/icon)](https://ci.openhab.org/job/openHAB-WebUI/)
[![EPL-2.0](https://img.shields.io/badge/license-EPL%202-green.svg)](https://opensource.org/licenses/EPL-2.0)
[![Crowdin](https://badges.crowdin.net/openhab-webui/localized.svg)](https://crowdin.com/project/openhab-webui)

This repository contains the official web user interfaces for openHAB.

openHAB has a main web UI but more can be installed thanks to its modular add-on architecture.

Most UIs rely on openHAB's REST API which is largely implemented in openHAB Core bundles, but sometimes on individual add-ons.
Therefore, a significant chunk of issues that can be mistakenly assumed to be UI issues could in fact be depending on an extension of the REST API.

If your issue is not strictly UI-related be aware it could eventually be transferred or closed with an indication that it requires a change in openHAB Core to be implemented.
Should you be interested in openHAB Core development, we invite you to check out https://github.com/openhab/openhab-core.

That being said, if you feel you have a genuine problem with one of the web UIs, please review the existing issues at https://github.com/openhab/openhab-webui/issues first, then file a new one at https://github.com/openhab/openhab-webui/issues/new/choose if appropriate - the menu will guide you.

## Development / Repository Organization

openHAB add-ons are [Java](https://en.wikipedia.org/wiki/Java_(programming_language)) `.jar` files.

The openHAB build system is based on [Maven](https://maven.apache.org/what-is-maven.html).
The official IDE (Integrated development environment) is Eclipse.

You find the following repository structure:

```
.
+-- bom       Maven buildsystem: Bill of materials
|   +-- openhab-ui  Lists all extensions
|
+-- bundles   Official openHAB web interface extensions
|   +-- org.openhab.ui
|   +-- org.openhab.ui.basicui
|   +-- org.openhab.ui.habot
|   +-- org.openhab.ui.habpanel
|   +-- ...
|
+-- features  Part of the runtime dependency resolver ("Karaf features")
|
+-- licenses  Infrastructure to easily add license headers to source files
|
+-- tools     Static code analyser instructions
|
+-- CODEOWNERS  This file assigns people to directories so that they are informed
|   if a pull-request would modify their add-ons.
|
+-- LICENSE   The official license for this repository.
```

### How to contribute

In most cases, you **don't** need a Java development environment for UI development.

Instead, make sure you have NodeJS 16.14 (HABot: 12.16) or later and npm 8.6 (HABot: 6.14) or later installed.


Then identify in the `bundles` directories where the frontend code is - for instance, for the main UI it is `bundles/org.openhab.ui/web/`.
Then follow the instructions in the specific add-on's `CONTRIBUTING.md` file to get started. In the main UI's case, it is located in [bundles/org.openhab.ui/CONTRIBUTING.md](https://github.com/openhab/openhab-webui/blob/master/bundles/org.openhab.ui/CONTRIBUTING.md). In many cases it will involve executing some `npm` commands to install dependencies and start a development server.

However, if you want to compile the final `.jar` add-ons, we have assembled some step-by-step guides for different IDEs on our developer documentation website:

https://www.openhab.org/docs/developer/#setup-the-development-environment

### Command line build

To build all add-ons from the command-line, type in:

`mvn clean install`

To improve build times you can add the following options to the command:

| Option                        | Description                                         |
| ----------------------------- | --------------------------------------------------- |
| `-DskipChecks`                | Skip the static analysis (Checkstyle, FindBugs)     |
| `-DskipTests`                 | Skip the execution of tests                         |
| `-Dmaven.test.skip=true`      | Skip the compilation and execution of tests         |
| `-Dfeatures.verify.skip=true` | Skip the Karaf feature verification                 |
| `-Dspotless.check.skip=true`  | Skip the Spotless code style checks                 |
| `-o`                          | Work offline so Maven does not download any updates |
| `-T 1C`                       | Build in parallel, using 1 thread per core          |

For example you can skip checks and tests during development with:

`mvn clean install -DskipChecks -DskipTests`

Adding these options improves the build time but could hide problems in your code.
Parallel builds are also less easy to debug and the increased load may cause timing sensitive tests to fail.

To check if your code is following the [code style](https://www.openhab.org/docs/developer/guidelines.html#b-code-formatting-rules-style) run: `mvn spotless:check`
To reformat your code so it conforms to the code style you can run: `mvn spotless:apply`

When your add-on also has an integration test in the `itests` directory, you may need to update the runbundles in the `itest.bndrun` file when the Maven dependencies change.
Maven can resolve the integration test dependencies automatically by executing: `mvn clean install -DwithResolver -DskipChecks`

The build generates a `.jar` file per bundle in the respective bundle `/target` directory.

**Happy coding! 🎉**

<small>[<img align="right" src="https://user-images.githubusercontent.com/2004147/30233170-35d19c3a-94f4-11e7-8540-894977d1c653.png">](https://www.browserstack.com/) Thanks to [BrowserStack](https://www.browserstack.com/) for kindly providing the maintainers with free open source accounts to help testing the UIs on a wide range of devices!</small>
