// Third-party
import mitt, { Emitter } from 'mitt'
import WS from "jest-websocket-mock"
import WebSocket from 'isomorphic-ws'

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
    wsPort: 6767
  })

  return {cpjs, emitter}
}

// Tests
test('setup', () => {
  console.log("Setup success")
})

test("the server keeps track of received messages, and yields them as they come in", async () => {
  const server = new WS("ws://localhost:1234")
  const client = new WebSocket("ws://localhost:1234")

  await server.connected
  client.send("hello")
  await expect(server).toReceiveMessage("hello")
  expect(server).toHaveReceivedMessages(["hello"])
})

test('connect', async () => {
  // Setup
  let {cpjs, emitter} = setup()
  const server = new WS('ws://localhost:6767')
  await server.connected;
  
  // Teardown
  // cpjs.shutdown()
  server.close()
})

