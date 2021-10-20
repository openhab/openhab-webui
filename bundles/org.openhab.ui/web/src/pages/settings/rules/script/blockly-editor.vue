<template>
  <!-- eslint-disable vue/singleline-html-element-content-newline -->
  <div class="blockly-editor">
    <div class="blockly" ref="blocklyEditor" />
      <xml xmlns="https://developers.google.com/blockly/xml" ref="toolbox" style="display: none">
      <category name="Logic" colour="%{BKY_LOGIC_HUE}">
        <block type="controls_if">
            <mutation elseif="1" else="1"></mutation>
        </block>
        <block type="logic_compare" />
        <block type="logic_operation" />
        <block type="logic_negate" />
        <block type="logic_boolean" />
        <block type="logic_null" />
        <block type="logic_ternary" />
      </category>
      <category name="Loops" colour="%{BKY_LOOPS_HUE}">
        <block type="controls_repeat_ext">
          <value name="TIMES">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
        </block>
        <block type="controls_whileUntil" />
        <block type="controls_for">
          <value name="FROM">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="TO">
            <shadow type="math_number">
              <field name="NUM">10</field>
            </shadow>
          </value>
          <value name="BY">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
        </block>
        <block type="controls_forEach" />
        <block type="controls_flow_statements" />
      </category>
      <category name="Math" colour="%{BKY_MATH_HUE}">
        <block type="math_number">
          <field name="NUM">123</field>
        </block>
        <block type="math_arithmetic">
          <value name="A">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="B">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
        </block>
        <block type="math_single">
          <value name="NUM">
            <shadow type="math_number">
              <field name="NUM">9</field>
            </shadow>
          </value>
        </block>
        <block type="math_trig">
          <value name="NUM">
            <shadow type="math_number">
              <field name="NUM">45</field>
            </shadow>
          </value>
        </block>
        <block type="math_constant" />
        <block type="math_number_property">
          <value name="NUMBER_TO_CHECK">
            <shadow type="math_number">
              <field name="NUM">0</field>
            </shadow>
          </value>
        </block>
        <block type="math_round">
          <value name="NUM">
            <shadow type="math_number">
              <field name="NUM">3.1</field>
            </shadow>
          </value>
        </block>
        <block type="math_on_list" />
        <block type="math_modulo">
          <value name="DIVIDEND">
            <shadow type="math_number">
              <field name="NUM">64</field>
            </shadow>
          </value>
          <value name="DIVISOR">
            <shadow type="math_number">
              <field name="NUM">0</field>
            </shadow>
          </value>
        </block>
        <block type="math_constrain">
          <value name="VALUE">
            <shadow type="math_number">
              <field name="NUM">50</field>
            </shadow>
          </value>
          <value name="LOW">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="HIGH">
            <shadow type="math_number">
              <field name="NUM">100</field>
            </shadow>
          </value>
        </block>
        <block type="math_random_int">
          <value name="FROM">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="TO">
            <shadow type="math_number">
              <field name="NUM">100</field>
            </shadow>
          </value>
        </block>
        <block type="math_random_float" />
        <block type="math_atan2">
          <value name="X">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="Y">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
        </block>
      </category>
      <category name="Text" colour="%{BKY_TEXTS_HUE}">
        <block type="text" />
        <block type="text_join">
            <mutation items="0"></mutation>
        </block>
        <block type="text_append">
          <value name="TEXT">
            <shadow type="text" />
          </value>
        </block>
        <block type="text_length">
          <value name="VALUE">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
        <block type="text_isEmpty">
          <value name="VALUE">
            <shadow type="text">
              <field name="TEXT" />
            </shadow>
          </value>
        </block>
        <block type="text_indexOf">
          <value name="VALUE">
            <block type="variables_get">
              <field name="VAR">{textVariable}</field>
            </block>
          </value>
          <value name="FIND">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
        <block type="text_charAt">
          <value name="VALUE">
            <block type="variables_get">
              <field name="VAR">{textVariable}</field>
            </block>
          </value>
        </block>
        <block type="text_getSubstring">
          <value name="STRING">
            <block type="variables_get">
              <field name="VAR">{textVariable}</field>
            </block>
          </value>
        </block>
        <block type="text_changeCase">
          <value name="TEXT">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
        <block type="text_trim">
          <value name="TEXT">
            <shadow type="text">
              <field name="TEXT">abc</field>
            </shadow>
          </value>
        </block>
      </category>
      <category name="Lists" colour="%{BKY_LISTS_HUE}">
        <block type="lists_create_with">
          <mutation items="0" />
        </block>
        <block type="lists_create_with" />
        <block type="lists_repeat">
          <value name="NUM">
            <shadow type="math_number">
              <field name="NUM">5</field>
            </shadow>
          </value>
        </block>
        <block type="lists_length" />
        <block type="lists_isEmpty" />
        <block type="lists_indexOf">
          <value name="VALUE">
            <block type="variables_get">
              <field name="VAR">{listVariable}</field>
            </block>
          </value>
        </block>
        <block type="lists_getIndex">
          <value name="VALUE">
            <block type="variables_get">
              <field name="VAR">{listVariable}</field>
            </block>
          </value>
        </block>
        <block type="lists_setIndex">
          <value name="LIST">
            <block type="variables_get">
              <field name="VAR">{listVariable}</field>
            </block>
          </value>
        </block>
        <block type="lists_getSublist">
          <value name="LIST">
            <block type="variables_get">
              <field name="VAR">{listVariable}</field>
            </block>
          </value>
        </block>
        <block type="lists_split">
          <value name="DELIM">
            <shadow type="text">
              <field name="TEXT">,</field>
            </shadow>
          </value>
        </block>
        <block type="lists_sort" />
      </category>
      <category name="Color" colour="%{BKY_COLOUR_HUE}">
        <block type="colour_picker" />
        <block type="colour_random" />
        <block type="colour_rgb">
          <value name="RED">
            <shadow type="math_number">
              <field name="NUM">100</field>
            </shadow>
          </value>
          <value name="GREEN">
            <shadow type="math_number">
              <field name="NUM">50</field>
            </shadow>
          </value>
          <value name="BLUE">
            <shadow type="math_number">
              <field name="NUM">0</field>
            </shadow>
          </value>
        </block>
        <block type="colour_blend">
          <value name="COLOUR1">
            <shadow type="colour_picker">
              <field name="COLOUR">#ff0000</field>
            </shadow>
          </value>
          <value name="COLOUR2">
            <shadow type="colour_picker">
              <field name="COLOUR">#3333ff</field>
            </shadow>
          </value>
          <value name="RATIO">
            <shadow type="math_number">
              <field name="NUM">0.5</field>
            </shadow>
          </value>
        </block>
      </category>
      <category name="openHAB" colour="0">
        <category name="Items & Things">
          <block type="oh_item" />
          <block type="oh_getitem">
            <value name="itemName">
              <shadow type="oh_item" />
            </value>
          </block>
          <block type="oh_getitem_state">
            <value name="itemName">
              <shadow type="oh_item" />
            </value>
          </block>
          <block type="oh_event">
            <value name="value">
              <shadow type="text">
                <field name="TEXT">
                  value
                </field>
              </shadow>
            </value>
            <value name="itemName">
              <shadow type="oh_item" />
            </value>
          </block>
          <block type="oh_thing" />
          <block type="oh_getthing_state">
            <value name="itemName">
              <shadow type="oh_thing" />
            </value>
          </block>
        </category>
        <category name="Timers and Delays">
          <block type="oh_sleep">
          </block>
          <block type="oh_simpleTimer">
            <value name="delay">
              <shadow type="math_number">
                <field name="NUM">10</field>
              </shadow>
            </value>
          </block>
          <block type="oh_timer_item" />
          <block type="oh_namedTimer">
            <value name="delay">
              <shadow type="math_number">
                <field name="NUM">10</field>
              </shadow>
            </value>
            <value name="timerName">
              <shadow type="oh_timer_item">
                <field name="TEXT">MyTimer</field>
              </shadow>
            </value>
          </block>
          <block type="oh_timer_cancel">
            <value name="timerName">
              <shadow type="oh_timer_item">
                <field name="TEXT">MyTimer</field>
              </shadow>
            </value>
          </block>
          <block type="oh_timer_isactive">
            <value name="timerName">
              <shadow type="oh_timer_item">
                <field name="TEXT">MyTimer</field>
              </shadow>
            </value>
          </block>
          <block type="oh_timer_isrunning">
            <value name="timerName">
              <shadow type="oh_timer_item">
                <field name="TEXT">MyTimer</field>
              </shadow>
            </value>
          </block>
          <block type="oh_timer_hasterminated">
            <value name="timerName">
              <shadow type="oh_timer_item">
                <field name="TEXT">MyTimer</field>
              </shadow>
            </value>
          </block>
          <block type="oh_timer_reschedule">
            <value name="timerName">
              <shadow type="oh_timer_item">
                <field name="TEXT">MyTimer</field>
              </shadow>
            </value>
            <value name="delay">
              <shadow type="math_number">
                <field name="NUM">10</field>
              </shadow>
            </value>
          </block>
        </category>
        <category name="Actions">
          <block type="oh_callscript">
            <value name="script">
              <shadow type="oh_script_dropdown" />
            </value>
          </block>
          <block type="oh_httprequest">
            <value name="url">
              <shadow type="text">
                <field name="TEXT">http://yourURL.com</field>
              </shadow>
            </value>
            <value name="payload">
              <shadow type="text">
                <field name="TEXT" />
              </shadow>
            </value>
          </block>
        </category>
        <category name="Ephemeris">
          <block type="oh_ephemeris_basic" />
          <block type="oh_ephemeris_offset">
            <value name="offset">
              <shadow type="math_number">
                <field name="NUM">
                  0
                </field>
              </shadow>
            </value>
          </block>
        </category>
        <category name="Voice/Multimedia">
          <block type="oh_playmedia_sink">
            <value name="sinkName">
              <shadow type="oh_audiosink_dropdown" />
            </value>
          </block>
          <block type="oh_playmedia_sink_volume">
            <value name="sinkName">
              <shadow type="oh_audiosink_dropdown" />
            </value>
            <value name="volume">
              <shadow type="audioSlider">
                <field name="volume">5</field>
              </shadow>
            </value>
          </block>
          <block type="oh_playstream_sink">
            <value name="sinkName">
              <shadow type="oh_audiosink_dropdown" />
            </value>
          </block>
          <block type="oh_stopstream_sink">
              <value name="sinkName">
                <shadow type="oh_audiosink_dropdown" />
              </value>
          </block>
          <block type="oh_say">
              <value name="textToSay">
                <shadow type="text">
                  <field name="TEXT">text to say</field>
                </shadow>
              </value>
              <value name="deviceSink">
                <shadow type="oh_audiosink_dropdown" />
              </value>
              <value name="voice">
                  <shadow type="oh_voices_dropdown" />
              </value>
          </block>
        </category>
        <category name="Logging/Output">
          <block type="oh_log">
            <value name="message">
              <shadow type="text">
                <field name="TEXT">abc</field>
              </shadow>
            </value>
          </block>
          <block type="oh_print">
            <value name="message">
              <shadow type="text">
                <field name="TEXT">abc</field>
              </shadow>
            </value>
          </block>
        </category>
      </category>
      <sep />
      <category
        name="Variables"
        colour="%{BKY_VARIABLES_HUE}"
        custom="VARIABLE" />
      <category
        name="Functions"
        colour="%{BKY_PROCEDURES_HUE}"
        custom="PROCEDURE" />
    </xml>
  </div>
