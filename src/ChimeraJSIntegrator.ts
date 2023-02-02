// Third-party
import * as zmq from 'jszmq'
import mitt, { Emitter } from 'mitt'
import { Deque } from '@datastructures-js/deque'
import jsLogger, { ILogger } from 'js-logger'

// Create logger
jsLogger.useDefaults()
const cjsLogger: ILogger = jsLogger.get('chimerajs')

interface IOptions {
  emitter: Emitter<any>
  eventArray: string[]
  repPort: number
  subIP: string
  subPort: number
}

const defaultOptions = {
  emitter: mitt<any>(),
  eventArray: [],
  repPort: 5555,
  subIP: "127.0.0.1",
  subPort: 3333
} as IOptions

export default class ChimeraJSIntegrator {
  options: IOptions
  sendEventDeque: Deque<any>
  receivedEventDeque: Deque<any>
  req: zmq.Req
  sub: zmq.Sub

  static install: (options: IOptions) => void

  constructor() {

    // Initial values of state variables
    this.options = defaultOptions
    this.sendEventDeque = new Deque<any>()
    this.receivedEventDeque = new Deque<any>()
    this.req = new zmq.Req()
    this.sub = new zmq.Sub()
  }

  install(options: IOptions) {

    // Extend the options
    this.options = {...defaultOptions, ...options}

    // Then add the function to the mitt instance to capture the requested
    // events
    this.options.emitter.on('*', (type, e) => {
      if (this.options.eventArray.length == 0 || this.options.eventArray.includes(type.toString())) {
        this.sendEvent(type, e)
      }
    })

    // Just storing the option, binding at the first event
    this.req.connect('ws://localhost:' + this.options.repPort)
    this.req.on('message', (msg) => {
      console.log('REQ: ', msg.toString())
    })

    // Making WS error not clutter the console

    // // Connect subscriber to the options
    this.sub.connect("ws://" + this.options.subIP + ":" + this.options.subPort)
    this.sub.subscribe('')

    // // Adding relay from sub to emitter
    this.sub.on('message', (msg) => {
      this.receiveEvent(JSON.parse(msg))
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
    this.req.send(JSON.stringify(msg))
    
    // Record event for testing
    this.sendEventDeque.pushFront(event)
  }

  receiveEvent(msg: any) {
    
    // Record event for testing
    this.receivedEventDeque.pushFront(msg.toString())
    console.log('SUB: ' + msg.event + ' ' + msg.data)

    // Transmit via the local emitter
    this.options.emitter.emit('chimera', msg)
  }

  shutdown() {
    try {
      this.req.close()
    } catch (error) {

    }
    try {
      this.sub.close()
    } catch (error) {
    }
  }
}
