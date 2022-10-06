# HAB Assistant

HAB Assistant is a project designed to facilitate the use of the [openHAB](https://openhab.org) dialog processing capabilities.

Through a websocket connection this web interface registers a sink and source in your openHAB instance that can be used like any other ones.
It also facilitates running a single shot dialog processing execution.

It is another step to have a full, open source, integrated assistant for your openHAB smart home.

## Limitations:

* Most browser security policies requires a secure context to use its audio capabilities, so you should access the page using 'https' (or disable this browser security policy, which is not recommended).
* At the moment of writing it does not work with openHAB cloud instances, meaning you can not use it through the myopenhab.org page.

## Settings

You can edit this settings for the service in the main ui **Settings / Other Services - HAB Assistant**:

* **Secure** - Require user credentials to use the assistant (you will redirect you to the main ui if you are not logged in).

## Local Settings:

You can access a basic form by clicking the 'Settings' button at the top right of the assistant page where you can configure the following:

* **Id** - Part of the id that will be used to register the sick and source components on your openHAB instance.
* **Label** - The label that will be used to register the sick and source components on your openHAB instance.

These settings are stored on your browser local storage. 

## Usage:

* As most browsers requires user interaction to access its audio capabilities, you should click at the assistant panel at first. It will then ask for user permissions and show a loading animation until it's ready.
* When the assistant is ready the registered sink and source will be visible in openHAB (audio settings section).
* The assistant icon circle displays an animation always whenever it's streaming the microphone audio to the server.
* The assistant icon dots part displays an animation while it's playing audio.
* By clicking on the assistant icon a single shot audio dialog processing will start. It uses the registered audio sick and source and the default processing services configured on the openHAB voice settings (so you should have configured your default speech-to-text, text-to-speech and interpreter there).

## Audio Component Details:

The audio sink registered supports the following audio format: WAV PCM-SIGNED 16000hz 16-bit mono (single channel).
It's supported by most if not all the speech-to-text services available at openHAB. 

The audio source registered supports any wav audio format as it will try to convert it to the appropriate format (PCM-SIGNED 16-bit mono at browser sample rate).
