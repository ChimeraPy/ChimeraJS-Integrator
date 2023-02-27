// Third-party
// import * as zmq from 'jszmq'
import mitt, { Emitter } from 'mitt'
import { Deque } from '@datastructures-js/deque'
import jsLogger, { ILogger } from 'js-logger'
import WebSocket from 'isomorphic-ws'

// Create logger
jsLogger.useDefaults()
const cjsLogger: ILogger = jsLogger.get('chimerajs')

interface IOptions {
  emitter: Emitter<any>
  eventArray: string[]
  wsPort: number
}

const defaultOptions = {
  emitter: mitt<any>(),
  eventArray: [],
  wsPort: 3333
} as IOptions

export default class ChimeraJSIntegrator {
  options: IOptions
  sendEventDeque: Deque<any>
  receivedEventDeque: Deque<any>
  ws?: WebSocket

  static install: (options: IOptions) => void

  constructor() {

    // Initial values of state variables
    this.options = defaultOptions
    this.sendEventDeque = new Deque<any>()
    this.receivedEventDeque = new Deque<any>()

  }

  install(options: IOptions) {

    // Extend the options
    this.options = {...defaultOptions, ...options}

    // Then add the function to the mitt instance to capture the requested
    // events
    // this.options.emitter.on('*', (type, e) => {
    //   if (this.options.eventArray.length == 0 || this.options.eventArray.includes(type.toString())) {
    //     this.sendEvent(type, e)
    //   }
    // })
    
    // Connect WS
    this.connect()
    
    // this.ws.addEventListener('open', (event) => {
    //   this.ws.send(JSON.stringify({event: 'chimerajs', data: {success: true}})) 
    // })

    // this.ws.addEventListener('message', (event) => {
    //   this.receiveEvent(event)
    // })

  }

  connect(){
    // Create the WS
    this.ws = new WebSocket('ws://localhost:' + this.options.wsPort.toString())

    this.ws.on('close', () => {
      setTimeout(() => {
        this.connect() 
      }, 1000)
    })

    this.ws.on('error', () => {
      this.ws.close()
    })

  }

  sendEvent(event: any, e: any) {

    // Don't repeat chimerajs messages
    if (event == 'chimera'){
      return 
    }

    // Logging for information
    cjsLogger.debug('Processing Event: ' + event)

    // Send it via ZeroMQ
    let msg = {
      'event': event,
      'data': e
    }

    this.ws.send(JSON.stringify(msg))
    
    // Record event for testing
    this.sendEventDeque.pushFront(event)
  }

  receiveEvent(msg: any) {
    
    // Record event for testing
    this.receivedEventDeque.pushFront(msg.toString())
    console.log('INCOMING: ' + msg.event + ' ' + msg.data)

    // Transmit via the local emitter
    this.options.emitter.emit('chimera', msg)
  }

  shutdown() {
    this.ws.close()
  }
}
