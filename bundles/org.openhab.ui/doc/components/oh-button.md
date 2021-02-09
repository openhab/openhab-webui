---
title: oh-button - Button
component: oh-button
label: Button
description: Button performing an action
source: https://github.com/openhab/openhab-webui/edit/main/bundles/org.openhab.ui/doc/components/oh-button.md
---

# oh-button - Button



<!-- GENERATED componentDescription -->
Button performing an action
<!-- GENERATED /componentDescription -->

<a href="#header">![oh-button header](./img/oh-button/header.png)</a>

## Usage / reference documents

* The `oh-button` component is based upon the [Framework 7 Vue button control (`f7-button`)](https://framework7.io/vue/button.html).
* The standard `f7-button` capabilities are enhanced by the addition of specific actions to provide user interface functionality / work with openHAB objects etc. 
* Component style is applied by the [Framework 7 CSS variables](https://framework7.io/docs/button.html#css-variables).
* Use the [`f7-segmented`](#f7-segmented) wrapper component to group buttons together.  Buttons with the property  `active: true` set will be highlighted/marked as selected.

### Slots
There are no slots supported by this control.

## Configuration

### General / Style
<!-- GENERATED props -->

| `Property name`<br>Data type | Label | Description | <div width=200px>Options</div> |
|:---|:---|:----|:----|
| <a href="#text">`text`</a><br>TEXT | Text | Button label |  |
| <a href="#round">`round`</a><br>BOOLEAN | Round | Makes button round |  `true`<br>`false` |
| <a href="#large">`large`</a><br>BOOLEAN | Large | Makes button large |  `true`<br>`false` |
| <a href="#small">`small`</a><br>BOOLEAN | Small | Makes button small |  `true`<br>`false` |
| <a href="#fill">`fill`</a><br>BOOLEAN | Fill | Makes button filled with color |  `true`<br>`false` |
| <a href="#raised">`raised`</a><br>BOOLEAN | Raised | Makes button raised |  `true`<br>`false` |
| <a href="#outline">`outline`</a><br>BOOLEAN | Outline | Makes button outline |  `true`<br>`false` |
| <a href="#active">`active`</a><br>TEXT | Active | Button is active (when part of a f7-segmented |  |
| <a href="#iconF7">`iconF7`</a><br>TEXT | Icon | Framework7 icon to display (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>) |  |
| <a href="#iconMaterial">`iconMaterial`</a><br>TEXT | Icon | Material design icon to display |  |
| <a href="#iconColor">`iconColor`</a><br>TEXT | Icon Color | Not applicable to openHAB icons |  |
| <a href="#iconSize">`iconSize`</a><br>INTEGER | Icon Size | Size of the icon in px |  |
| <a href="#tooltip">`tooltip`</a><br>TEXT | Tooltip | Button tooltip text to show on button hover/press |  |
| <a href="#variable">`variable`</a><br>TEXT | Variable | Name of the variable to set on input change |  |
| <a href="#clearVariable">`clearVariable`</a><br>BOOLEAN | Clear Variable After Action | Name of the variable to clear after performing the action |  `true`<br>`false` |

### Action

Action to perform when the element is clicked

| `Property name`<br>Data type | Label | Description | Options |
|:---|:---|:----|:----|
| <a href="#action">`action`</a><br>TEXT | Action | Type of action to perform | <a href="#action:navigate">`navigate`&nbsp;</a>Navigate to page<br><a href="#action:command">`command`&nbsp;</a>Send command<br><a href="#action:toggle">`toggle`&nbsp;</a>Toggle item<br><a href="#action:options">`options`&nbsp;</a>Command options<br><a href="#action:rule">`rule`&nbsp;</a>Run rule<br><a href="#action:popup">`popup`&nbsp;</a>Open popup<br><a href="#action:popover">`popover`&nbsp;</a>Open popover<br><a href="#action:sheet">`sheet`&nbsp;</a>Open sheet<br><a href="#action:photos">`photos`&nbsp;</a>Open photo browser<br><a href="#action:group">`group`&nbsp;</a>Group details<br><a href="#action:analyzer">`analyzer`&nbsp;</a>Analyze item(s)<br><a href="#action:url">`url`&nbsp;</a>External URL<br><a href="#action:variable">`variable`&nbsp;</a>Set Variable<br> |
| <a href="#actionUrl">`actionUrl`</a><br>TEXT | Action URL | URL to navigate to |  |
| <a href="#actionUrlSameWindow">`actionUrlSameWindow`</a><br>BOOLEAN | Open in same tab/window | Open the URL in the same tab/window instead of a new one. This will exit the app. |  `true`<br>`false` |
| <a href="#actionItem">`actionItem`</a><br>TEXT | Action Item | Item to perform the action on |  |
| <a href="#actionCommand">`actionCommand`</a><br>TEXT | Action Command | Command to send to the item. If "toggle item" is selected as the action, only send the command when the state is different |  |
| <a href="#actionCommandAlt">`actionCommandAlt`</a><br>TEXT | Action Toggle Command | Command to send to the item when "toggle item" is selected as the action, and the item's state is equal to the command above |  |
| <a href="#actionOptions">`actionOptions`</a><br>TEXT | Command Options | Comma-separated list of options; if omitted, retrieve the command options from the item dynamically. Use <code>value=label</code> format to provide a label different than the option. |  |
| <a href="#actionRule">`actionRule`</a><br>TEXT | Rule | Rule to run |  |
| <a href="#actionPage">`actionPage`</a><br>TEXT | Page | Page to navigate to |  |
| <a href="#actionPageTransition">`actionPageTransition`</a><br>TEXT | Transition Effect | Use a specific <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/view.html#custom-page-transitions">page transition animation</a> | <a href="#actionPageTransition:f7-circle">`f7-circle`&nbsp;</a>Circle<br><a href="#actionPageTransition:f7-cover">`f7-cover`&nbsp;</a>Cover<br><a href="#actionPageTransition:f7-cover-v">`f7-cover-v`&nbsp;</a>Cover from bottom<br><a href="#actionPageTransition:f7-dive">`f7-dive`&nbsp;</a>Dive<br><a href="#actionPageTransition:f7-fade">`f7-fade`&nbsp;</a>Fade<br><a href="#actionPageTransition:f7-flip">`f7-flip`&nbsp;</a>Flip<br><a href="#actionPageTransition:f7-parallax">`f7-parallax`&nbsp;</a>Parallax<br><a href="#actionPageTransition:f7-push">`f7-push`&nbsp;</a>Push<br> |
| <a href="#actionModal">`actionModal`</a><br>TEXT | Modal Page or Widget | Page or widget to display in the modal |  |
| <a href="#actionModalConfig">`actionModalConfig`</a><br>TEXT | Modal component configuration | Configuration (prop values) for the target modal page or widget |  |
| <a href="#actionPhotos">`actionPhotos`</a><br>TEXT | Images to show | Array of URLs or objects representing the images. Auto-refresh is not supported.<br />Edit in YAML or provide a JSON array, e.g.<br /><code>[ "url1", { "item": "ImageItem1", "caption": "Camera" } ]</code><br />Objects are in the <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/photo-browser.html#photos-array">photos array format</a> with an additional <code>item</code> property to specify an item to view. |  |
| <a href="#actionPhotoBrowserConfig">`actionPhotoBrowserConfig`</a><br>TEXT | Photo browser configuration | Configuration for the photo browser.<br />Edit in YAML or provide a JSON object, e.g.<br /><code>{ "exposition": false, "type": "popup", "theme": "dark" }</code><br /> See <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/photo-browser.html#photo-browser-parameters">photo browser parameters</a> (not all are supported). |  |
| <a href="#actionGroupPopupItem">`actionGroupPopupItem`</a><br>TEXT | Group Popup Item | Group item whose members to show in a popup |  |
| <a href="#actionAnalyzerItems">`actionAnalyzerItems`</a><br>TEXT | Item(s) to Analyze | Start analyzing with the specified (set of) item(s) |  |
| <a href="#actionAnalyzerChartType">`actionAnalyzerChartType`</a><br>TEXT | Chart Type | The initial analyzing period - dynamic or a predefined fixed period: day, week, month or year | <a href="#actionAnalyzerChartType:(empty)">`(empty)`&nbsp;</a>Dynamic<br><a href="#actionAnalyzerChartType:day">`day`&nbsp;</a>Day<br><a href="#actionAnalyzerChartType:isoWeek">`isoWeek`&nbsp;</a>Week (starting on Mondays)<br><a href="#actionAnalyzerChartType:month">`month`&nbsp;</a>Month<br><a href="#actionAnalyzerChartType:year">`year`&nbsp;</a>Year<br> |
| <a href="#actionAnalyzerCoordSystem">`actionAnalyzerCoordSystem`</a><br>TEXT | Initial Coordinate System | The initial coordinate system of the analyzer - time, aggregate or calendar (only time is supported for dynamic periods) | <a href="#actionAnalyzerCoordSystem:time">`time`&nbsp;</a>Time<br><a href="#actionAnalyzerCoordSystem:aggregate">`aggregate`&nbsp;</a>Aggregate<br><a href="#actionAnalyzerCoordSystem:calendar">`calendar`&nbsp;</a>Calendar<br> |
| <a href="#actionFeedback">`actionFeedback`</a><br>TEXT | Action feedback | Shows a toast popup when the action has been executed. Can either be a text to show or a JSON object including some of the <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/toast.html#toast-parameters">supported parameters</a> |  |
| <a href="#actionVariable">`actionVariable`</a><br>TEXT | Variable | The variable name to set |  |
| <a href="#actionVariableValue">`actionVariableValue`</a><br>TEXT | Variable Value | The value to set the variable to |  |

<!-- GENERATED /props -->

## Examples
### Header 
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

<details><summary>YAML Source Code:</summary>

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

</details>

### action: variable
<div id="action:variable"></div>

![Coming soon](./img/examplerequired.png)

Example required:
<details><summary>YAML Source Code:</summary>

```yaml
Source code does here. 
```

</details>


### Community posts
The following posts contain great examples of the use of this control:
* [BoGoB: Big Ol' Grid O' Buttons](https://community.openhab.org/t/bogob-big-ol-grid-o-buttons-is-this-even-possible-yes-yes-it-is/115343/7?u=andymb) - using the `oh-button` and `oh-repeater` objects together with YAML arrays to create large grids of buttons (emulating remote control operation).
