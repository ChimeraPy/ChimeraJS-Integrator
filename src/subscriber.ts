// Third-party Imports
import { Emitter } from 'mitt'
import * as zmq from 'zeromq'
import jsLogger, { ILogger } from 'js-logger'

// Create logger
jsLogger.useDefaults()
const cjsLogger: ILogger = jsLogger.get('chimerajs')

export default class Subscriber {
  sock: zmq.Subscriber
  emitter: Emitter<any> | null

  constructor() {
    // Initialize the socket
    this.sock = new zmq.Subscriber()
    this.emitter = null
  }

  saveEmitter(emitter: Emitter<any>) {
    this.emitter = emitter 
  }

  public async connect(ip: string, port: string | number) {
    await this.sock.bind("tcp://" + ip + ":" + port)
  }
}
