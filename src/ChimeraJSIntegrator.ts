// Third-party
import mitt, { Emitter } from 'mitt'
import { App } from 'vue'
import { Deque } from '@datastructures-js/deque'
import jsLogger, { ILogger } from 'js-logger'

// Internal Imports
import  Publisher from './publisher'

// Create logger
jsLogger.useDefaults()
const cjsLogger: ILogger = jsLogger.get('chimerajs')

interface IOptions {
  emitter: Emitter<any>
  eventArray: string[]
  pubPort: number
}

const defaultOptions = {
  emitter: mitt<any>(),
  eventArray: [],
  pubPort: 5555
} as IOptions

export default class ChimeraJSIntegrator {
  app: App | null
  options: IOptions
  eventsDeque: Deque<any>
  pub: Publisher

  static install: (Vue: App, options: IOptions) => void

  constructor() {

    // Initial values of state variables
    this.app = null
    this.options = defaultOptions
    this.eventsDeque = new Deque<any>()
    this.pub = new Publisher()
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

    // Bind publisher with the options
    this.pub.bind(this.options.pubPort)

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
}