</template>

<style lang="stylus">
.blockly-editor {
  display: block;
  top: calc(100%);
  height: calc(100%);
  width: 100%;

  .blockly {
    height: 100%;

    .blocklyMainBackground {
      stroke: inherit;
    }
  }
}

.blocklyDropDownDiv {
  z-index: 9000;
}
</style>

<script>
import Blockly from 'blockly'
import '@blockly/block-plus-minus'

import Vue from 'vue'

import defineOHBlocks from '@/assets/definitions/blockly/ohblocks'
import defineOHBlocksTimers from '@/assets/definitions/blockly/ohblocks_timers'
import defineOHBlocksEphemeris from '@/assets/definitions/blockly/ohblocks_ephemeris'
import defineOHBlocksAudio from '@/assets/definitions/blockly/ohblocks_audio'
import defineOHBlocksBusEvents from '@/assets/definitions/blockly/ohblocks_busevents'
import defineOHBlocksLogging from '@/assets/definitions/blockly/ohblocks_logging'

Vue.config.ignoredElements = [
  'field',
  'block',
  'category',
  'xml',
  'mutation',
  'value',
  'sep'
]

export default {
  props: ['blocks'],
  data () {
    return {
      workspace: null,
      sinks: [],
      voices: [],
      scripts: [],
      rules: [],
      addons: [],
      loading: true,
      ready: false
    }
  },
  created () {
    this.getAltData()
    this.getAddons()
  },
  methods: {
    startBlockly () {
      this.workspace = Blockly.inject(this.$refs.blocklyEditor, {
        toolbox: this.$refs.toolbox,
        horizontalLayout: !this.$device.desktop,
        theme: this.$f7.data.themeOptions.dark === 'dark' ? 'dark' : undefined,
        trashcan: false
      })
      const xml = Blockly.Xml.textToDom(this.blocks)
      Blockly.Xml.domToWorkspace(xml, this.workspace)
    },
    loadPage () {
      defineOHBlocks(this.$f7)
      defineOHBlocksTimers(this.$f7)
      defineOHBlocksEphemeris(this.$f7)
      defineOHBlocksLogging(this.$f7)
      defineOHBlocksAudio(this.$f7, this.sinks, this.voices)
      defineOHBlocksBusEvents(this.$f7)

      this.startBlockly()
    },
    getAddons () {
      this.$oh.api
        .get('/rest/addons')
        .then((data) => {
          this.addons = data
            .filter((addon) => addon.installed)
            .sort((a, b) =>
              a.label.toUpperCase().localeCompare(b.label.toUpperCase())

            )
          // console.log('fetched ' + this.addons.length + ' addons')
        })
        .catch((err) => {
          // sometimes we get 502 errors ('Jersey is not ready yet!'), keep trying
          console.error(
            'Error while accessing the API, retrying every 5 seconds: ',
            err
          )
          setTimeout(this.load, 5000)
        })
    },
    getAltData () {
      this.$oh.api
        .get('/rest/rules?summary=true')
        .then((data) => {
          // fetch rules
          this.rules = data.sort((a, b) => {
            const labelA = a.name
            const labelB = b.name
            return labelA.localeCompare(labelB)
          })
          this.rules = this.rules.filter(
            (r) => !r.tags || r.tags.indexOf('Script') < 0
          )
        })
        .catch((err, status) => {
          console.error('REST /rest/rules?summary=true' + err + ':' + status)
        })
      this.$oh.api
        .get('/rest/rules?summary=true&tags=Script')
        .then((data) => {
          // fetch scripts
          this.scripts = data.sort((a, b) => {
            const labelA = a.name
            const labelB = b.name
            return labelA.localeCompare(labelB)
          })
        })
        .catch((err, status) => {
          console.error(
            'REST /rest/rules?summary=true&tags=Script' + err + ':' + status
          )
        })
      this.$oh.api
        .get('/rest/audio/sinks')
        .then((data) => {
          // fetch audio sinks
          this.sinks = data.sort((a, b) => {
            const labelA = a.label
            const labelB = b.label
            return labelA.localeCompare(labelB)
          })
        })
        .catch((err, status) => {
          console.error('REST /rest/audio/sinks failed ' + err + ':' + status)
        })
        .catch((err, status) => {
          console.error('REST /rest/voice/voices failed ' + err + ':' + status)
        })
        this.$oh.api
          .get('/rest/voice/voices')
          .then((data) => {
            // fetch rules
            this.voices = data.sort((a, b) => {
              const labelA = a.label
              const labelB = b.label
              return labelA.localeCompare(labelB)
            })
          this.loadPage()
          })
          .catch((err, status) => {
            console.error('REST /rest/voice/voices' + err + ':' + status)
          })
    },
    getBlocks () {
      const xml = Blockly.Xml.workspaceToDom(this.workspace)
      return Blockly.Xml.domToText(xml)
    },
    getCode () {
      return Blockly.JavaScript.workspaceToCode(this.workspace)
    }
  }
}
</script>
