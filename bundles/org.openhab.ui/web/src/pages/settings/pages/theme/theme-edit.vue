<template>
  <f7-page>
        <f7-navbar no-hairline>
            <oh-nav-content :title="!ready ? '' : ((createMode ? 'Create Theme' : 'Theme: ' + theme.config.label) + dirtyIndicator)"
                      :save-link="`Save${$device.desktop ? ' (Ctrl-S)' : ''}`"
                      @save="save()"
                      :f7router />
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link tab-link="#design" tab-link-active>
        Design
      </f7-link>
      <f7-link tab-link="#code">
        Code
      </f7-link>
    </f7-toolbar>

    <f7-tabs class="theme-editor-tabs">
        <f7-tab class="design"
                id="design"
                tab-active>
            <f7-block form class="block-narrow">
                <f7-col>
                    <f7-block-title medium>
                        Theme configuration
                    </f7-block-title>
                    <config-sheet
                        :parameter-groups="configDescription.parameterGroups"
                        :parameters="configDescription.parameters"
                        :configuration="theme.config" />
                </f7-col>
            </f7-block>
        </f7-tab>
        <f7-tab class="code"
                id="code">
        </f7-tab>
    </f7-tabs>
  </f7-page>

</template>

<script lang="ts">
import { f7 } from 'framework7-vue'

import ConfigSheet from '@/components/config/config-sheet.vue'

import type { ConfigDescriptionParameter, ConfigDescriptionParameterGroup, RootUiComponent } from '@/api'

const pageDescription : RootUiComponent = {
    uid: 'theme-edit-page-description',
    component: 'PageDescription',
    tags: [],
    config: { },
    props: {
        parameterGroups: [ 
            {
                name: 'general',
                label: 'General Settings',
                description: 'General configuration options for the theme editor page',
                advanced: false,
                context: ""
            } satisfies ConfigDescriptionParameterGroup
        ],
        parameters: [ 
            {
                name: 'page-setting-1',
                type: 'TEXT',
                label: 'Page Setting 1',
                description: 'An example setting for the theme editor page',
                defaultValue: '',
                groupName: 'general',
                advanced: false
            } satisfies ConfigDescriptionParameter
        ]
    }
}   

const slotRootConfigDescription = {
    parameterGroups: [ 
        {
            name: ':root',
            label: 'Base Settings',
            description: 'Settings that apply to all themes'
        } as Partial<ConfigDescriptionParameterGroup>,
    ],
    parameters: [ 
        {
            name: 'css-file',
            type: 'TEXT',
            label: 'CSS File',
            description: 'The CSS file associated with the theme',
            defaultValue: '',
            groupName: 'general',
            advanced: true
        } as Partial<ConfigDescriptionParameter>,

        // Base parameters
        {
            name: '--oh-theme-color',
            type: 'TEXT',
            label: 'Main Theme Color',
            context: 'color',
            defaultValue: '',
            groupName: ':root'
        } as Partial<ConfigDescriptionParameter>,
        {
            name: '--oh-theme-color-shade',
            type: 'TEXT',
            label: 'Main Theme Color - Shade',
            context: 'color',
            defaultValue: '',
            groupName: ':root',
            advanced: true
        } as Partial<ConfigDescriptionParameter>,
        {
            name: '--oh-theme-color-tint',
            type: 'TEXT',
            label: 'Main Theme Color - Tint',
            context: 'color',
            defaultValue: '',
            groupName: ':root',
            advanced: true
        } as Partial<ConfigDescriptionParameter>,
    ]
}

const slotDarkConfigDescription = {
    parameterGroups: [ 
        {
            name: ':root',
            label: 'Base Settings',
            description: 'Settings that apply to all themes'
        } as Partial<ConfigDescriptionParameterGroup>,
    ],
    parameters: [
        {
            name: '--oh-theme-color',
            type: 'TEXT',
            label: 'Main Theme Color',
            context: 'color',
            defaultValue: '',
            groupName: ':root.dark'
        } as Partial<ConfigDescriptionParameter>
    ]
}

// @ts-expect-error
import DirtyMixin from '@/pages/settings/dirty-mixin'

export default {
    mixins: [DirtyMixin],
    components: {
        ConfigSheet
    },
    props: {
        uid: String,
        f7router: Object
    },
    setup () {
        return { configDescription  }
    },
    data () {
        return {
            ready: true,
            createMode: false,
            theme: {
                uid: 'theme_' + f7.utils.id(),
                component: 'Theme',
                config: {
                    label: ''
                },
                tags: [],
                slots: { }
            } as Partial<RootUiComponent>,
            currentTab: 'design',
        };
    },
    methods: {
        load () {
            // Save logic here
        }
    }
}

</script>
