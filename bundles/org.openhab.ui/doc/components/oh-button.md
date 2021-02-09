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



## Configuration

<!-- GENERATED props -->

| Property name | Data type |Label | Description | Options |
|:---|:---|:---|:----|:----|
| `text` | TEXT | Text | Button label |  |
| `round` | BOOLEAN | Round | Makes button round |  `true`<br>`false` |  |
| `large` | BOOLEAN | Large | Makes button large |  `true`<br>`false` |  |
| `small` | BOOLEAN | Small | Makes button small |  `true`<br>`false` |  |
| `fill` | BOOLEAN | Fill | Makes button filled with color |  `true`<br>`false` |  |
| `raised` | BOOLEAN | Raised | Makes button raised |  `true`<br>`false` |  |
| `outline` | BOOLEAN | Outline | Makes button outline |  `true`<br>`false` |  |
| `active` | TEXT | Active | Button is active (when part of a f7-segmented |  |
| `iconF7` | TEXT | Icon | Framework7 icon to display (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>) |  |
| `iconMaterial` | TEXT | Icon | Material design icon to display |  |
| `iconColor` | TEXT | Icon Color | Not applicable to openHAB icons |  |
| `iconSize` | INTEGER | Icon Size | Size of the icon in px |  |
| `tooltip` | TEXT | Tooltip | Button tooltip text to show on button hover/press |  |
| `variable` | TEXT | Variable | Name of the variable to set on input change |  |
| `clearVariable` | BOOLEAN | Clear Variable After Action | Name of the variable to clear after performing the action |  `true`<br>`false` |  |

### Action

Action to perform when the element is clicked

| Property name | Data type |Label | Description | Options |
|:---|:---|:---|:----|:----|
| `action` | TEXT | Action | Type of action to perform | `navigate` Navigate to page<br>`command` Send command<br>`toggle` Toggle item<br>`options` Command options<br>`rule` Run rule<br>`popup` Open popup<br>`popover` Open popover<br>`sheet` Open sheet<br>`photos` Open photo browser<br>`group` Group details<br>`analyzer` Analyze item(s)<br>`url` External URL<br>`variable` Set Variable<br> |
| `actionUrl` | TEXT | Action URL | URL to navigate to |  |
| `actionUrlSameWindow` | BOOLEAN | Open in same tab/window | Open the URL in the same tab/window instead of a new one. This will exit the app. |  `true`<br>`false` |  |
| `actionItem` | TEXT | Action Item | Item to perform the action on |  |
| `actionCommand` | TEXT | Action Command | Command to send to the item. If "toggle item" is selected as the action, only send the command when the state is different |  |
| `actionCommandAlt` | TEXT | Action Toggle Command | Command to send to the item when "toggle item" is selected as the action, and the item's state is equal to the command above |  |
| `actionOptions` | TEXT | Command Options | Comma-separated list of options; if omitted, retrieve the command options from the item dynamically. Use <code>value=label</code> format to provide a label different than the option. |  |
| `actionRule` | TEXT | Rule | Rule to run |  |
| `actionPage` | TEXT | Page | Page to navigate to |  |
| `actionPageTransition` | TEXT | Transition Effect | Use a specific <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/view.html#custom-page-transitions">page transition animation</a> | `f7-circle` Circle<br>`f7-cover` Cover<br>`f7-cover-v` Cover from bottom<br>`f7-dive` Dive<br>`f7-fade` Fade<br>`f7-flip` Flip<br>`f7-parallax` Parallax<br>`f7-push` Push<br> |
| `actionModal` | TEXT | Modal Page or Widget | Page or widget to display in the modal |  |
| `actionModalConfig` | TEXT | Modal component configuration | Configuration (prop values) for the target modal page or widget |  |
| `actionPhotos` | TEXT | Images to show | Array of URLs or objects representing the images. Auto-refresh is not supported.<br />Edit in YAML or provide a JSON array, e.g.<br /><code>[ "url1", { "item": "ImageItem1", "caption": "Camera" } ]</code><br />Objects are in the <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/photo-browser.html#photos-array">photos array format</a> with an additional <code>item</code> property to specify an item to view. |  |
| `actionPhotoBrowserConfig` | TEXT | Photo browser configuration | Configuration for the photo browser.<br />Edit in YAML or provide a JSON object, e.g.<br /><code>{ "exposition": false, "type": "popup", "theme": "dark" }</code><br /> See <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/photo-browser.html#photo-browser-parameters">photo browser parameters</a> (not all are supported). |  |
| `actionGroupPopupItem` | TEXT | Group Popup Item | Group item whose members to show in a popup |  |
| `actionAnalyzerItems` | TEXT | Item(s) to Analyze | Start analyzing with the specified (set of) item(s) |  |
| `actionAnalyzerChartType` | TEXT | Chart Type | The initial analyzing period - dynamic or a predefined fixed period: day, week, month or year | `(empty)` Dynamic<br>`day` Day<br>`isoWeek` Week (starting on Mondays)<br>`month` Month<br>`year` Year<br> |
| `actionAnalyzerCoordSystem` | TEXT | Initial Coordinate System | The initial coordinate system of the analyzer - time, aggregate or calendar (only time is supported for dynamic periods) | `time` Time<br>`aggregate` Aggregate<br>`calendar` Calendar<br> |
| `actionFeedback` | TEXT | Action feedback | Shows a toast popup when the action has been executed. Can either be a text to show or a JSON object including some of the <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/toast.html#toast-parameters">supported parameters</a> |  |
| `actionVariable` | TEXT | Variable | The variable name to set |  |
| `actionVariableValue` | TEXT | Variable Value | The value to set the variable to |  |

<!-- GENERATED /props -->
