import { config } from '@vue/test-utils'
import Framework7 from 'framework7'
import Framework7Vue, * as Framework7VueComponents from 'framework7-vue'

// Register Framework7Vue as a global plugin for all tests
config.global.plugins = [[Framework7Vue, Framework7]]
// Register Framework7Vue components globally
config.global.components = Framework7VueComponents