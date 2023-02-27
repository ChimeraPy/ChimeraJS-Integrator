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
  wsClients: Array<WebSocket>

  constructor(port: number) {
    this.port = port
    this.server = http.createServer();

    this.wss = new WebSocket.Server({ server: this.server })
    this.wsClients = []

    this.wss.on("connection", (webSocket: WebSocket) => {
      cjsLogger.info("[ChimeraJS-WSServer]: Obtain client connection")
      this.wsClients.push(webSocket)
      
      webSocket.on("message", (stringMessage:string) => {
        let message: Message = JSON.parse(stringMessage)
        cjsLogger.debug("[ChimeraJS-WSServer]: Obtain msg: " + message.type)
        this.onmessage(message, webSocket)
      })
    })
  }

  // User-defined method
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

  close() {
    this.server.close()
  }

}
