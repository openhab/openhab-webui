<template>
  <!-- eslint-disable vue/singleline-html-element-content-newline -->
  <div class="blockly-editor">
    <div class="blockly" ref="blocklyEditor" />
    <xml xmlns="https://developers.google.com/blockly/xml" ref="toolbox" style="display: none">
      <category name="Logic" colour="%{BKY_LOGIC_HUE}">
        <block type="controls_if" />
        <block type="logic_compare" />
        <block type="logic_operation" />
        <block type="logic_negate" />
        <block type="logic_boolean" />
        <block type="logic_null" />
        <block type="oh_logic_undefined" />
        <block type="logic_ternary" />
      </category>

      <category name="Loops" colour="%{BKY_LOOPS_HUE}">
        <button
          helpUrl="configuration/blockly/rules-blockly-standard-ext.html#loops"
          text="Help"
          callbackKey="ohBlocklyHelp" />
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
        <block type="dicts_for" />
        <block type="controls_flow_statements" />
      </category>

      <category name="Math" colour="%{BKY_MATH_HUE}">
        <button
          helpUrl="configuration/blockly/rules-blockly-standard-ext.html#math"
          text="Help"
          callbackKey="ohBlocklyHelp" />
        <block type="math_number">
          <field name="NUM">123</field>
        </block>
        <block type="oh_toNumber">
          <value name="valueAsText">
            <shadow type="text">
              <field name="TEXT">123</field>
            </shadow>
          </value>
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
        <block type="oh_bitwise">
          <value name="first">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
          <value name="second">
            <shadow type="math_number">
              <field name="NUM">1</field>
            </shadow>
          </value>
        </block>
        <block type="oh_bit_not">
          <value name="value">
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
        <block type="oh_math_minmax">
          <value name="NUM1">
            <shadow type="math_number">
              <field name="NUM">3</field>
            </shadow>
          </value>
          <value name="NUM2">
            <shadow type="math_number">
              <field name="NUM">4</field>
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
        <button
          helpUrl="configuration/blockly/rules-blockly-standard-ext.html#text"
          text="Help"
          callbackKey="ohBlocklyHelp" />
        <block type="text" />
        <block type="text_join">
          <mutation items="0" />
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
        <block type="oh_text_replace">
          <value name="pattern">
            <shadow type="text">
              <field name="TEXT">pattern</field>
            </shadow>
          </value>
          <value name="replacement">
            <shadow type="text">
              <field name="TEXT">replacement</field>
            </shadow>
          </value>
          <value name="origin">
            <shadow type="text">
              <field name="TEXT">origin</field>
            </shadow>
          </value>
        </block>
        <block type="oh_text_crlf" />
      </category>

      <category name="Lists" colour="%{BKY_LISTS_HUE}">
        <button
          helpUrl="configuration/blockly/rules-blockly-standard-ext.html#lists"
          text="Help"
          callbackKey="ohBlocklyHelp" />
        <block type="lists_create_with">
          <mutation items="0" />
        </block>
        <block type="lists_create_with" />
        <block type="oh_list_concatenate" />
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
        <sep gap="48" />
        <block type="dicts_create_with" />
        <block type="dicts_get">
          <value name="key">
            <shadow type="text">
              <field name="TEXT">key</field>
            </shadow>
          </value>
        </block>
      </category>

      <category name="Color" colour="%{BKY_COLOUR_HUE}">
        <button
          helpUrl="configuration/blockly/rules-blockly-standard-ext.html#colors"
          text="Help"
          callbackKey="ohBlocklyHelp" />
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
        <block type="oh_color_to_hsb">
          <value name="hexColor">
            <shadow type="colour_picker">
              <field name="COLOUR">#ff0000</field>
            </shadow>
          </value>
        </block>
        <block type="oh_color_item">
          <value name="item">
            <shadow type="oh_getitem">
              <value name="itemName">
                <shadow type="oh_item" />
              </value>
            </shadow>
          </value>
        </block>
      </category>

      <category name="openHAB" colour="0" :expanded="$f7.device.desktop">
        <category name="Items &amp; Things">
          <button
            helpUrl="configuration/blockly/rules-blockly-items-things.html"
            text="Help"
            callbackKey="ohBlocklyHelp" />
          <block type="oh_getitem_state">
            <value name="itemName">
              <shadow type="oh_item" />
            </value>
          </block>
          <block type="oh_getitem_attribute">
            <value name="item">
              <shadow type="oh_getitem">
                <value name="itemName">
                  <shadow type="oh_item" />
                </value>
              </shadow>
            </value>
          </block>
          <block type="oh_getitem">
            <value name="itemName">
              <shadow type="oh_item" />
            </value>
          </block>
          <block type="oh_groupmembers">
            <value name="groupName">
              <shadow type="oh_item" />
            </value>
          </block>
          <block type="oh_taggeditems">
            <value name="tagName">
              <shadow type="text" />
            </value>
          </block>
          <block type="oh_event">
            <value name="value">
              <shadow type="text">
                <field name="TEXT">value</field>
              </shadow>
            </value>
            <value name="itemName">
              <shadow type="oh_item" />
            </value>
          </block>
          <block type="oh_get_meta_value" v-if="isGraalJs">
            <value name="theItem">
              <shadow type="oh_item" />
            </value>
            <value name="namespace">
              <shadow type="text" />
            </value>
          </block>
          <block type="oh_get_meta_config" v-if="isGraalJs">
            <value name="configKey">
              <shadow type="text" />
            </value>
            <value name="theItem">
              <shadow type="oh_item" />
            </value>
            <value name="namespace">
              <shadow type="text" />
            </value>
          </block>
          <block type="oh_store_meta_value" v-if="isGraalJs">
            <value name="value">
              <shadow type="text" />
            </value>
            <value name="theItem">
              <shadow type="oh_item" />
            </value>
            <value name="namespace">
              <shadow type="text" />
            </value>
          </block>
          <block type="oh_store_meta_config" v-if="isGraalJs">
            <value name="value">
              <shadow type="text" />
            </value>
            <value name="configKey">
              <shadow type="text" />
            </value>
            <value name="theItem">
              <shadow type="oh_item" />
            </value>
            <value name="namespace">
              <shadow type="text" />
            </value>
          </block>
          <block type="oh_item" />
          <sep gap="48" />
          <block type="oh_getthing_state">
            <value name="thingUid">
              <shadow type="oh_thing" />
            </value>
          </block>
          <block type="oh_getthing_attribute">
            <value name="thing">
              <shadow type="oh_getthing">
                <value name="thingUid">
                  <shadow type="oh_thing" />
                </value>
              </shadow>
            </value>
          </block>
          <block type="oh_getthing">
            <value name="thingUid">
              <shadow type="oh_thing" />
            </value>
          </block>
          <block type="oh_getthings" />
          <block type="oh_thing" />
        </category>

        <category name="Timers &amp; Delays">
          <button
            helpUrl="configuration/blockly/rules-blockly-timers-and-delays.html"
            text="Help"
            callbackKey="ohBlocklyHelp" />
          <block type="oh_sleep" />
          <sep gap="48" />
          <block type="oh_timer">
            <value name="delay">
              <shadow type="math_number">
                <field name="NUM">10</field>
              </shadow>
            </value>
            <value name="timerName">
              <shadow type="text">
                <field name="TEXT">MyTimer</field>
              </shadow>
            </value>
          </block>
          <block type="oh_timer_ext">
            <value name="delay">
              <shadow type="math_number">
                <field name="NUM">10</field>
              </shadow>
            </value>
            <value name="timerName">
              <shadow type="text">
                <field name="TEXT">MyTimer</field>
              </shadow>
            </value>
          </block>
          <block type="oh_timer_context" v-if="isGraalJs" />
          <block type="oh_timer_cancel">
            <value name="timerName">
              <shadow type="text">
                <field name="TEXT">MyTimer</field>
              </shadow>
            </value>
          </block>
          <block type="oh_timer_reschedule">
            <value name="timerName">
              <shadow type="text">
                <field name="TEXT">MyTimer</field>
              </shadow>
            </value>
            <value name="delay">
              <shadow type="math_number">
                <field name="NUM">10</field>
              </shadow>
            </value>
          </block>
          <block type="oh_timer_isActive">
            <value name="timerName">
              <shadow type="text">
                <field name="TEXT">MyTimer</field>
              </shadow>
            </value>
          </block>
          <block type="oh_timer_isRunning">
            <value name="timerName">
              <shadow type="text">
                <field name="TEXT">MyTimer</field>
              </shadow>
            </value>
          </block>
          <block type="oh_timer_hasTerminated">
            <value name="timerName">
              <shadow type="text">
                <field name="TEXT">MyTimer</field>
              </shadow>
            </value>
          </block>
        </category>

        <category name="Voice &amp; Multimedia">
          <button
            helpUrl="configuration/blockly/rules-blockly-voice-and-multimedia.html"
            text="Help"
            callbackKey="ohBlocklyHelp" />
          <block type="oh_playmedia_sink">
            <value name="fileName">
              <shadow type="text">
                <field name="TEXT">doorbell.mp3</field>
              </shadow>
            </value>
            <value name="sinkName">
              <shadow type="oh_audiosink_dropdown" />
            </value>
          </block>
          <block type="oh_playmedia_sink_volume">
            <value name="fileName">
              <shadow type="text">
                <field name="TEXT">doorbell.mp3</field>
              </shadow>
            </value>
            <value name="sinkName">
              <shadow type="oh_audiosink_dropdown" />
            </value>
            <value name="volume">
              <shadow type="oh_volumeslider">
                <field name="volume">50</field>
              </shadow>
            </value>
          </block>
          <block type="oh_playstream_sink">
            <value name="url">
              <shadow type="text">
                <field name="TEXT">https://example.org/stream.mp3</field>
              </shadow>
            </value>
            <value name="sinkName">
              <shadow type="oh_audiosink_dropdown" />
            </value>
          </block>
          <block type="oh_stopstream_sink">
            <value name="sinkName">
              <shadow type="oh_audiosink_dropdown" />
            </value>
          </block>
          <sep gap="48" />
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
        <category name="Units of Measurement" v-if="isGraalJs">
          <button
            helpUrl="configuration/blockly/rules-blockly-uom.html"
            text="Help"
            callbackKey="ohBlocklyHelp" />
          <block type="oh_quantity">
            <value name="quantity">
              <shadow type="text">
                <field name="TEXT">10 W</field>
              </shadow>
            </value>
          </block>
          <block type="oh_quantity_ext">
            <value name="value">
              <shadow type="text">
                <field name="TEXT">10</field>
              </shadow>
            </value>
            <value name="unit">
              <shadow type="text">
                <field name="TEXT">W</field>
              </shadow>
            </value>
          </block>
          <block type="oh_quantity_arithmetic">
            <value name="first">
              <shadow type="oh_quantity" />
            </value>
            <value name="second">
              <shadow type="oh_quantity" />
            </value>
          </block>
          <block type="oh_quantity_compare">
            <value name="first">
              <shadow type="oh_quantity" />
            </value>
            <value name="second">
              <shadow type="oh_quantity" />
            </value>
          </block>
          <block type="oh_quantity_to_unit">
            <value name="quantity">
              <shadow type="oh_quantity" />
            </value>
            <value name="unit">
              <shadow type="text">
                <field name="TEXT">kW</field>
              </shadow>
            </value>
          </block>
        </category>
        <category name="Dates &amp; Times">
          <button
            helpUrl="configuration/blockly/rules-blockly-date-handling.html"
            text="Help"
            callbackKey="ohBlocklyHelp" />
          <block type="oh_zdt_now" />
          <block type="oh_zdt_plusminus">
            <value name="offset">
              <shadow type="math_number">
                <field name="NUM">0</field>
              </shadow>
            </value>
          </block>
          <block type="oh_zdt" />
          <block type="oh_zdt_fromText">
            <value name="day">
              <shadow type="text">
                <field name="TEXT">{{ new Date().toISOString().split('T')[0] }}</field>
              </shadow>
            </value>
          </block>
          <block type="oh_zdt_create">
            <value name="year">
              <shadow type="math_number">
                <field name="NUM">2005</field>
              </shadow>
            </value>
            <value name="month">
              <shadow type="math_number">
                <field name="NUM">04</field>
              </shadow>
            </value>
            <value name="day">
              <shadow type="math_number">
                <field name="NUM">12</field>
              </shadow>
            </value>
            <value name="hour">
              <shadow type="math_number">
                <field name="NUM">23</field>
              </shadow>
            </value>
            <value name="minute">
              <shadow type="math_number">
                <field name="NUM">10</field>
              </shadow>
            </value>
            <value name="second">
              <shadow type="math_number">
                <field name="NUM">58</field>
              </shadow>
            </value>
          </block>
          <sep gap="48" />
          <block type="oh_zdt_amend">
            <value name="baseZdt">
              <shadow type="oh_zdt" />
            </value>
          </block>
          <block type="oh_zdt_temporal_unit" />
          <block type="oh_zdt_temporal_unit_input" />
          <sep gap="48" />
          <block type="oh_zdt_fromItem">
            <value name="itemName">
              <shadow type="oh_item" />
            </value>
          </block>
          <block type="oh_zdt_toText">
            <value name="date">
              <shadow type="oh_zdt" />
            </value>
          </block>
          <sep gap="48" />
          <block type="oh_zdt_compare">
            <value name="zdtOne">
              <shadow type="oh_zdt" />
            </value>
            <value name="zdtTwo">
              <shadow type="oh_zdt" />
            </value>
          </block>
          <block type="oh_zdt_between">
            <value name="zdtOne">
              <shadow type="oh_zdt" />
            </value>
            <value name="zdtTwo">
              <shadow type="oh_zdt" />
            </value>
            <value name="zdtThree">
              <shadow type="oh_zdt" />
            </value>
          </block>
          <sep gap="48" />
          <block type="oh_get_zdt_part">
            <value name="zdt">
              <shadow type="oh_zdt" />
            </value>
          </block>
          <block type="oh_get_time_between">
            <value name="zdtOne">
              <shadow type="oh_zdt" />
            </value>
            <value name="zdtTwo">
              <shadow type="oh_zdt" />
            </value>
          </block>
          <sep gap="48" />
          <block type="oh_dayoffset_today" />
          <block type="oh_dayoffset">
            <value name="offset">
              <shadow type="math_number">
                <field name="NUM">
                  0
                </field>
              </shadow>
            </value>
          </block>
        </category>

        <category name="Ephemeris">
          <button
            helpUrl="configuration/blockly/rules-blockly-ephemeris.html"
            text="Help"
            callbackKey="ohBlocklyHelp" />
          <block type="oh_ephemeris_check">
            <value name="dayInfo">
              <shadow type="oh_dayoffset_today" />
            </value>
          </block>
          <block type="oh_ephemeris_getHolidayName">
            <value name="dayInfo">
              <shadow type="oh_dayoffset_today" />
            </value>
          </block>
          <block type="oh_ephemeris_getDaysUntilHoliday">
            <value name="holidayName">
              <shadow type="text">
                <field name="TEXT">CHRISTMAS</field>
              </shadow>
            </value>
          </block>
        </category>

        <category name="Notifications">
          <button
            helpUrl="configuration/blockly/rules-blockly-notifications.html"
            text="Help"
            callbackKey="ohBlocklyHelp" />
          <block type="oh_sendNotification">
            <value name="email">
              <shadow type="text">
                <field name="TEXT">test@example.org</field>
              </shadow>
            </value>
            <value name="message">
              <shadow type="text">
                <field name="TEXT">message</field>
              </shadow>
            </value>
          </block>
          <block type="oh_sendBroadcastNotification">
            <value name="message">
              <shadow type="text">
                <field name="TEXT">message</field>
              </shadow>
            </value>
            <value name="icon">
              <shadow type="text">
                <field name="TEXT">temperature_cold</field>
              </shadow>
            </value>
          </block>
          <block type="oh_sendLogNotification">
            <value name="message">
              <shadow type="text">
                <field name="TEXT">message</field>
              </shadow>
            </value>
            <value name="icon">
              <shadow type="text">
                <field name="TEXT">temperature_hot</field>
              </shadow>
            </value>
          </block>
        </category>

        <category name="Persistence">
          <button
            helpUrl="configuration/blockly/rules-blockly-persistence.html"
            text="Help"
            callbackKey="ohBlocklyHelp" />
          <block type="oh_zdt_plusminus">
            <value name="offset">
              <shadow type="math_number">
                <field name="NUM">1</field>
              </shadow>
            </value>
          </block>
          <block type="oh_zdt" />
          <block type="oh_zdt_fromText">
            <value name="day">
              <shadow type="text">
                <field name="TEXT">{{ new Date().toISOString().split('T')[0] }}</field>
              </shadow>
            </value>
          </block>
          <block type="oh_zdt_toText">
            <value name="date">
              <shadow type="oh_zdt" />
            </value>
          </block>
          <sep gap="48" />
          <block type="oh_get_persistvalue">
            <value name="itemName">
              <shadow type="oh_item" />
            </value>
            <value name="dayInfo">
              <shadow type="oh_zdt_plusminus">
                <value name="offset">
                  <shadow type="math_number">
                    <field name="NUM">1</field>
                  </shadow>
                </value>
                <field name="period">Hours</field>
                <field name="plusminus">minus</field>
              </shadow>
            </value>
          </block>
          <block type="oh_persist_changed">
            <value name="itemName">
              <shadow type="oh_item" />
            </value>
            <value name="dayInfo">
              <shadow type="oh_zdt_plusminus">
                <value name="offset">
                  <shadow type="math_number">
                    <field name="NUM">1</field>
                  </shadow>
                </value>
                <field name="period">Hours</field>
                <field name="plusminus">minus</field>
              </shadow>
            </value>
          </block>
          <block type="oh_get_persistence_lastupdate">
            <value name="itemName">
              <shadow type="oh_item" />
            </value>
          </block>
        </category>

        <category name="Value Storage">
          <button
            helpUrl="configuration/blockly/rules-blockly-value-storage.html"
            text="Help"
            callbackKey="ohBlocklyHelp" />
          <block type="oh_store_value">
            <value name="value">
              <shadow type="text">
                <field name="TEXT">value</field>
              </shadow>
            </value>
            <value name="key">
              <shadow type="text">
                <field name="TEXT">key</field>
              </shadow>
            </value>
          </block>
          <block type="oh_get_value">
            <value name="key">
              <shadow type="text">
                <field name="TEXT">key</field>
              </shadow>
            </value>
          </block>
          <block type="oh_check_undefined_value">
            <value name="key">
              <shadow type="text">
                <field name="TEXT">key</field>
              </shadow>
            </value>
          </block>
        </category>
        <category name="HTTP" v-if="isGraalJs">
          <button
            helpUrl="configuration/blockly/rules-blockly-http.html"
            text="Help"
            callbackKey="ohBlocklyHelp" />
          <block type="oh_httprequest">
            <value name="url">
              <shadow type="text">
                <field name="TEXT">http://openhab.org</field>
              </shadow>
            </value>
          </block>
        </category>
        <category name="Run &amp; Process">
          <button
            helpUrl="configuration/blockly/rules-blockly-run-and-process.html"
            text="Help"
            callbackKey="ohBlocklyHelp" />
          <block type="oh_callscriptfile">
            <value name="scriptfile">
              <shadow type="text">
                <field name="TEXT">scriptname.script</field>
              </shadow>
            </value>
          </block>
          <block type="oh_runrule">
            <value name="ruleUID">
              <shadow type="text">
                <field name="TEXT">ruleUID</field>
              </shadow>
            </value>
            <value name="parameters">
              <block type="dicts_create_with">
                <mutation items="0" />
              </block>
            </value>
          </block>
          <sep gap="48" />
          <block type="oh_context_info" />
          <block type="oh_context_attribute">
            <value name="key">
              <shadow type="text">
                <field name="TEXT">key</field>
              </shadow>
            </value>
          </block>
          <sep gap="48" />
          <block type="oh_transformation">
            <value name="function">
              <shadow type="text">
                <field name="TEXT">function</field>
              </shadow>
            </value>
            <value name="value">
              <shadow type="text">
                <field name="TEXT">value</field>
              </shadow>
            </value>
          </block>
          <sep gap="48" />
          <block type="oh_script_inline" />
        </category>

        <category name="Logging &amp; Output">
          <button
            helpUrl="configuration/blockly/rules-blockly-logging.html"
            text="Help"
            callbackKey="ohBlocklyHelp" />
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

      <category name="Typed Variables" colour="%{BKY_VARIABLES_HUE}" custom="CREATE_TYPED_VARIABLE" />
      <category name="Variables" colour="%{BKY_VARIABLES_HUE}" custom="VARIABLE" />
      <category name="Functions" colour="%{BKY_PROCEDURES_HUE}" custom="PROCEDURE" />
      <category :name="libraryDefinitions ? 'This Library' : 'Libraries'" colour="gray" ref="libraryCategory" />
    </xml>
  </div>
