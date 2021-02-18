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

[![oh-button header](./images/oh-button/header.png)](#header)</a>

[[toc]]

## Usage / reference documents

* The `oh-button` component is based upon the [Framework 7 v5 Vue button control (`f7-button`)](https://v5.framework7.io/vue/button.html).
* Component styles are applied by the [Framework 7 CSS variables](https://v5.framework7.io/docs/button.html#css-variables).  For guidance on how to customise styles see the [CSS Styles](https://openhab.org/docs/ui/building-pages.html#css-variables) section.  
* Use the [`f7-segmented`](#f7-segmented) wrapper component to group buttons together.  Buttons with the property  `active: true` set will be highlighted/marked as selected.

## Configuration

<!-- GENERATED props -->

### General properties / Style

::: prop-head
- [`text`](#text) **Text** | Data type: TEXT
:::
::: prop-opt
Button label
:::

::: prop-head
- [`round`](#round) **Round** | Data type: BOOLEAN
:::
::: prop-opt
Makes button round
:::

::: prop-head
- [`large`](#large) **Large** | Data type: BOOLEAN
:::
::: prop-opt
Makes button large
:::

::: prop-head
- [`small`](#small) **Small** | Data type: BOOLEAN
:::
::: prop-opt
Makes button small
:::

::: prop-head
- [`fill`](#fill) **Fill** | Data type: BOOLEAN
:::
::: prop-opt
Makes button filled with color
:::

::: prop-head
- [`raised`](#raised) **Raised** | Data type: BOOLEAN
:::
::: prop-opt
Makes button raised
:::

::: prop-head
- [`outline`](#outline) **Outline** | Data type: BOOLEAN
:::
::: prop-opt
Makes button outline
:::

::: prop-head
- [`active`](#active) **Active** | Data type: TEXT
:::
::: prop-opt
Button is active (when part of a f7-segmented
:::

::: prop-head
- [`iconF7`](#iconF7) **Icon** | Data type: TEXT
:::
::: prop-opt
Framework7 icon to display (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>)
:::

::: prop-head
- [`iconMaterial`](#iconMaterial) **Icon** | Data type: TEXT
:::
::: prop-opt
Material design icon to display
:::

::: prop-head
- [`iconColor`](#iconColor) **Icon Color** | Data type: TEXT
:::
::: prop-opt
Not applicable to openHAB icons
:::

::: prop-head
- [`iconSize`](#iconSize) **Icon Size** | Data type: INTEGER
:::
::: prop-opt
Size of the icon in px
:::

::: prop-head
- [`tooltip`](#tooltip) **Tooltip** | Data type: TEXT
:::
::: prop-opt
Button tooltip text to show on button hover/press
:::

::: prop-head
- [`variable`](#variable) **Variable** | Data type: TEXT
:::
::: prop-opt
Name of the variable to set on input change
:::

::: prop-head
- [`clearVariable`](#clearVariable) **Clear Variable After Action** | Data type: BOOLEAN
:::
::: prop-opt
Name of the variable to clear after performing the action
:::

### Action

Action to perform when the element is clicked


::: prop-head
- [`action`](#action) **Action** | Data type: TEXT
:::
::: prop-opt
Type of action to perform
- [`navigate`](#action-navigate) Navigate to page
- [`command`](#action-command) Send command
- [`toggle`](#action-toggle) Toggle item
- [`options`](#action-options) Command options
- [`rule`](#action-rule) Run rule
- [`popup`](#action-popup) Open popup
- [`popover`](#action-popover) Open popover
- [`sheet`](#action-sheet) Open sheet
- [`photos`](#action-photos) Open photo browser
- [`group`](#action-group) Group details
- [`analyzer`](#action-analyzer) Analyze item(s)
- [`url`](#action-url) External URL
- [`variable`](#action-variable) Set Variable
:::

::: prop-head
- [`actionUrl`](#actionUrl) **Action URL** | Data type: TEXT
:::
::: prop-opt
URL to navigate to
:::

::: prop-head
- [`actionUrlSameWindow`](#actionUrlSameWindow) **Open in same tab/window** | Data type: BOOLEAN
:::
::: prop-opt
Open the URL in the same tab/window instead of a new one. This will exit the app.
:::

::: prop-head
- [`actionItem`](#actionItem) **Action Item** | Data type: TEXT
:::
::: prop-opt
Item to perform the action on
:::

::: prop-head
- [`actionCommand`](#actionCommand) **Action Command** | Data type: TEXT
:::
::: prop-opt
Command to send to the item. If "toggle item" is selected as the action, only send the command when the state is different
:::

::: prop-head
- [`actionCommandAlt`](#actionCommandAlt) **Action Toggle Command** | Data type: TEXT
:::
::: prop-opt
Command to send to the item when "toggle item" is selected as the action, and the item's state is equal to the command above
:::

::: prop-head
- [`actionOptions`](#actionOptions) **Command Options** | Data type: TEXT
:::
::: prop-opt
Comma-separated list of options; if omitted, retrieve the command options from the item dynamically. Use <code>value=label</code> format to provide a label different than the option.
:::

::: prop-head
- [`actionRule`](#actionRule) **Rule** | Data type: TEXT
:::
::: prop-opt
Rule to run
:::

::: prop-head
- [`actionPage`](#actionPage) **Page** | Data type: TEXT
:::
::: prop-opt
Page to navigate to
:::

::: prop-head
- [`actionPageTransition`](#actionPageTransition) **Transition Effect** | Data type: TEXT
:::
::: prop-opt
Use a specific <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/view.html#custom-page-transitions">page transition animation</a>
- [`f7-circle`](#actionPageTransition-f7-circle) Circle
- [`f7-cover`](#actionPageTransition-f7-cover) Cover
- [`f7-cover-v`](#actionPageTransition-f7-cover-v) Cover from bottom
- [`f7-dive`](#actionPageTransition-f7-dive) Dive
- [`f7-fade`](#actionPageTransition-f7-fade) Fade
- [`f7-flip`](#actionPageTransition-f7-flip) Flip
- [`f7-parallax`](#actionPageTransition-f7-parallax) Parallax
- [`f7-push`](#actionPageTransition-f7-push) Push
:::

::: prop-head
- [`actionModal`](#actionModal) **Modal Page or Widget** | Data type: TEXT
:::
::: prop-opt
Page or widget to display in the modal
:::

::: prop-head
- [`actionModalConfig`](#actionModalConfig) **Modal component configuration** | Data type: TEXT
:::
::: prop-opt
Configuration (prop values) for the target modal page or widget
:::

::: prop-head
- [`actionPhotos`](#actionPhotos) **Images to show** | Data type: TEXT
:::
::: prop-opt
Array of URLs or objects representing the images. Auto-refresh is not supported.<br />Edit in YAML or provide a JSON array, e.g.<br /><code>[ "url1", { "item": "ImageItem1", "caption": "Camera" } ]</code><br />Objects are in the <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/photo-browser.html#photos-array">photos array format</a> with an additional <code>item</code> property to specify an item to view.
:::

::: prop-head
- [`actionPhotoBrowserConfig`](#actionPhotoBrowserConfig) **Photo browser configuration** | Data type: TEXT
:::
::: prop-opt
Configuration for the photo browser.<br />Edit in YAML or provide a JSON object, e.g.<br /><code>{ "exposition": false, "type": "popup", "theme": "dark" }</code><br /> See <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/photo-browser.html#photo-browser-parameters">photo browser parameters</a> (not all are supported).
:::

::: prop-head
- [`actionGroupPopupItem`](#actionGroupPopupItem) **Group Popup Item** | Data type: TEXT
:::
::: prop-opt
Group item whose members to show in a popup
:::

::: prop-head
- [`actionAnalyzerItems`](#actionAnalyzerItems) **Item(s) to Analyze** | Data type: TEXT (multiple options are allowed)
:::
::: prop-opt
Start analyzing with the specified (set of) item(s)
:::

::: prop-head
- [`actionAnalyzerChartType`](#actionAnalyzerChartType) **Chart Type** | Data type: TEXT
:::
::: prop-opt
The initial analyzing period - dynamic or a predefined fixed period: day, week, month or year
- [`(empty)`](#actionAnalyzerChartType-empty) Dynamic
- [`day`](#actionAnalyzerChartType-day) Day
- [`isoWeek`](#actionAnalyzerChartType-isoWeek) Week (starting on Mondays)
- [`month`](#actionAnalyzerChartType-month) Month
- [`year`](#actionAnalyzerChartType-year) Year
:::

::: prop-head
- [`actionAnalyzerCoordSystem`](#actionAnalyzerCoordSystem) **Initial Coordinate System** | Data type: TEXT
:::
::: prop-opt
The initial coordinate system of the analyzer - time, aggregate or calendar (only time is supported for dynamic periods)
- [`time`](#actionAnalyzerCoordSystem-time) Time
- [`aggregate`](#actionAnalyzerCoordSystem-aggregate) Aggregate
- [`calendar`](#actionAnalyzerCoordSystem-calendar) Calendar
:::

::: prop-head
- [`actionFeedback`](#actionFeedback) **Action feedback** | Data type: TEXT
:::
::: prop-opt
Shows a toast popup when the action has been executed. Can either be a text to show or a JSON object including some of the <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/toast.html#toast-parameters">supported parameters</a>
:::

::: prop-head
- [`actionVariable`](#actionVariable) **Variable** | Data type: TEXT
:::
::: prop-opt
The variable name to set
:::

::: prop-head
- [`actionVariableValue`](#actionVariableValue) **Variable Value** | Data type: TEXT
:::
::: prop-opt
The value to set the variable to
:::

<!-- GENERATED /props -->

### Inherited Properties
The configuration is passed to the underlying `f7-button` component from Framework7 v5.  All compatible scalar [properties](https://v5.framework7.io/vue/button.html#button-properties) (except functions) not listed above are available for use.

### Slots
There are no slots supported by this control.

## Examples

<div id="header"></div>

### Header Image Source Code

<!-- BOOKMARKS to this example -->
<div id="text"></div>
<div id="round"></div>
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
::: details Click to view the YAML source code:
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

### action: navigate
<!-- BOOKMARKS to this example -->
<div id="action-navigate"></div>
<div id="actionPage"></div>

![action navigate](./images/oh-button/action-navigate.png)

`action: navigate` allows you to navigate to another page (Administration -> Settings -> Pages) within the openHAB application.  The target page is specified with the name of the page in the `actionPage` property.  For example to create a button to take users to the main overview (home) page, set `actionPage: page:overview`.  The value after the `page:` is the page **ID** not the page **Label**.

::: details Click to view the YAML source code:
``` yaml{26-27}
uid: oh-button-action-navigate
tags: []
timestamp: Feb 15, 2021, 8:32:44 PM
component: f7-card
config:
  title: "oh-button > action: navigate"
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
          padding: 20px
      slots:
        default:
          - component: oh-button
            config:
              width: 400px
              iconF7: house_fill
              text: Home Page
              outline: true
              action: navigate
              actionPage: page:overview
              style:
                width: 250px
```
:::

### action: command
<!-- BOOKMARKS to this example -->
<div id="action-command"></div>
<div id="actionCommand"></div>
<div id="actionItem"></div>

![action command](./images/oh-button/action-command.png)

`action: command` allows you to send a command `actionCommand` to an item, specified in the `actionItem`. This example shows how to send ON and OFF commands to an item e.g. a light, using two buttons.    

::: details Click to view the YAML source code:
``` yaml{40-43,50-53}
uid: oh-button-action-command
tags: []
props:
  parameters:
    - context: item
      description: Select the item to use with these buttons.
      label: Item
      name: item
      required: true
      type: TEXT
      groupName: general
  parameterGroups:
    - name: general
      label: Display options
timestamp: Feb 15, 2021, 9:21:10 PM
component: f7-card
config:
  title: "oh-button > action: command"
  footer: Set the properties to any item that accepts an ON/OFF commands
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
          padding: 20px
      slots:
        default:
          - component: f7-segmented
            slots:
              default:
                - component: oh-button
                  config:
                    text: On
                    outline: true
                    action: command
                    actionItem: =props.item
                    actionCommand: ON
                    active: "=(items[props.item].state === 'ON') ? true : false"
                    style:
                      width: 100px
                - component: oh-button
                  config:
                    text: Off
                    outline: true
                    action: command
                    actionItem: =props.item
                    actionCommand: OFF
                    active: "=(items[props.item].state === 'OFF') ? true : false"
                    style:
                      width: 100px
```
:::

### action: toggle
<!-- BOOKMARKS to this example -->
<div id="action-toggle"></div>
<div id="actionAlt"></div>

![action toggle](./images/oh-button/action-toggle.png)

`action: toggle` is used to change any item that supports two states e.g. a lamp that is either ON or OFF or blinds that are OPEN or CLOSED.  Use `actionCommand` and `actionCommandAlt` to specify the commands to switch between. 

If you need the item to change to more than two states e.g. a dimmable light, see the [previous example](#action-command) and specify a button for each of the dimming levels required e.g. 0%, 25%, 50% 75%, 100% or use [`actionOptions`](#action-options) to select the required option.

::: details Click to view the YAML source code:
``` yaml{37-40}
uid: oh-button-action-toggle
tags: []
props:
  parameters:
    - context: item
      description: Select the item to use with these buttons.
      label: Item
      name: item
      required: true
      type: TEXT
      groupName: general
  parameterGroups:
    - name: general
      label: Display options
timestamp: Feb 15, 2021, 9:55:56 PM
component: f7-card
config:
  title: "oh-button > action: toggle"
  footer: Set the properties to any item that accepts an ON/OFF commands
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
          padding: 20px
      slots:
        default:
          - component: oh-button
            config:
              text: Off
              outline: true
              action: toggle
              actionItem: =props.item
              actionCommand: ON
              actionCommandAlt: OFF
              style:
                width: 100px
```
:::

### action: options
<!-- BOOKMARKS to this exam<<< @/filepath{highlightLines}ple -->
<div id="action-options"></div>
<div id="actionOptions"></div>

![action options](./images/oh-button/action-options.png)

`action: options` provides the ability to send a command from a list of options.  Options are displayed at the bottom of the screen when the button is clicked.  Options are specified either in the `actionOptions` property or if this is omitted from the `Command Options` metadata specified on the item.

::: details Click to view the YAML source code:
``` yaml
uid: oh-button-action-options
tags: []
props:
  parameters:
    - context: item
      description: Select the item to use with these buttons.
      label: Item
      name: item
      required: true
      type: TEXT
      groupName: general
  parameterGroups:
    - name: general
      label: Display options
timestamp: Feb 15, 2021, 11:57:34 PM
component: f7-card
config:
  title: "oh-button > action: options"
  footer: Set the properties to any item that accepts percentage commands e.g. dimmable light
slots:
  default:
    - component: f7-block
      config:
        class: bog
        style:
          display: flex
          flex-wrap: wrap
          justify-content: left
          padding: 20px
      slots:
        default:
          - component: f7-segmented
            slots:
              default:
                - component: oh-button
                  config:
                    text: Dimming Level
                    outline: true
                    action: options
                    actionOptions: 0=Off, 25=25%, 50=50%, 75=75%, 100=Full
                    actionItem: =props.item
                    style:
                      width: 300px
```
:::

### action: rule
<!-- BOOKMARKS to this example -->
<div id="action-rule"></div>
<div id="actionRule"></div>

`action: rule` is used with the `actionRule` property to run a rule (Administration > Settings > Rules).

::: details Click to view the YAML source code:
``` yaml {5,39-40}
uid: oh-button-action-rule
tags: []
props:
  parameters:
    - context: rule
      description: Click the button to run a rule.
      label: Rule Name
      name: rule
      required: true
      type: TEXT
      groupName: general
  parameterGroups:
    - name: general
      label: Display options
timestamp: Feb 16, 2021, 12:10:45 AM
component: f7-card
config:
  title: "oh-button > action: rule"
  footer: Set the properties to a rule to run.
slots:
  default:
    - component: f7-block
      config:
        class: bog
        style:
          display: flex
          flex-wrap: wrap
          justify-content: left
          padding: 20px
      slots:
        default:
          - component: f7-segmented
            slots:
              default:
                - component: oh-button
                  config:
                    text: Run automation rule
                    fill: true
                    action: rule
                    actionRule: =props.rule
                    style:
                      width: 300px
```
:::

### action: popup / action: popover / action: sheet
<!-- BOOKMARKS to this example -->
<div id="action-popup"></div>
<div id="action-popover"></div>
<div id="action-sheet"></div>
<div id="actionModal"></div>

The popup, popover and sheet actions provide a way to display user interface pages in specific window formats.  Typically these screens are used to display additional detail or access additional settings that have been omitted for brevity from the parent page. 

Pages should normally be specifically designed for your chosen display method. The popover area favours organisation of widgets in columns, but the sheet window occupies the full width of the lower part of the screen and therefore a horizontal layout is preferable.  

The example code simply displays a copy of your main 'Overview' page (as all users have this page) in each window style.  As this page is rarely designed with this purpose in mind the design challenge is usually clear!   

* `action: popup` is used with the `actionModal` property to open a page as a modal popup window in the centre of the screen.  Clicking on the `Back` button or anywhere else on the screen will close the popup window.  
* `action: popover` is used with the `actionModal` property to open a page as a modal popup window as a vertical rectangle to the left of the screen (over the menu area, if displayed).
* `action: sheet` is used with the `actionModal`  property to open a page as a modal popup windows as a horizontal rectangle across the bottom of the screen.

::: details Click to view the YAML source code:
``` yaml
uid: oh-button-action-popup-popover-sheet
tags: []
timestamp: Feb 16, 2021, 1:01:08 AM
component: f7-card
config:
  title: "oh-button > action: popup | action: popover | action: sheet"
  footer: Set the properties to any item that accepts percentage commands e.g. dimmable light
slots:
  default:
    - component: f7-block
      config:
        class: bog
        style:
          display: flex
          justify-content: left
          padding: 20px
      slots:
        default:
          - component: oh-button
            config:
              text: Open PopUp
              outline: true
              action: popup
              actionModal: page:overview
              style:
                width: 300px
                margin-right: 10px
          - component: oh-button
            config:
              text: Open PopOver
              outline: true
              action: popover
              actionModal: page:overview
              style:
                width: 300px
                margin-right: 10px
          - component: oh-button
            config:
              text: Open Sheet
              outline: true
              action: sheet
              actionModal: page:overview
              style:
                width: 300px
```
:::

### action: photos
<!-- BOOKMARKS to this example -->
<div id="action-photos"></div>
<div id="actionPhotos"></div>
<div id="actionPhotoBrowserConfig"></div>

![action photos](./images/oh-button/action-photos.png)

`action: photos` allows you to open a [Framework 7 (v5) Photo Browser object](https://v5.framework7.io/vue/photo-browser.html).  This component displays a collection of photos and video images. Photos can be zoomed and panned.  Typical applications for this control include the display of security camera images or videos.

`actionPhotos` accepts a YAML or JSON object that specifies the URL or HTML and captions for your images and videos. 

``` yaml
  actionPhotos:
    - url: http://openhabian:8080/static/photos/image1.jpg
      caption: Image 1
    - url: http://openhabian:8080/static/photos/image2.jpg
    - html: <video src="http://openhabian:8080/static/videos/video1.mp4"></video>
      caption: Garden Camera
```

The `actionPhotoBrowserConfig` accepts a YAML or JSON array that specifies the configuration properties for the Photo Browser object.

``` yaml
  actionPhotoBrowserConfig:
    exposition: false
    type: popup
    theme: dark
```

::: details Click to view the YAML source code:
Amend the file names / URL to your image file names before testing!  Nothing will be displayed if the image/video locations are not valid. 

``` yaml
uid: oh-button-action-photos
tags: []
timestamp: Feb 16, 2021, 3:17:05 PM
component: f7-card
config:
  title: "oh-button > action: photos"
  footer: Click to open the Photo Browser dialogue
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
          padding: 20px
      slots:
        default:
          - component: oh-button
            config:
              text: Camera 1
              outline: true
              action: photos
              actionItem: =props.item
              actionPhotos:
                - url: http://openhabian:8080/static/photos/image1.jpg
                  caption: Image 1
                - url: http://openhabian:8080/static/photos/image2.jpg
                - html: <video src="http://openhabian:8080/static/videos/video1.mp4"></video>
                  caption: Garden Camera
              actionPhotoBrowserConfig:
                exposition: false
                type: popup
                theme: dark
```
:::

### action: group
<!-- BOOKMARKS to this example -->
<div id="action-group"></div>
<div id="actionGroupPopupItem"></div>

![action-group](./images/oh-button/action-group.png)

`action: group` opens a popup which displays the items that are members of the group specified by the `actionGroupPopupItem`.

::: details Click to view the YAML source code:
Change `actionGroupPopupItem` property to a value that matches a group defined in your own configuration.
``` yaml
uid: oh-button-action-group
tags: []
timestamp: Feb 16, 2021, 4:20:16 PM
component: f7-card
config:
  title: "oh-button > action: group"
  footer: Click to show the items in the Lounge
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
          padding: 20px
      slots:
        default:
          - component: oh-button
            config:
              text: Lounge
              outline: true
              action: group
              actionGroupPopupItem: gLounge
```
:::

### action: analyzer
<!-- BOOKMARKS to this example -->
<div id="action-analyzer"></div>
<div id="actionAnalyzerItems"></div>
<div id="actionAnalyzerChartType"></div>
<div id="actionAnalyzerCoordSystem"></div>

![action-analyzer](./images/oh-button/action-analyzer.png) 

`action: analyzer` opens a popup which displays a graph based on the values of the items listed in `actionAnalyzerItems`.  Multiple items can be specified in `actionAnalyzerItems` using the YAML list format i.e. `[item1,item2,item3]`.

`actionAnalyzerChartType` specifies the initial period to analyze. If no value is specified initial period is dynamic. Periods can be adjusted after the graph is displayed, using the standard controls.

`actionAnalyzerCoordSystem` specifies the initial coordinate system of the analyzer. Only time is supported for dynamic periods.

::: warning Beware NULL values
If your graph does not display any data, check that none of items added to the graph are NULL.  A single NULL item prevents all data from being displayed.
:::

::: details Click to view the YAML source code:
Change `actionAnalyzerItems` property to a value that matches an item defined in your own configuration.
``` yaml
uid: oh-button-action-analyzer
tags: []
timestamp: Feb 16, 2021, 5:37:45 PM
component: f7-card
config:
  title: "oh-button > action: analyzer"
  footer: Click to analyze ground floor HVAC temperatures
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
          padding: 20px
      slots:
        default:
          - component: oh-button
            config:
              text: HVAC Ground Floor
              fill: true
              action: analyzer
              actionAnalyzerItems: [ZWaveNode002StellaZThermostaticValve_Sensortemperature, ZWaveNode005StellaZThermostaticValve_Sensortemperature]
```
:::

### action: url
<!-- BOOKMARKS to this example -->
<div id="action-url"></div>
<div id="actionUrl"></div>
<div id="actionUrlSameWindow"></div>

![action-url](./images/oh-button/action-url.png) 

`action: url` navigates to the web page specified in the `actionUrl` property. `actionUrlSameWindow` set to `true` to open in the same window, or `false` to open in a seperate window\tab.

::: details Click to view the YAML source code:
``` yaml
uid: oh-button-action-url
tags: []
timestamp: Feb 16, 2021, 6:52:30 PM
component: f7-card
config:
  title: "oh-button > action: url"
  footer: Click to open the specified website
slots:
  default:
    - component: f7-block
      config:
        class: bog
        style:
          display: flex
          justify-content: left
          padding: 20px
      slots:
        default:
          - component: oh-button
            config:
              text: OpenHAB Community
              fill: true
              action: url
              actionUrl: https://community.openhab.org/
              actionUrlSameWindow: false
              style:
                width: 300px
                margin-right: 10px
          - component: oh-button
            config:
              text: Documentation (same window)
              fill: true
              action: url
              actionUrl: https://www.openhab.org/docs/
              actionUrlSameWindow: treu
              style:
                width: 300px
                margin-right: 10px
```
:::

### action: variable
<!-- BOOKMARKS to this example -->
<div id="action-variable"></div>
<div id="actionVariableValue"></div>
<div id="actionVariable"></div>

<!-- ![action-variable](./images/oh-button/action-variable.png) --> 

`action: variable` creates and/or sets the variable specified in `actionVariable` to the value specified in `actionVariableValue`.  Variables are stored in the `vars` object and can be accessed by other objects using `vars.[your variable name]`.

::: details Click to view the YAML source code:
``` yaml
TBA
```
:::

## Community posts
The following posts contain great examples of the use of this control:

![UI Widget: Keypad](./images/oh-button/keypad.png)

[UI Widget: Keypad](https://community.openhab.org/t/ui-widget-keypad/106820) -  using `action: command` and `action: variable`, this widget will allow users to enter a numerical PIN code (plus * and #) and send a command with the result to a predefined item when pressing the Send button.

![Big Ol' Grid O' Buttons](./images/oh-button/bogob.png)

[BoGoB: Big Ol' Grid O' Buttons](https://community.openhab.org/t/bogob-big-ol-grid-o-buttons-is-this-even-possible-yes-yes-it-is/115343/7) - using the `oh-button` and `oh-repeater` objects together with YAML arrays to create large grids of buttons (emulating remote control operation).

<EditPageLink/>
