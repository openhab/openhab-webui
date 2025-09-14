This directory contains patches to node_modules. Typically these are related to
- vue3 changes
- typescript chnages
- bugs in the original
- updates to imports

Patches are created via the npx patch-package command.  Normally, this does not patch package.json files, so if you want to patch a package.json, use the following command:

`npx patch-package package-name --exclude`