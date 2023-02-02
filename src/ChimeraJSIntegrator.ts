// Third-party
import * as zmq from 'jszmq'
import mitt, { Emitter } from 'mitt'
import { App } from 'vue'
import { Deque } from '@datastructures-js/deque'
import jsLogger, { ILogger } from 'js-logger'

// Create logger
jsLogger.useDefaults()
const cjsLogger: ILogger = jsLogger.get('chimerajs')

interface IOptions {
  emitter: Emitter<any>
  eventArray: string[]
  pubPort: number
  subIP: string
  subPort: number
}

const defaultOptions = {
  emitter: mitt<any>(),
  eventArray: [],
  pubPort: 5555,
  subIP: "127.0.0.1",
  subPort: 3333
} as IOptions

export default class ChimeraJSIntegrator {
  app: App | null
  options: IOptions
  sendEventDeque: Deque<any>
  receivedEventDeque: Deque<any>
  pub: zmq.XPub
  sub: zmq.Sub

  static install: (Vue: App, options: IOptions) => void

  constructor() {

    // Initial values of state variables
    this.app = null
    this.options = defaultOptions
    this.sendEventDeque = new Deque<any>()
    this.receivedEventDeque = new Deque<any>()
    this.pub = new zmq.XPub()
    this.sub = new zmq.Sub()
  }

  install(Vue: App, options: IOptions) {

    // Extend the options
    this.app = Vue
    this.options = {...defaultOptions, ...options}

    // Then add the function to the mitt instance to capture the requested
    // events
    this.options.emitter.on('*', (type, e) => {
      if (this.options.eventArray.length == 0 || this.options.eventArray.includes(type.toString())) {
        this.sendEvent(type, e)
      }
    })

    // Just storing the option, binding at the first event
    this.pub.bind("ws://127.0.0.1:" + this.options.pubPort.toString())

    // Connect subscriber to the options
    this.sub.connect("ws://" + this.options.subIP + ":" + this.options.subPort)
    this.sub.subscribe('chimerapy')

    // Adding relay from sub to emitter
    this.sub.on('message', (eventType, eventData) => {
      this.receiveEvent(eventType, eventData)
    })

  }

  sendEvent(event: any, e: any) {

    // Don't repeat chimerajs messages
    if (event == 'chimerajs'){
      return 
    }

    // Logging for information
    cjsLogger.debug('Processing Event: ' + event)

    // Send it via ZeroMQ
    this.pub.send(['chimerajs', event, JSON.stringify(e)])
    
    // Record event for testing
    this.sendEventDeque.pushFront(event)
  }

  receiveEvent(event: any, e: any) {
    
    // Record event for testing
    this.receivedEventDeque.pushFront(event.toString())

    // Transmit via the local emitter
    this.options.emitter.emit('chimerajs', {'event': event.toString(), 'data': JSON.parse(e)})

}

  shutdown() {
    this.pub.close()
    try {
      this.sub.close()
    } catch (error) {
    }
  }
}
