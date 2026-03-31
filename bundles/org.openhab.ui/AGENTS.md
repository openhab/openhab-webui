# AGENTS.md - openHAB Main UI (org.openhab.ui)

## Overview

This is the main web interface for openHAB, used both for configuration and as the default user interface for end-users.

## Tech Stack

- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **UI Components:** Framework7 v7
- **State Management:** Pinia
- **Language:** TypeScript
- **Styling:** Stylus (CSS Preprocessor)
- **Formatting:** oxfmt (enforcing Prettier style)
- **Testing:** Vitest (Supports TypeScript)
- **API Client:** @hey-api/openapi-ts (located in `web/src/api`)

## Project Structure

```text
bundles/org.openhab.ui/
├── doc/
│   └── components/                                 # oh-* component documentation
│       └── src/                                    # Sources for doc generation (generate.js)
├── src/                                            # Java source code (OSGi bundle)
└── web/                                            # Vue.js application root
    ├── public/                                     # Static assets
    ├── src/
    │   ├── api/                                    # API client (hey-api)
    │   ├── assets/
    │   │   ├── definitions/
    │   │   │   ├── blockly/                        # Blockly block definitions
    │   │   │   └── widgets/                        # Widget definitions describing oh-* components and their configuration parameters
    │   │   └── i18n/                               # I18n files
    │   ├── components/                             # Reusable Vue components
    │   │   └── widgets/                            # Widget components (oh-* components) for end-user facing UI
    │   │       ├── chart/                          # ECharts-based charting: oh-chart-* components
    │   │       ├── standard/                       # Cell, list & card widgets based on the core oh-* components
    │   │       ├── system/                         # Core oh-* components (e.g., oh-slider, oh-stepper, oh-toggle)
    │   │       └── generic-widget-component.vue    # Dynamic rendering of widgets based on their context
    │   ├── js/                                     # TypeScript/JavaScript code for global usage
    │   │   ├── composables/                        # Reusable Vue composables (hooks)
    │   │   ├── openhab/                            # Utilities for interacting with the server, e.g., SSE & WebSocket API handling
    │   │   ├── stores/                             # Pinia state management
    │   │   └── routes.js                           # Framework7 router route definitions
    │   ├── pages/                                  # Page components (mapped to routes in routes.js)
    │   ├── types/                                  # Common TypeScript types/interfaces
    │   │   └── components/
    │   │       └── widgets/                        # TypeScript types for oh-* component configuration
    │   ├── App.vue                                 # Root component
    │   └── main.ts                                 # Entry point
    ├── package.json
    └── vite.config.ts
```

## Development Workflow

All web development happens in the `web/` directory.

### Development Environment & Dependencies
- A Node version manager is used to ensure consistent Node versions across developers.
- The project requires the Node version according to the `.nvmrc` file.
- Use `npm install` to install dependencies after switching to the correct Node version.

### Running the Development Server
- The development server requires a openHAB instance as a backend. By default, it proxies API requests to `localhost:8080`.
- The `OH_APIBASE` environment variable can be set to point to a different openHAB instance (e.g., `OH_APIBASE=http://openhab-dev:8080 npm run dev`).
- Use `npm run dev` to start the development server. It will be available at `http://localhost:8081`.

### Building and Testing
- Use `npm run build` to create a production build of the web application.
- Use `npm run test:unit` to run unit tests with Vitest.
- Write unit tests for utilities, and composables where appropriate. Focus on testing logic and behavior rather than implementation details. Store tests alongside the code they test, using the `.test.ts` suffix (e.g., `useWidget.test.ts` for `useWidget.ts`).

## File-Specific Guidelines

### *.gen.ts Files
- Auto-generated TypeScript files
- Do not modify these files directly

### src/assets/i18n/*.json Files
- I18n translation files for specific languages
- Use English (`en`) as the base language for translations
- Do not modify translation files other than for English (`en`)

## Code Style & Documentation

### Comments and Documentation
- Add meaningful code comments where helpful
- Avoid obvious comments (e.g., `// variable declaration`)
- Use JSDoc for API/class/method documentation
- Generate oh-* component documentation by running `node generate.js` in `doc/components/src` after modifying widget definitions

### Formatting
- Use `npm run format:check` to check for formatting issues
- Use `npm run format` to fix formatting issues

### Linting
- Use `npm run lint` to check for linting issues
- Use `npm run lint:fix` to automatically fix linting issues where possible

### TypeScript
- Generate types for oh-* components by running `npm run generate-widget-component-ts` after modifying widget definitions
- Use `npm run typescript:check` to check for TypeScript errors

### Coding Standards
1. **API Style:** Use the **Composition API** with `<script setup>` for all new components.
2. **Language:** Use **TypeScript** for better type safety and IDE support.
3. **Data Flow:** Strictly follow "Props Down, Events Up". Do not mutate props.
4. **Reactivity:** Use Vue reactivity primitives; avoid direct DOM manipulation.
5. **API Requests:** Use the `@hey-api/openapi-ts` fetch client in `web/src/api`.
6. **Mocking:** Preferably mock API requests (Note: mocking features in hey-api are currently under development).
7. **Component Ordering:** In `<script setup>`, follow this order and add comments to separate sections (`// --- Section Name ---`):
    - Constants/Store/Types
    - Defines (`defineProps`, `defineEmits`, etc.)
    - Composables
    - State/Data
    - Computed
    - Watchers
    - Lifecycle hooks
    - Methods

## Common Pitfalls

- **Composable argument reactivity:** If reactivity needs to be preserved when passing arguments to composables, `Ref`s or `ComputedRef`s must be passed instead of raw values.
- **Reactivity export reactivity:** Composables must not export raw values. Instead, they should export `Ref`s or `ComputedRef`s to ensure reactivity is preserved for the caller.
- **CSS leaking:** Wrap styles in `<style>` with a unique class matching the component name to prevent styles from affecting other components.

## Reference Documentation

- [Framework7 Core Documentation](https://v7.framework7.io/docs/)
- [Framework7 Vue Documentation](https://v7.framework7.io/vue/)
- [Framework7 Icons Reference](https://framework7.io/icons/)
- [ECharts Options](https://echarts.apache.org/en/option.html)

## Quick Reference

| Task             | Command                    |
|------------------|----------------------------|
| Format code      | `npm run format`           |
| Lint code        | `npm run lint`             |
| TypeScript check | `npm run typescript:check` |
| Production build | `npm run build`            |
