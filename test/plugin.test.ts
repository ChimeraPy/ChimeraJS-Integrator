// Third-party
import { createApp, defineComponent } from 'vue'
import mitt from 'mitt'

// Internal
import ChimeraJSIntegrator from '../src/ChimeraJSIntegrator'

// Create dummy Vue app
const dummyApp = defineComponent({
  name: "App"
})
const app = createApp(dummyApp)
    
// Create emitter and Vue app
const emitter = mitt()

// Mock Install
const cpjs = new ChimeraJSIntegrator()
cpjs.install(app, {
  emitter: emitter,
  eventArray: [],
  pubPort: 7777,
  subIP: '127.0.0.1',
  subPort: 6767
})

// Tests
test('setup', () => {
  console.log("Setup success")
})

test('obtaining emitted events', () => {
  emitter.emit('hello', {x: '1'})
  expect(cpjs.eventsDeque.popBack()).toBe('hello')
  cpjs.flush()
})

test('sending events via ZeroMQ', () => {
  emitter.emit('hello', {x: '1'})
  cpjs.flush()
})

