import http, { Server } from 'http'
import WebSocket from 'isomorphic-ws'

export default class WSServer {
  port: number
  wss: WebSocket
  instance?: WebSocket
  server: Server

  constructor(port: number) {
    this.port = port
    this.server = http.createServer();

    this.wss = new WebSocket.Server({ server: this.server })

    this.wss.on("connection", function (webSocket) {
      webSocket.on("message", function (message) {
        webSocket.send(message);
      })
    })
  }

  start() {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => resolve(this.server));
    });
  }

  close() {
    this.server.close()
  }

}
