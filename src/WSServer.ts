// createWebSocketServer.js
// import WebSocket from "ws";

// function createWebSocketServer(server) {
//   const wss = new WebSocket.Server({ server });
//   wss.on("connection", function (webSocket) {
//     webSocket.on("message", function (message) {
//       webSocket.send(message);
//     });
//   });
// }
// export default createWebSocketServer;

import http, {Server } from 'http'
import WebSocket from 'isomorphic-ws'

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
  url: string
  port: number
  httpServer: Server
  wss: WebSocket
  // options: IOptions
  instance?: WebSocket

  constructor(url: string, port: number, options?: IOptions) {
    this.url = url
    this.port = port
    // this.options = {...defaultOptions, ...options} 
    // this.instance = new WebSocket(this.url)
    this.httpServer = http.createServer()
    this.wss = new WebSocket.Server({server: this.httpServer})

    this.wss.onconnection = (ws: WebSocket) => {
      ws.onmessage = (event: MessageEvent) => {
        console.log(event.data)
      }
    }
  }

  start() {
    return new Promise((resolve) => {
      this.httpServer.listen(this.port, () => resolve(this.httpServer))
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
