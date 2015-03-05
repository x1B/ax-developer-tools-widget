# AxDeveloperToolsWidget

The AxDeveloperToolsWidget allows to open a _developer tools window_ that displays log messages and events about the containing LaxarJS application.


## Content
* [Appearance](#appearance)
* [Usage](#usage)
* [Features](#features)
* [Integration](#Integration)
* [References](#references)


## Appearance

![The window opened by the AxDeveloperToolsWidget](docs/img/example_1.png)


## Usage

### Installation

For installation instruction take a look at the [LaxarJS documentation](https://github.com/LaxarJS/laxar/blob/master/docs/manuals/installing_widgets.md).

### Configuration example

```json
{
   "widget": "laxarjs/ax-developer-tools-widget",
   "features": {
      "open": {
         "onActions": [ "showDevTools" ]
      }
   }
}
```
Use this configuration on a page to have a developer tools window open when the action `showDevTools` is requested.
By default, the window will also open when the method `laxarShowDeveloperTools()` is called.

For full configuration options refer to the [widget.json](widget.json).

### Development

To _develop_ (and not just use) the AxDeveloperToolsWidget _itself,_ the content application must be prepared:

```sh
cd content
npm install
grunt build
```

To build and _release a new version_, the release-version of the embedded application must be committed:
 
```sh
cd content
npm run-script optimize
git add var
git commit ...
``


### Features

### 1. Allow to Open a Developer Tools Window _(open)_

Because the developer tools should exist independent of the host application state and navigation, they are opened in a separate window.
 
*R1.1* The widget MUST allow to configure an action for opening the developer tools window.

*R1.2* The widget MUST allow to configure a global javascript method that opens the window directly.
_Note:_ This is intended to be used manually by developers, and not as an API.

*R1.3* The widget MUST establish a _communication channel_ to the contents of the developer tools window when open.

*R1.4* The widget MUST intercept _event bus activity_ from the host application and forward it to the communication channel.

*R1.5* The widget MUST intercept LaxarJS _log messages_ from the host application and forward them to the communication channel.

*R1.6* The widget MUST provide _content_ that must not depend in any way on the contents of the host application, except for relying on the communication channel. 
The widget MUST observe the communication channel from within the window and update its contents with no more than a second delay.
_See [content/includes/widgets/developer-tools/ax-host-connector-widget/README.md] for details._


### 2. Display Events from the Host Application

*R2.1* The widget MUST allow to view events from the host application.
_See [content/includes/widgets/developer-tools/ax-events-display-widget/README.md] for details._


### 3. Display Log Messages from the Host Application

*R3.1* The widget MUST allow to view log messages from the host application.
_See [content/includes/widgets/developer-tools/ax-log-display-widget/README.md] for details._


### 4. Visualize Widget Positions within the Host Application

*R4.1* The widget MUST help to identify widgets and their grid-alignment within the host application.
_See [content/includes/widgets/developer-tools/ax-developer-toolbar-widget/README.md] for details._


## Integration

### Patterns

The widget supports the following event patterns as specified by the [LaxarJS Patterns] documentation.

#### Actions

* Action: open.onActions
* Role: Receiver
* Description: Opens the developer tools window


## References

The following resources are useful or necessary for the understanding of this document.
The links refer to the latest version of the documentation.
Refer to the [bower.json](bower.json) for the specific version that is normative for this document.

* [LaxarJS Concepts]
* [LaxarJS Patterns]

[LaxarJS Concepts]: https://github.com/LaxarJS/laxar/blob/master/docs/concepts.md "LaxarJS Concepts"
[LaxarJS Patterns]: https://github.com/LaxarJS/laxar_patterns/blob/master/docs/index.md "LaxarJS Patterns"
