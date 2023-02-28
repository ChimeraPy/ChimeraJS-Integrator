import jsLogger, { ILogger } from 'js-logger'
import mitt, { Emitter } from 'mitt'

import WebSocket from 'isomorphic-ws'
import WSServer from '../src/WSServer'
import WSClient from '../src/WSClient'
import { Message } from '../src/Message'
import ChimeraJSIntegrator from "../src/ChimeraJSIntegrator"

// Create logger
jsLogger.useDefaults()
const cjsLogger: ILogger = jsLogger.get('chimerajs')
cjsLogger.setLevel(jsLogger.DEBUG)

const port = 3000 + Number(process.env.JEST_WORKER_ID);

function setup(): {cpjs: ChimeraJSIntegrator, emitter:Emitter<any>} {
      
  // Create emitter and Vue app
  const emitter = mitt<any>()

  // Mock Install
  const cpjs = new ChimeraJSIntegrator(emitter, ['ECHO'], port, 1)

  return {cpjs, emitter}
}

describe("Integrator sending messages between Emitter and WSServer", () => {

  test("Integrator -> WSServer", async () => {
    const server = new WSServer(port)

    // Specifying methods
    server.onmessage = (message: Message, webSocket: WebSocket) => {
      webSocket.send(JSON.stringify(message))
    }

    // Staring the server
    await server.start()
    
    // // Create test client
    let {cpjs, emitter} = setup()
    await cpjs.ws.waitConnect()

    // // Send client message
    const testMessage: Message = {event: 'ECHO', data: "This is a test message"}
    emitter.emit(testMessage.event, testMessage.data)

    // Perform assertions on the response
    await cpjs.ws.waitClose()

    const [responseMessage] = cpjs.ws.messages;
    expect(responseMessage.data).toStrictEqual(testMessage.data);
  
    server.close()
  })

  test("WSServer -> Integrator", async () => {
    const server = new WSServer(port)
    const testMessage: Message = {event: 'HELLO', data: "This is a test message"}

    // Staring the server
    await server.start()
    
    // Create test client
    let {cpjs, emitter} = setup()
    await cpjs.ws.waitConnect()

    // Sending message
    server.send(0, testMessage)

    // Perform assertions on the response
    await cpjs.ws.waitClose()

    const event: string = cpjs.receivedEventDeque.popBack()
    expect(event).toStrictEqual(testMessage.event);
  
    server.close()
  })
})
