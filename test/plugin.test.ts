// Third-party
import * as zmq from 'jszmq'
import mitt, { Emitter } from 'mitt'

// Internal
import ChimeraJSIntegrator from '../src/ChimeraJSIntegrator'

function setup(): {cpjs: ChimeraJSIntegrator, emitter:Emitter<any>} {
      
  // Create emitter and Vue app
  const emitter = mitt<any>()

  // Mock Install
  const cpjs = new ChimeraJSIntegrator()
  cpjs.install({
    emitter: emitter,
    eventArray: ['hello'],
    repPort: 7777,
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
  const mock_rep = new zmq.Rep()
  mock_rep.bind('ws://127.0.0.1:'+cpjs.options.repPort)

  // Just for this testing, we need to shutdown the SUB
  try {
    cpjs.sub.close()
  } catch (error) {
  }
    
  // Emit event
  emitter.emit('not hello', {x: '1'})
  emitter.emit('hello', {x: '1'})
  
  mock_rep.on('message', (msg) => {
    const json_msg = JSON.parse(msg)
    expect(json_msg.event).toBe('hello')
    expect(json_msg.data).toStrictEqual({x:'1'})

    // Closing Stuff
    mock_rep.close()
    cpjs.shutdown()
    done()
  })
})

test('receiving events via ZeroMQ', (done) => {
  let {cpjs, emitter} = setup()

  // Create a mock pub (from Python ChimeraPy)
  const mock_pub = new zmq.XPub()
  mock_pub.bind('ws://127.0.0.1:'+cpjs.options.subPort)
  
    // Just for this testing, we need to shutdown the SUB
  try {
    cpjs.req.close()
  } catch (error) {
  }
    
  // Adding mitt event that handles this specific input
  emitter.on('chimera', msg => {

    console.log(msg['event'])

    // Asserts
    // expect(e.event).toBe('hello')
    // expect(e.data).toStrictEqual({x: '1'})
    // expect(cpjs.receivedEventDeque.popBack()).toBe('hello')

    // Closing after receiving the event
    mock_pub.close()
    cpjs.shutdown()
    done()
  })
  
  // Waiting for subscriptions
  mock_pub.once('message', () => {
    mock_pub.send(JSON.stringify({"event": 'hello', 'data': {x: '1'}}))
    
  })

})

