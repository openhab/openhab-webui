---
title: oh-button - Button
component: oh-button
label: Button
description: Button performing an action
source: https://github.com/openhab/openhab-webui/edit/main/bundles/org.openhab.ui/doc/components/oh-button.md
---

<style>

ul.prop {
  background-color: rgba(230,72,25,0.3); 
  border-radius: 5px 5px 0px 0px;
  list-style-type: none;
  padding: 5px;
  margin-bottom: 0px;
}

.options {
  background-color: rgb(250,250,252);
  border-radius: 0px 0px 5px 5px;
	display: flex;
	flex-wrap: wrap;
  margin-bottom: 15px;
}

.options .item {
	flex: 1 0 400px;
  box-sizing: border-box;
  /* background: #e0ddd5; */
}

.options .item code {
  background-color: white;
  margin: 5px;
}

.options .fullw {
  width: 100%;
  box-sizing: border-box;
  margin: 5px;
}

@media (min-width: 410px) {
  .options .item {
    max-width: calc(100% - 5px);
  }
}
@media (min-width: 620px) {
  .options .item {
    max-width: calc(50% - 10px);
  }
}
@media (min-width: 830px) {
  .options .item {
    max-width: calc(50% - 10px);
  }
}
@media (min-width: 1040px) {
  .options .item {
    max-width: calc(33% - 10px);
  }
}
@media (min-width: 1250px) {
  .options .item {
    max-width: calc(25% - 10px);
  }
}
@media (min-width: 1460px) {
  .options .item {
    max-width: calc(20% - 10px);
  }
}
</style>




# oh-button - Button

<!-- GENERATED componentDescription -->
Button performing an action
<!-- GENERATED /componentDescription -->

<a href="#header">![oh-button header](./images/oh-button/header.png)</a>

[[toc]]

## Usage / reference documents

