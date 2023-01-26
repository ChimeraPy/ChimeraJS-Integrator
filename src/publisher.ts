import * as zmq from 'zeromq'
import jsLogger, { ILogger } from 'js-logger'

// Create logger
jsLogger.useDefaults()
const cjsLogger: ILogger = jsLogger.get('chimerajs')

export default class Publisher {
  sock: zmq.Publisher
  eventsToProcess: number

  constructor() {
    // Initialized the socket
    this.sock = new zmq.Publisher()
    this.eventsToProcess = 0
  }

  public async bind(port: number) {
    await this.sock.bind("tcp://*:" + port)
  }

  public async publish(eventType: any, eventData: any) {
    // Variables tracking success
    let failureCounter = 0
    this.eventsToProcess += 1

    while (true) {
      try {
        await this.sock.send([eventType, eventData])
        cjsLogger.debug('Publisher: published ' + eventType + ' successful')
        break
      } catch {
        failureCounter += 1

        // If failure too much, stop trying to send
        if (failureCounter >= 50) {
          break
        }
      }
    }

    // Mark completion
    this.eventsToProcess -= 1
  }

  flush(numAttemps: number = 100) {
    let failureCounter = 0
    while(this.eventsToProcess != 0) {
      failureCounter += 1
      if (failureCounter > numAttemps){
        cjsLogger.debug('Publisher: failed to flush')
        break
      }
    }
  }
}
