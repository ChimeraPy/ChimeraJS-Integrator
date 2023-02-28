# ChimeraJS Integrator

![tests](https://img.shields.io/github/actions/workflow/status/oele-isis-vanderbilt/ChimeraJS/test.yml)
[![npm](https://img.shields.io/npm/v/chimera-js-integrator)](https://npmjs.com/package/chimera-js-integrator)
![license](https://img.shields.io/github/license/oele-isis-vanderbilt/ChimeraJS)

Communication Extension for JS to ChimeraPy's Pythonic Runtime Environment using ZeroMQ

![Architecture Diagram](./docs/_static/ChimeraJS.drawio.png)

## Installation

Use the following command to install the package:

```bash
npm install chimera-js-integrator
```

## Usage

First, you need to install the plugin to your Vue application. Use the following to start:

```js
import { ChimeraJSIntegrator } from 'chimera-js-integrator'
import mitt from 'mitt'

// Create the emitter
const emitter = mitt()

// Install plugin (provide the emitter instance from mitt)
// You can also omit the eventArray parameter if you can to
// capture all events and broadcast
const chimerajs = new ChimeraJSIntegrator(emitter, ['event1', 'event1'], 6767)

```

### Option Parameters

| Parameter  | Type         | Accepted or Example inputs | Required | Description                                                                                                                                  |
|------------|--------------|----------------------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------|
| emitter    | mitt.Emitter | mitt()                     | True     | The emitter used to communicate between the JS application and ChimeraPy cluster                                                             |
| eventArray | string[]     | ['event1', 'event2'] or [] | False    | Provide an array of events to listen and distribute. [] implies that all events will be broadcast. BEWARE: avoid broadcasting sensitive data |
| wsPort     | number       | 6767 | False    | The port the integrator will bind to the ChimeraPy Cluster's WS Server (the WSS's port)                                                                |

## Example

TODO
