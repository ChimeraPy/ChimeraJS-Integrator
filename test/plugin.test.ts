import { createApp, defineComponent } from 'vue'
import mitt from 'mitt'
import ChimeraJSIntegrator from '../src/ChimeraJSIntegrator'

// Create dummy Vue app
const dummyApp = defineComponent({
  name: "App"
})
const app = createApp(dummyApp)

describe('installing plugin should broadcast event bus', () => {

  // Setup
  beforeEach(() => {

    // Create emitter and Vue app
    const emitter = mitt()

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

  test('obtaining emitted events', () => {
    console.log("")
  })

})
