// Third-party
import mitt, { Emitter } from 'mitt'
import { App } from 'vue'
import { Deque } from '@datastructures-js/deque'
import jsLogger, { ILogger } from 'js-logger'

// Internal Imports
import Publisher from './publisher'
import Subscriber from './subscriber'

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
  eventsDeque: Deque<any>
  pub: Publisher
  sub: Subscriber

  static install: (Vue: App, options: IOptions) => void

  constructor() {

    // Initial values of state variables
    this.app = null
    this.options = defaultOptions
    this.eventsDeque = new Deque<any>()
    this.pub = new Publisher()
    this.sub = new Subscriber()
  }

  install(Vue: App, options: IOptions) {

    // Extend the options
    this.app = Vue
    this.options = {...defaultOptions, ...options}

    // Then add the function to the mitt instance to capture the requested
    // events
    this.options.emitter.on('*', (type, e) => {
      this.processEvent(type, e)
    })

    // Just storing the option, binding at the first event
    this.pub.bind(this.options.pubPort)

    // Connect subscriber to the options
    // this.sub.saveEmitter(this.options.emitter)
    // this.sub.connect(this.options.subIP, this.options.subPort)

  }

  processEvent(event: any, e: any) {

    // Logging for information
    cjsLogger.debug('Processing Event: ' + event)

    // Send it via ZeroMQ
    this.pub.publish(event, e)
    
    // Record event for testing
    this.eventsDeque.pushFront(event)
  }

  flush(timeout: number = 5000) {
    this.pub.flush(timeout)
  }

  shutdown() {
    this.pub.close()
  }
}
