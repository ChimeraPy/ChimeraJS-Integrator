import WebSocket from 'isomorphic-ws'
import { waitForSocketState } from '../src/socketUtils'
import { Message } from './Message'
import jsLogger, { ILogger } from 'js-logger'

// Create logger
jsLogger.useDefaults()
const cjsLogger: ILogger = jsLogger.get('chimerajs')

export default class WSClient {
  url: string
  closeAfter: number
  ws: WebSocket
  reconnectInterval: number
  messages: Array<Message>
  shutdown: boolean

  constructor(url: string, closeAfter: number = -1, reconnectInterval: number = 5000) {
    this.url = url
    this.closeAfter = closeAfter 
    this.messages = []
    this.shutdown = false
    this.reconnectInterval = reconnectInterval
    this.ws = this.connect()
  }

  connect() {
    this.ws = new WebSocket(this.url);
   
    // Setting event handler methods
    this.ws.onopen = (event: any) => {
      cjsLogger.info("[ChimeraJS-WSClient]: Connection made to " + this.url) 
      this.onopen(event)
    }

    this.ws.onmessage = (event: any) => {
      const message: Message = JSON.parse(event.data)
      cjsLogger.info("[ChimeraJS-WSClient]: Obtain msg: " + message.event) 
      this.messages.push(message);

      this.onmessage(message)
      if (this.messages.length === this.closeAfter) {
        this.shutdown = true
        this.ws.close();
      }
    }

    this.ws.onclose = (event: any) => {
      this.onclose(event)
      this.reconnect()
    }

    return this.ws
  }
  
  //////////////////////////////////////////////////////////////////////
  // User-defined methods 
  //////////////////////////////////////////////////////////////////////
  
  onopen(event: Event) {
  }

  onmessage(message: Message) {
  }

  onclose(event: CloseEvent) {
  }

  async waitConnect() {
    while (true) {
      const success = await waitForSocketState(this.ws, this.ws.OPEN);
      if (success) {
        break
      }
    }
  }

  // Send the content
  send(content: Message) {
    if (this.ws.readyState == this.ws.OPEN){
      jsLogger.debug('[ChimeraJS-WSClient]: Sending msg: ' + content.event)
      this.ws.send(JSON.stringify(content))
    }
  }

  reconnect() {
      setTimeout(() => {
        if (!this.shutdown) {
          cjsLogger.debug("[ChimeraJS-WSClient]: Reconnecting...")
          this.connect() 
        }
      }, this.reconnectInterval)
  }

  async waitClose() {
    await waitForSocketState(this.ws, this.ws.CLOSED)
  }

  async close() {
    this.shutdown = true
    if (this.ws.readyState == this.ws.OPEN){
      this.ws.close()
      await waitForSocketState(this.ws, this.ws.CLOSED)
    }
  }
}