* The `oh-button` component is based upon the [Framework 7 v5 Vue button control (`f7-button`)](https://v5.framework7.io/vue/button.html).
* Component styles are applied by the [Framework 7 CSS variables](https://v5.framework7.io/docs/button.html#css-variables).  For guidance on how to customise styles see the [CSS Styles](https://openhab.org/docs/ui/building-pages.html#css-variables) section.  
* Use the [`f7-segmented`](#f7-segmented) wrapper component to group buttons together.  Buttons with the property  `active: true` set will be highlighted/marked as selected.

### Slots
There are no slots supported by this control.

## Configuration

### General / Style

<!-- GENERATED props -->

<ul class="prop"><li><code>text</code> <b>Text:</b> Button label</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>round</code> <b>Round:</b> Makes button round</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>BOOLEAN</code></div>
</div>

<ul class="prop"><li><code>large</code> <b>Large:</b> Makes button large</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>BOOLEAN</code></div>
</div>

<ul class="prop"><li><code>small</code> <b>Small:</b> Makes button small</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>BOOLEAN</code></div>
</div>

<ul class="prop"><li><code>fill</code> <b>Fill:</b> Makes button filled with color</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>BOOLEAN</code></div>
</div>

<ul class="prop"><li><code>raised</code> <b>Raised:</b> Makes button raised</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>BOOLEAN</code></div>
</div>

<ul class="prop"><li><code>outline</code> <b>Outline:</b> Makes button outline</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>BOOLEAN</code></div>
</div>

<ul class="prop"><li><code>active</code> <b>Active:</b> Button is active (when part of a f7-segmented</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>iconF7</code> <b>Icon:</b> Framework7 icon to display (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>)</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>iconMaterial</code> <b>Icon:</b> Material design icon to display</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>iconColor</code> <b>Icon Color:</b> Not applicable to openHAB icons</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>iconSize</code> <b>Icon Size:</b> Size of the icon in px</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>INTEGER</code></div>
</div>

<ul class="prop"><li><code>tooltip</code> <b>Tooltip:</b> Button tooltip text to show on button hover/press</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>variable</code> <b>Variable:</b> Name of the variable to set on input change</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>clearVariable</code> <b>Clear Variable After Action:</b> Name of the variable to clear after performing the action</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>BOOLEAN</code></div>
</div>

### Action

Action to perform when the element is clicked


<ul class="prop"><li><code>action</code> <b>Action:</b> Type of action to perform</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code> using the following options:</div>
  <div class="item">
    <code>navigate</code> Navigate to page
  </div>
  <div class="item">
    <code>command</code> Send command
  </div>
  <div class="item">
    <code>toggle</code> Toggle item
  </div>
  <div class="item">
    <code>options</code> Command options
  </div>
  <div class="item">
    <code>rule</code> Run rule
  </div>
  <div class="item">
    <code>popup</code> Open popup
  </div>
  <div class="item">
    <code>popover</code> Open popover
  </div>
  <div class="item">
    <code>sheet</code> Open sheet
  </div>
  <div class="item">
    <code>photos</code> Open photo browser
  </div>
  <div class="item">
    <code>group</code> Group details
  </div>
  <div class="item">
    <code>analyzer</code> Analyze item(s)
  </div>
  <div class="item">
    <code>url</code> External URL
  </div>
  <div class="item">
    <code>variable</code> Set Variable
  </div>
</div>

</div>

<ul class="prop"><li><code>actionUrl</code> <b>Action URL:</b> URL to navigate to</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>actionUrlSameWindow</code> <b>Open in same tab/window:</b> Open the URL in the same tab/window instead of a new one. This will exit the app.</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>BOOLEAN</code></div>
</div>

<ul class="prop"><li><code>actionItem</code> <b>Action Item:</b> Item to perform the action on</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>actionCommand</code> <b>Action Command:</b> Command to send to the item. If "toggle item" is selected as the action, only send the command when the state is different</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>actionCommandAlt</code> <b>Action Toggle Command:</b> Command to send to the item when "toggle item" is selected as the action, and the item's state is equal to the command above</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>actionOptions</code> <b>Command Options:</b> Comma-separated list of options; if omitted, retrieve the command options from the item dynamically. Use <code>value=label</code> format to provide a label different than the option.</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>actionRule</code> <b>Rule:</b> Rule to run</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>actionPage</code> <b>Page:</b> Page to navigate to</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>actionPageTransition</code> <b>Transition Effect:</b> Use a specific <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/view.html#custom-page-transitions">page transition animation</a></li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code> using the following options:</div>
  <div class="item">
    <code>f7-circle</code> Circle
  </div>
  <div class="item">
    <code>f7-cover</code> Cover
  </div>
  <div class="item">
    <code>f7-cover-v</code> Cover from bottom
  </div>
  <div class="item">
    <code>f7-dive</code> Dive
  </div>
  <div class="item">
    <code>f7-fade</code> Fade
  </div>
  <div class="item">
    <code>f7-flip</code> Flip
  </div>
  <div class="item">
    <code>f7-parallax</code> Parallax
  </div>
  <div class="item">
    <code>f7-push</code> Push
  </div>
</div>

</div>

<ul class="prop"><li><code>actionModal</code> <b>Modal Page or Widget:</b> Page or widget to display in the modal</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>actionModalConfig</code> <b>Modal component configuration:</b> Configuration (prop values) for the target modal page or widget</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>actionPhotos</code> <b>Images to show:</b> Array of URLs or objects representing the images. Auto-refresh is not supported.<br />Edit in YAML or provide a JSON array, e.g.<br /><code>[ "url1", { "item": "ImageItem1", "caption": "Camera" } ]</code><br />Objects are in the <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/photo-browser.html#photos-array">photos array format</a> with an additional <code>item</code> property to specify an item to view.</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>actionPhotoBrowserConfig</code> <b>Photo browser configuration:</b> Configuration for the photo browser.<br />Edit in YAML or provide a JSON object, e.g.<br /><code>{ "exposition": false, "type": "popup", "theme": "dark" }</code><br /> See <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/photo-browser.html#photo-browser-parameters">photo browser parameters</a> (not all are supported).</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>actionGroupPopupItem</code> <b>Group Popup Item:</b> Group item whose members to show in a popup</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>actionAnalyzerItems</code> <b>Item(s) to Analyze:</b> Start analyzing with the specified (set of) item(s)</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>actionAnalyzerChartType</code> <b>Chart Type:</b> The initial analyzing period - dynamic or a predefined fixed period: day, week, month or year</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code> using the following options:</div>
  <div class="item">
    <code>(empty)</code> Dynamic
  </div>
  <div class="item">
    <code>day</code> Day
  </div>
  <div class="item">
    <code>isoWeek</code> Week (starting on Mondays)
  </div>
  <div class="item">
    <code>month</code> Month
  </div>
  <div class="item">
    <code>year</code> Year
  </div>
</div>

</div>

<ul class="prop"><li><code>actionAnalyzerCoordSystem</code> <b>Initial Coordinate System:</b> The initial coordinate system of the analyzer - time, aggregate or calendar (only time is supported for dynamic periods)</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code> using the following options:</div>
  <div class="item">
    <code>time</code> Time
  </div>
  <div class="item">
    <code>aggregate</code> Aggregate
  </div>
  <div class="item">
    <code>calendar</code> Calendar
  </div>
</div>

</div>

<ul class="prop"><li><code>actionFeedback</code> <b>Action feedback:</b> Shows a toast popup when the action has been executed. Can either be a text to show or a JSON object including some of the <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/toast.html#toast-parameters">supported parameters</a></li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>actionVariable</code> <b>Variable:</b> The variable name to set</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<ul class="prop"><li><code>actionVariableValue</code> <b>Variable Value:</b> The value to set the variable to</li></ul>
<div class="options">
  <div class="fullw">Data type: <code>TEXT</code></div>
</div>

<!-- GENERATED /props -->

### Inherited Properties
The configuration is passed to the underlying `f7-button` component from Framework7 v5.  All compatible scalar [properties](https://v5.framework7.io/vue/button.html#button-properties) (except functions) not listed above are available for use.

## Examples
### Header Image Source Code

<!-- BOOKMARKS to this example -->
<div id="text">
<div id="round">
<div id="large"></div>
<div id="small"></div>
<div id="filled"></div>
<div id="raised"></div>
<div id="outline"></div>
<div id="active"></div>
<div id="iconf7"></div>
<div id="iconMaterial"></div>
<div id="iconColor"></div>
<div id="iconSize"></div>
<div id="tooltip"></div>
<div id="variable"></div>
<div id="clearVariable"></div>
<div id="f7-segemented"></div>

This example code generates the example button image used at the top of this page:

::: Click to view the source code:

```yaml
uid: oh-button
tags: []
timestamp: Feb 9, 2021, 5:42:56 PM
component: f7-card
config:
  title: oh-button
slots:
  default:
    - component: f7-block
      config:
        class: bog
        style:
          display: flex
          flex-wrap: wrap
          justify-content: space-between
          align-content: space-between
          height: 230px
          padding-bottom: 20px
      slots:
        default:
          - component: oh-button
            config:
              width: 400px
              text: Basic button
          - component: oh-button
            config:
              width: 400px
              text: Rounded + Outline
              round: true
              outline: true
          - component: oh-button
            config:
              text: Large
              outline: true
              large: true
              grid-colum: 3
              grid-row: 1
          - component: oh-button
            config:
              text: Small + Outline
              outline: true
              small: true
          - component: oh-button
            config:
              text: Filled
              fill: true
          - component: oh-button
            config:
              text: Raised
              fill: true
              raised: true
          - component: oh-button
            config:
              text: Outline
              outline: true
          - component: oh-button
            config:
              text: f7 icon
              iconF7: arrow_right_arrow_left_square_fill
              tooltip: Click to view f7 icons
              action: url
              actionUrl: https://framework7.io/icons/
          - component: oh-button
            config:
              text: Material icon
              iconMaterial: fingerprint
              tooltip: Click to view Material icons
              action: url
              actionUrl: https://material.io/resources/icons/
          - component: oh-button
            config:
              text: Icon color
              iconMaterial: power_settings_new
              iconColor: green
          - component: oh-button
            config:
              text: 40px icon, with custom button height to fit it!
              outline: true
              fill: true
              iconMaterial: report_problem
              iconSize: 40
              style:
                height: 80px
                width: 300px
                white-space: normal
          - component: oh-button
            config:
              text: Tooltip - hover over me
              tooltip: Don't Panic
          - component: oh-button
            config:
              text: Set variable 'myVariable'
              variable: myVariable
              action: variable
              actionVariable: myVariable
              actionVariableValue: 1
          - component: oh-button
            config:
              text: Clear variable 'myVariable'
              clearVariable: myVariable
              action: variable
              actionVariable: myVariable
          - component: f7-segmented
            slots:
              default:
                - component: oh-button
                  config:
                    text: Option 1
                    outline: true
                    style:
                      width: 200px
                - component: oh-button
                  config:
                    text: Option 2 (Active)
                    outline: true
                    active: true
                    style:
                      width: 200px
                - component: oh-button
                  config:
                    text: Option 3
                    outline: true
                    style:
                      width: 200px
```

:::

### action: variable
<!-- BOOKMARKS to this example -->
<div id="action-variable"></div>

![Coming soon](./images/examplerequired.png)

Example required:

::: Click to view the source code:

```yaml
Source code does here. 
```

:::

### Community posts
The following posts contain great examples of the use of this control:
* [BoGoB: Big Ol' Grid O' Buttons](https://community.openhab.org/t/bogob-big-ol-grid-o-buttons-is-this-even-possible-yes-yes-it-is/115343/7?u=andymb) - using the `oh-button` and `oh-repeater` objects together with YAML arrays to create large grids of buttons (emulating remote control operation).
