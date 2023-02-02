# ChimeraJS

![tests](https://img.shields.io/github/actions/workflow/status/oele-isis-vanderbilt/ChimeraJS/test.yml)
[![npm](https://img.shields.io/npm/v/chimerajs)](https://npmjs.com/package/chimerajs)
![license](https://img.shields.io/github/license/oele-isis-vanderbilt/ChimeraJS)

Communication Extension for JS to ChimeraPy's Pythonic Runtime Environment

![Architecture Diagram](./docs/_static/ChimeraJS.drawio.png)

## Compatibility

Currently, the plugin is only available for VueJS applications, but it's open to PRs to extend to other tech stacks and frameworks.

## Installation

Use the following command to install the package:

```bash
npm install chimerajs
```

## Usage

First, you need to install the plugin to your Vue application. Use the following to start:

```js
import { createApp } from 'vue'
import App from '@/App.vue'
import { ChimeraJSIntegrator } from 'chimerajs'
import mitt from 'mitt'

// Create application
const app = createApp(App)

// Create the emitter
const emitter = mitt()

// Install plugin (provide the emitter instance from mitt)
// You can also omit the eventArray parameter if you can to
// capture all events and broadcast
app.use(ChimeraJSIntegrator, {
    emitter: emitter,
    eventArray: ['event1', 'event1'],
    subPort: 7777,
    subIP: '192.168.1.102',
    pubPort: 6767
})

// Then mount app
app.mount('#app')
```

### Option Parameters

| Parameter  | Type         | Accepted or Example inputs | Required | Description                                                                                                                                  |
|------------|--------------|----------------------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------|
| emitter    | mitt.Emitter | mitt()                     | True     | The emitter used to communicate between the JS application and ChimeraPy cluster                                                             |
| eventArray | string[]     | ['event1', 'event2'] or [] | False    | Provide an array of events to listen and distribute. [] implies that all events will be broadcast. BEWARE: avoid broadcasting sensitive data |
| subPort    | number       | 7777                       | False    | The port the JS SUB will bind to the ChimeraPy Cluster's PUB (the PUB's port)                                                                |
| subIP      | string       | '127.0.0.1' or another IP  | False    | The IP of the JS SUB will bind to the the ChimeraPy Cluster's PUB (the PUB's IP)                                                             |
| pubPort    | number       | 6767                       | False    | The port of the JS PUB that the ChimeraPy's SUB will bind to.                                                                                |

## Example

TODO
