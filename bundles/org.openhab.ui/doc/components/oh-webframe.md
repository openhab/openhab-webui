---
title: oh-webframe - Web frame
component: oh-webframe
label: Web frame
description: Displays a web page in a frame
source: https://github.com/openhab/openhab-webui/edit/main/bundles/org.openhab.ui/doc/components/oh-webframe.md
prev: /docs/ui/components/
---

# oh-webframe - Web frame

<!-- Put a screenshot here if relevant:
![](./images/oh-webframe/header.jpg)
-->

[[toc]]

<!-- Note: you can overwrite the definition-provided description and add your own intro/additional sections instead -->
<!-- DO NOT REMOVE the following comments if you intend to keep the definition-provided description -->
<!-- GENERATED componentDescription -->
Displays a web page in a frame
<!-- GENERATED /componentDescription -->

## Configuration

<!-- DO NOT REMOVE the following comments -->
<!-- GENERATED props -->
### General
<div class="props">
<PropGroup label="General">
<PropBlock type="TEXT" name="src" label="Source URL">
  <PropDescription>
    URL to show in the frame
  </PropDescription>
</PropBlock>
<PropBlock type="INTEGER" name="height" label="Height">
  <PropDescription>
    Height of the frame (by default 300px)
  </PropDescription>
</PropBlock>
<PropBlock type="BOOLEAN" name="openhabSession" label="Reuse openHAB sign-in">
  <PropDescription>
    Start a session with a participating servlet on the same HTTPS origin before loading the frame
  </PropDescription>
</PropBlock>
</PropGroup>
</div>


<!-- GENERATED /props -->

## Authenticated frames

Enable **Reuse openHAB sign-in** to embed a servlet that supports this option.
Use a URL on the same HTTPS origin as Main UI, such as `/homekit/camera/front-door`.

Main UI sends a `POST` to the frame path followed by `/_openhab_session` using the existing API client.
It omits the frame URL's query and fragment, and loads the frame only after the session endpoint returns `204 No Content`.

The servlet must implement this endpoint, check the request origin, and apply openHAB's access policy.
For authenticated access, it should set a short-lived `Secure`, `HttpOnly`, `SameSite=Strict` cookie scoped to the protected resource.
It must validate the session for the viewer and its protected requests, and respect expiry and revocation.
It may return `204` without setting a cookie when its policy permits anonymous access, or `401` if a Main UI sign-in is required.
A plain `401` lets Main UI handle sign-in.

<!-- If applicable describe how properties are forwarded to a underlying component from Framework7, ECharts, etc.:
### Inherited Properties

-->

<!-- If applicable describe the slots recognized by the component and what they represent:
### Slots

#### `default`

The contents of the oh-webframe.

-->

<!-- Add as many examples as desired - put the YAML in a details container when it becomes too long (~150/200+ lines):
## Examples

### Example 1

![](./images/oh-webframe/example1.jpg)

```yaml
component: oh-webframe
config:
  prop1: value1
  prop2: value2
```

### Example 2

![](./images/oh-webframe/example2.jpg)

::: details YAML
```yaml
component: oh-webframe
config:
  prop1: value1
  prop2: value2
slots
```
:::

-->

<!-- Try to clean up URLs to the forum (https://community.openhab.org/t/<threadID>[/<postID>] should suffice)
## Community Resources

- [Community Post 1](https://community.openhab.org/t/12345)
- [Community Post 2](https://community.openhab.org/t/23456)
-->
