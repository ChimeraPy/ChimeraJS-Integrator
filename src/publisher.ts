import * as zmq from 'zeromq'
import jsLogger, { ILogger } from 'js-logger'

// Create logger
jsLogger.useDefaults()
const cjsLogger: ILogger = jsLogger.get('chimerajs')

export default class Publisher {
  sock: zmq.Publisher
  eventsToProcess: number
  port: number | null
  binded: boolean
  tasks: Promise<boolean>[]

  constructor() {
    // Initialized the socket
    this.sock = new zmq.Publisher()
    this.eventsToProcess = 0
    this.port = null
    this.binded = false
    this.tasks = []
  }

  bind(port: number) {
    this.port = port
  }

  publish(eventType: any, eventData: any) {
   
    if (this.binded == false) {

      const bindTask = new Promise<boolean>(async (resolve, reject) => {
        await this.sock.bind("tcp://*:" + this.port)
        return resolve(true)
      })
      this.tasks.push(bindTask)

      this.binded = true
    }

    const sendTask = new Promise<boolean>(async (resolve, reject) => {
      await this.sock.send([eventType, eventData])
      cjsLogger.debug('Publisher: published ' + eventType + ' successful')
      return resolve(true)
    })
  }

  flush(): Promise<boolean> {
    const allPromises = new Promise<boolean>((resolve, reject) => {
    })
    return allPromises
  }

  close() {
    this.sock.close()
  }
}
