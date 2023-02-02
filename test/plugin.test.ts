// Third-party
import * as zmq from 'jszmq'
import { createApp, defineComponent } from 'vue'
import mitt, { Emitter } from 'mitt'

// Internal
import ChimeraJSIntegrator from '../src/ChimeraJSIntegrator'

function setup(): {cpjs: ChimeraJSIntegrator, emitter:Emitter<any>} {
  // Create dummy Vue app
  const dummyApp = defineComponent({
    name: "App"
  })
  const app = createApp(dummyApp)
      
  // Create emitter and Vue app
  const emitter = mitt<any>()

  // Mock Install
  const cpjs = new ChimeraJSIntegrator()
  cpjs.install(app, {
    emitter: emitter,
    eventArray: ['hello'],
    pubPort: 7777,
    subIP: '127.0.0.1',
    subPort: 6767
  })

  return {cpjs, emitter}
}

// Tests
test('setup', () => {
  console.log("Setup success")
})

test('obtaining emitted events', () => {
  let {cpjs, emitter} = setup()
  emitter.emit('hello', {x: '1'})
  expect(cpjs.sendEventDeque.popBack()).toBe('hello')
  cpjs.shutdown()
})

test('sending events via ZeroMQ', (done) => {
  let {cpjs, emitter} = setup()

  // Create a mock sub (from Python ChimeraPy)
  const mock_sub = new zmq.Sub()
  mock_sub.subscribe('chimerajs')
  mock_sub.connect('ws://127.0.0.1:'+cpjs.options.pubPort)

  // Just for this testing, we need to shutdown the SUB
  try {
    cpjs.sub.close()
  } catch (error) {

  }

  // Waiting for subscriptions before publishing
  cpjs.pub.once('message', () => {

    // Emit event
    emitter.emit('not hello', {x: '1'})
    emitter.emit('hello', {x: '1'})
     
    // Processing the received messages
    mock_sub.once('message', (topic, eventType, eventData) => {

      // Assert
      expect(topic.toString()).toBe('chimerajs')
      expect(eventType.toString()).toBe('hello')
      expect(JSON.parse(eventData)).toStrictEqual({x: '1'})

      // Closing Stuff
      mock_sub.close()
      cpjs.shutdown()
      done()
    })
  })
})

test('receiving events via ZeroMQ', (done) => {
  let {cpjs, emitter} = setup()

  // Create a mock pub (from Python ChimeraPy)
  const mock_pub = new zmq.XPub()
  mock_pub.bind('ws://127.0.0.1:'+cpjs.options.subPort)
    
  // Adding mitt event that handles this specific input
  emitter.on('chimerajs', e => {

    // Asserts
    // console.log('chimerajs: ', e['event'].toString(), JSON.parse(e['data']))
    expect(e['event']).toBe('chimerapy')
    expect(e['data']).toStrictEqual({x: '1'})
    expect(cpjs.receivedEventDeque.popBack()).toBe('chimerapy')

    // Closing after receiving the event
    mock_pub.close()
    cpjs.shutdown()
    done()
  })
  
  // Waiting for subscriptions
  mock_pub.once('message', () => {
    emitter.emit('AAAA', {'event': 'test', 'data': 'hello'})
    mock_pub.send(['chimerapy', JSON.stringify({x: '1'})])
    
  })

})

