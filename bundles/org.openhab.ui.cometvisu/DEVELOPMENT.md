# Development Hints 

Source files are automatically generated from CometVisu's visu_config.xsd and openapi.yaml files.
For a manual update of these files copy them to the src/main/resources folder and run
`mvn clean generated-sources`.

If the library version changes the value must be updated in `org.openhab.ui.cometvisu.internal.backend.model.config.LibVersion`.

