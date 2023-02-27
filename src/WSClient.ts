import WebSocket from 'isomorphic-ws'
import { waitForSocketState } from '../src/socketUtils'

export default class WSClient {
  url: string
  closeAfter: number
  ws?: WebSocket
  messages: Array<any>

  constructor(url: string, closeAfter: number = -1) {
    this.url = url
    this.closeAfter = closeAfter 
    this.messages = []
  }

  async connect() {
    this.ws = new WebSocket(this.url);
    await waitForSocketState(this.ws, this.ws.OPEN);

    this.ws.on("message", (message) => {
      const data = JSON.parse(message)
      this.messages.push(data);

      if (this.messages.length === this.closeAfter) {
        this.ws.close();
      }
    });
  }

  // Send the content
  send(content: any) {
    this.ws?.send(JSON.stringify(content))
  }

  async close() {
    await waitForSocketState(this.ws, this.ws.CLOSED)
  }
}
