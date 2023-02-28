import http, { Server } from 'http'
import WebSocket from 'isomorphic-ws'
import { Message } from './Message'
import jsLogger, { ILogger } from 'js-logger'

// Create logger
jsLogger.useDefaults()
const cjsLogger: ILogger = jsLogger.get('chimerajs')

export default class WSServer {
  port: number
  wss: WebSocket
  instance?: WebSocket
  server: Server
  wsClientCounter: number
  wsClients: Object

  constructor(port: number) {
    this.port = port
    this.server = http.createServer();
    this.wsClientCounter = 0
    this.wsClients = {}
    this.saveClient = this.saveClient.bind(this)

    this.wss = new WebSocket.Server({ server: this.server })

    this.wss.on("connection", (webSocket: WebSocket) => {
      cjsLogger.info("[ChimeraJS-WSServer]: Obtain client connection")
      this.saveClient(webSocket)
      this.onconnection(webSocket)
     
      // Attaching methods to specific WS client
      webSocket.on("message", (stringMessage:string) => {
        let message: Message = JSON.parse(stringMessage)
        cjsLogger.debug("[ChimeraJS-WSServer]: Obtain msg: " + message.event)
        this.onmessage(message, webSocket)
      })
    })
  }

  saveClient(client: WebSocket) {
    this.wsClients[this.wsClientCounter] = client
    this.wsClientCounter += 1
  }

  // User-defined method
  onconnection(webSocket: WebSocket) {
  }

  onmessage(message: Message, webSocket: WebSocket) {
  }

  start() {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        cjsLogger.info("[ChimeraJS-WSServer]: Running WS Server at ws://localhost:" + this.port.toString())
        resolve(this.server)
      })
    })
  }

  send(id: number, msg: Message) {
    this.wsClients[id].send(JSON.stringify(msg))
  }

  close() {
    this.server.close()
  }

}
