import { createApp, defineComponent } from 'vue'
import mitt from 'mitt'
import ChimeraJSIntegrator from '../src/ChimeraJSIntegrator'

// Create dummy Vue app
const dummyApp = defineComponent({
  name: "App"
})

describe('installing plugin should broadcast event bus', () => {

  // Setup
  beforeEach(() => {

    // Create emitter and Vue app
    const emitter = mitt()
    const app = createApp(dummyApp)

    // Mock Install
    const cpjs = new ChimeraJSIntegrator()
    cpjs.install(app, {
      emitter: emitter,
      eventArray: []
    })
  })

  // Tests
  test('setup', () => {
    console.log("Setup success")
  })

})
