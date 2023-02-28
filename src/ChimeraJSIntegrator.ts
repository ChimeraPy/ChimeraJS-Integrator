// Third-party
// import * as zmq from 'jszmq'
import mitt, { Emitter } from 'mitt'
import { Deque } from '@datastructures-js/deque'
import jsLogger, { ILogger } from 'js-logger'
import WSClient from './WSClient'
import { Message } from './Message'
import WebSocket from 'isomorphic-ws'

// Create logger
jsLogger.useDefaults()
const cjsLogger: ILogger = jsLogger.get('chimerajs')
cjsLogger.setLevel(jsLogger.INFO)

export default class ChimeraJSIntegrator {
  emitter: Emitter<any>
  eventArray: string[]
  wsPort: number
  sendEventDeque: Deque<any>
  receivedEventDeque: Deque<any>
  ws: WSClient

  constructor(emitter: Emitter<any>, eventArray: Array<string> = [], wsPort: number = 9100, closeAfter: number = -1) {

    // Initial values of state variables
    this.emitter = emitter
    this.eventArray = eventArray
    this.wsPort = wsPort
    this.ws = new WSClient('ws://localhost:'+this.wsPort.toString(), closeAfter)
    
    // Variables for testing
    this.sendEventDeque = new Deque<any>()
    this.receivedEventDeque = new Deque<any>()

    // Then add the function to the mitt instance to capture the requested
    // events
    this.emitter.on('*', (event, data) => {

      const msg: Message = {
        event: event.toString(), 
        data: data
      }

      if (msg.event != 'chimera' && (this.eventArray.length == 0 || this.eventArray.includes(msg.event.toString()))) {
        this.sendEvent(msg)
      }

    })
    
    this.ws.onmessage = (msg: Message) => {
      this.receiveEvent(msg)
    }

  }

  sendEvent(msg: Message) {

    // Don't repeat chimerajs messages
    if (msg.event == 'chimera'){
      return 
    }

    // Send it via ZeroMQ
    if (this.ws.ws.readyState == this.ws.ws.OPEN) {
      // Logging for information
      this.ws.send(msg)
      cjsLogger.info('[ChimeraJSIntegrator]: sending: ' + msg.event)
    }
    else {
      cjsLogger.debug('[ChimeraJSIntegrator]: connection lost, not sending: ' + msg.event)
    }
    
    // Record event for testing
    this.sendEventDeque.pushFront(msg.event)
  }

  receiveEvent(msg: Message) {
    
    // Record event for testing
    this.receivedEventDeque.pushFront(msg.event)

    // Transmit via the local emitter
    this.emitter.emit('chimera', msg.data)
    cjsLogger.debug('[ChimeraJSIntegrator]: emit: ' + msg.event + ' ' + msg.data)
  }

  shutdown() {
    this.ws.close()
  }
}
