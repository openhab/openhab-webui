# AGENTS.md - openHAB Web UIs Development Guide

## Overview

This repository contains the web user interfaces for the openHAB smart-home project, featuring approximately 5 different extensions located in the `bundles` folder.

**Key Resources:**
- Developer documentation: https://www.openhab.org/docs/developer/
- Core concepts: https://www.openhab.org/docs/concepts/
- Core repository: https://github.com/openhab/openhab-core

## Project Structure

```text
repo root folder
├── bundles/
│   ├── org.openhab.ui                  # Main UI (main user interface for openHAB)
│   ├── org.openhab.ui.basicui          # Basic UI (sitemaps)
│   ├── org.openhab.ui.basicui          # CometVisu Backend for openHAB (https://www.cometvisu.org/)
│   ├── org.openhab.ui.habot            # HABot UI (chatbot)
│   ├── org.openhab.ui.habpanel         # HABPanel UI (fixed-layout dashboard)
│   └── org.openhab.ui.iconset.classic  # Classic Icon Set
├── CODEOWNERS                          # Maintainer assignments
└── ...
```

**Important:** This repository depends on the openhab-core repository, which defines the base system and APIs.

## Development Standards

### Java Version
- **Target:** Java 21
- Use modern language features, but stay within Java 21 bounds
- Avoid preview features or experimental APIs

### Code Style & Documentation

#### Comments and Documentation
- Add meaningful code comments where helpful
- Avoid obvious comments (e.g., `// constructor`)
- Use Javadoc for API/class/method documentation
- Follow guidelines at: https://www.openhab.org/docs/developer/guidelines.html
- Follow checklist at: https://github.com/openhab/openhab-addons/wiki/Review-Checklist

#### Import Organization
- Sort imports alphabetically
- Group imports logically (standard library, third-party, openHAB)

#### Formatting
- Use `mvn spotless:apply` to fix formatting issues
- POM sections should be sorted

## File-Specific Guidelines

### pom.xml Files
When upgrading Maven dependencies:

1. **Check version consistency across:**
    - `features.xml` files for hardcoded version numbers
    - `*.bndrun` files for hardcoded version numbers

2. **After updates:**
    - Run `mvn spotless:apply` to fix formatting
    - Consider running full Maven build with `-DwithResolver` option

### OH-INF/i18n/*_xx.properties
- I18N properties files for specific languages, e.g. foobar_de.properties, should be omitted.
- Reference documentation: https://www.openhab.org/docs/developer/utils/i18n.html#managing-translations

### AGENTS.md
There might be AGENTS.md files in subfolders. Consider them when files from that UI are open in the editor:
- bundles/org.openhab.*/AGENTS.md

### CODEOWNERS File
- Located at repository root
- Maps GitHub usernames to UI responsibilities
- Format: `path/to/UI @github-username`

## Testing

### Build Validation
```bash
# Format code
mvn spotless:apply

# Run tests
mvn clean install

# Build and run tests for a single specific user interface
mvn clean install -pl org.openhab.ui.uiname
```

After building, the directory target inside org.openhab.ui.uiname contains several test reports.
- target/code_analysis/report.html for results of the static code analysis
- target/site/jacoco/index.html contains code coverage (only if available for a specific binding)

## Common Pitfalls

1. **Dependency Management:** Always check `features.xml` and `*.bndrun` files when updating dependencies
2. **Import Order:** Unsorted imports will fail style checks
3. **Java Version:** Stay within Java 21 - newer features will break CI/CD

## Getting Help

- **Documentation:** https://www.openhab.org/docs/developer/
- **Community Forum:** https://community.openhab.org/
- **GitHub Issues:** Use for bug reports and feature requests
- **Code Reviews:** Required for all contributions

## Quick Reference

| Task                | Command                                       |
|---------------------|-----------------------------------------------|
| Format code         | `mvn spotless:apply`                          |
| Full build          | `mvn clean install`                           |
| Build with resolver | `mvn clean install -DwithResolver`            |
| Build a specific UI | `mvn clean install -pl org.openhab.ui[.name]` |
