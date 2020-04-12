package org.openhab.ui.cometvisu.backend.rest.model;

/**
 * Manually implemented because the openapi jaxrs generator does not support onOf types yet.
 *
 */
public class OneOfHiddenConfigConfigSectionConfigOption {
    private ConfigOption option;
    private HiddenConfig config;
    private ConfigSection section;

    public OneOfHiddenConfigConfigSectionConfigOption(ConfigOption option) {
        this.option = option;
    }

    public OneOfHiddenConfigConfigSectionConfigOption(ConfigSection section) {
        this.section = section;
    }

    public OneOfHiddenConfigConfigSectionConfigOption(HiddenConfig config) {
        this.config = config;
    }

    public Object getOneOf() {
        if (this.config != null) {
            return this.config;
        } else if (this.section != null) {
            return this.section;
        } else if (this.option != null) {
            return this.option;
        } else {
            return null;
        }
    }
}
