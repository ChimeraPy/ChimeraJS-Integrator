import http, {Server } from 'http'
import WebSocket from 'isomorphic-ws'
import { Deque } from '@datastructures-js/deque'

// Define WSClient instance
interface IOptions {
  reconnectInterval?: number
  reconnecting?: boolean
  debug?: boolean
}

// const defaultOptions: IOptions = {
//   reconnectInterval: 1000,
//   reconnecting: false,
//   debug: true,
// }

export default class WSServer {
  port: number
  httpServer: Server
  wss: WebSocket
  instance?: WebSocket
  receiveMessages: Deque<any>

  constructor(port: number, options?: IOptions) {
    this.port = port
    this.receiveMessages = new Deque<any>()
    this.httpServer = http.createServer()
    this.wss = new WebSocket.Server({server: this.httpServer})

    this.wss.onconnection = (ws: WebSocket) => {
      
      console.log("Server obtained connection!")

      ws.onmessage = (event: any) => {
        console.log(event)
        const data = JSON.parse(event as string)
        console.log(data)
        this.receiveMessages.pushBack(data)
        ws.send(event)
      }
    }
  }

  start() {
    return new Promise((resolve) => {
      this.httpServer.listen(this.port, () => {
        console.log("WSS Running at ws://localhost:" + this.port.toString())
        resolve(true)
      })
    })
  }

  // Send the content
  send(content: any) {
    this.instance?.send(content)
  }

  close() {
    this.httpServer.close()
  }
}