</template>

<style lang="stylus">
.blockly-editor
  display block
  top calc(100%)
  height calc(100%)
  width 100%
  .blockly
    height 100%
    .blocklyMainBackground
      stroke inherit
.blocklyDropDownDiv
  z-index 9000
.blockly-ws-search
  background var(--blockly-ws-search-bg-color)
  border-color var(--blockly-ws-search-border-color)
  box-shadow none
  color var(--blockly-ws-search-text-color)
textarea.blocklyHtmlTextAreaInput
  background #ffffff
  color #000000
</style>

<script>
import Blockly from 'blockly'
import { WorkspaceSearch } from '@blockly/plugin-workspace-search'
import { javascriptGenerator } from 'blockly/javascript.js'
import DarkTheme from '@blockly/theme-dark'
import { ZoomToFitControl } from '@blockly/zoom-to-fit'
import { shadowBlockConversionChangeListener } from '@blockly/shadow-block-converter'
import { Multiselect, MultiselectBlockDragger } from '@mit-app-inventor/blockly-plugin-workspace-multiselect'
import { TypedVariableModal } from '@blockly/plugin-typed-variable-modal'

import Vue from 'vue'

import defineOHBlocks from '@/assets/definitions/blockly'
import { defineLibraryToolboxCategory } from '@/assets/definitions/blockly/libraries'

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
  props: ['blocks', 'libraryDefinitions', 'isGraalJs'],
  data () {
    return {
      blockLibraries: null,
      workspace: null,
      sinks: [],
      voices: [],
      scripts: [],
      rules: [],
      persistenceServices: [],
      loading: true,
      ready: false
    }
  },
  watch: {
    isGraalJs: function () {
      this.initBlockly(this.blockLibraries)
    }
  },
  computed: {
    cssVars () {
      return {
        '--blockly-ws-search-bg-color': this.$f7.data.themeOptions.dark === 'dark' ? '#1e1e1e' : 'white',
        '--blockly-ws-search-border-color': this.$f7.data.themeOptions.dark === 'dark' ? 'lightgrey' : 'grey',
        '--blockly-ws-search-text-color': this.$f7.data.themeOptions.dark === 'dark' ? 'white' : 'black'
      }
    }
  },
  mounted () {
    this.load()
    this.$emit('mounted')
  },
  methods: {
    load () {
      const dataPromises = [
        this.$oh.api.get('/rest/rules?summary=true'),
        this.$oh.api.get('/rest/audio/sinks'),
        this.$oh.api.get('/rest/voice/voices'),
        this.libraryDefinitions ? Promise.resolve(this.libraryDefinitions) : this.$oh.api.get('/rest/ui/components/ui:blocks'),
        this.$oh.api.get('/rest/persistence')
      ]
      Promise.all(dataPromises)
        .then((data) => {
          // fetch rules
          const rules = data[0].sort((a, b) => {
            const labelA = a.name
            const labelB = b.name
            return labelA.localeCompare(labelB)
          })
          this.rules = rules.filter(
            (r) => !r.tags || r.tags.indexOf('Script') < 0
          )
          this.scripts = rules.filter(
            (r) => r.tags && r.tags.indexOf('Script') >= 0
          )

          this.sinks = data[1].sort((a, b) => {
            const labelA = a.label
            const labelB = b.label
            return labelA.localeCompare(labelB)
          })

          this.voices = data[2].sort((a, b) => {
            const labelA = a.label
            const labelB = b.label
            return labelA.localeCompare(labelB)
          })

          this.blockLibraries = data[3]

          this.persistenceServices = data[4].sort((a, b) => {
            const labelA = a.label
            const labelB = b.label
            return labelA.localeCompare(labelB)
          })

          this.initBlockly(this.blockLibraries)
        })
        .catch((err, status) => {
          console.error('Error while retrieving Blockly data - ' + err + ':' + status)
        })
    },
    initBlockly (libraryDefinitions) {
      defineOHBlocks(this.$f7, libraryDefinitions, {
        sinks: this.sinks,
        voices: this.voices,
        persistenceServices: this.persistenceServices
      }, this.isGraalJs)
      this.addLibraryToToolbox(libraryDefinitions || [])

      const options = {
        toolbox: this.$refs.toolbox,
        plugins: {
          'blockDragger': MultiselectBlockDragger
        },
        horizontalLayout: !this.$device.desktop,
        theme: this.$f7.data.themeOptions.dark === 'dark' ? DarkTheme : undefined,
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
          pinch: true
        },
        move: {
          drag: true,
          wheel: true
        },
        trashcan: false,
        showLabels: false,

        // Multi-select-options
        multiselectCopyPaste: {
          crossTab: true,
          menu: true
        },
        multiselectIcon: {
          hideIcon: true // hide it because it doesn't work in v0.1.11
        },
        multiFieldUpdate: true,

        renderer: this.getCurrentRenderer()
      }
      this.workspace = Blockly.inject(this.$refs.blocklyEditor, options)
      this.workspace.addChangeListener(shadowBlockConversionChangeListener)
      const workspaceSearch = new WorkspaceSearch(this.workspace)
      workspaceSearch.init()

      const createFlyout = function (workspace) {
        let xmlList = []
        const button = document.createElement('button')
        button.setAttribute('text', 'Create Typed Variable: Do not forget to choose the type!')
        button.setAttribute('callbackKey', 'callbackName')
        xmlList.push(button)

        const blockList = Blockly.VariablesDynamic.flyoutCategoryBlocks(workspace)
        xmlList = xmlList.concat(blockList)
        return xmlList
      }
      this.workspace.registerToolboxCategoryCallback(
        'CREATE_TYPED_VARIABLE',
        createFlyout
      )
      const typedVarModal = new TypedVariableModal(this.workspace, 'callbackName', [
        ['Item name', 'oh_item'],
        ['Item object', 'oh_itemtype'],
        ['Thing name', 'oh_thing'],
        ['Thing object', 'oh_thingtype'],
        ['Quantity', 'oh_quantity'],
        ['String', 'String'],
        ['Number', 'Number'],
        ['Dictionary', 'Dictionary'],
        ['Colour', 'Colour']
      ])

      typedVarModal.init()

      Blockly.utils.colour.setHsvSaturation(0.45) // default
      Blockly.utils.colour.setHsvValue(0.65) // a little bit more contrast for the different colors

      const zoomToFit = new ZoomToFitControl(this.workspace)
      zoomToFit.init()

      const multiselectPlugin = new Multiselect(this.workspace)
      multiselectPlugin.init(options)

      this.registerLibraryCallbacks(libraryDefinitions)
      const xml = Blockly.utils.xml.textToDom(this.blocks)
      Blockly.Xml.domToWorkspace(xml, this.workspace)
      this.workspace.addChangeListener(this.onChange)

      this.workspace.helpurlPrefix = (this.$store.state.runtimeInfo.buildString === 'Release Build') ? 'next' : 'www'
      this.workspace.registerButtonCallback('ohBlocklyHelp', function (button) {
        window.open(`https://${button.targetWorkspace.helpurlPrefix}.openhab.org/docs/${button.info.helpurl}`, '_blank')
      })
      Blockly.Workspace.prototype.refresh = function () {
        const xml = Blockly.Xml.workspaceToDom(this)
        this.clear()
        Blockly.Xml.domToWorkspace(xml, this)
        this.refreshToolboxSelection()
      }
    },
    addLibraryToToolbox (definitions) {
      const library = this.$refs.libraryCategory
      definitions.sort((a, b) => (a.config.name || a.uid).localeCompare(b.config.name || b.uid)).forEach((definition) => {
        const category = document.createElement('category')
        category.setAttribute('name', definition.config.name)
        category.setAttribute('custom', 'LIBRARY_' + definition.uid)
        library.appendChild(category)
      })
    },
    registerLibraryCallbacks (definitions) {
      definitions.forEach((definition) => {
        this.workspace.registerToolboxCategoryCallback('LIBRARY_' + definition.uid, defineLibraryToolboxCategory(definition, this.$f7))
      })
    },
    showHideLabels (showLabels) {
      this.workspace.showLabels = showLabels
      this.workspace.refresh()
    },
    getBlocks () {
      const xml = Blockly.Xml.workspaceToDom(this.workspace)
      return Blockly.Xml.domToText(xml)
    },
    getCode () {
      return javascriptGenerator.workspaceToCode(this.workspace)
    },
    getRenderers () {
      const excludedRenderers = ['minimalist']
      const renderers = Object.keys(Blockly.registry.getAllItems('renderer'))
        .filter(r => !excludedRenderers.includes(r))
        .sort()
      return renderers
    },
    getCurrentRenderer () {
      return this.$f7.data.themeOptions.blocklyRenderer
    },
    changeRenderer (newRenderer) {
      this.$f7.data.themeOptions.blocklyRenderer = newRenderer
      localStorage.setItem('openhab.ui:blockly.renderer', newRenderer)

      const dom = Blockly.Xml.workspaceToDom(this.workspace)
      this.workspace.dispose()
      this.initBlockly(this.blockLibraries)
      this.workspace.clear()
      Blockly.Xml.domToWorkspace(dom, this.workspace)
      this.workspace.refreshToolboxSelection()
    },
    onChange (event) {
      if (event.type === Blockly.Events.FINISHED_LOADING) {
        this.loading = false
      } else if (!this.loading && !event.isUiEvent) {
        this.$emit('change')
      }
    }
  }
}
</script>
