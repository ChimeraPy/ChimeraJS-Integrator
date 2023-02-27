import WebSocket from 'isomorphic-ws'
import { waitForSocketState } from '../src/socketUtils'
import { Message } from './Message'
import jsLogger, { ILogger } from 'js-logger'

// Create logger
jsLogger.useDefaults()
const cjsLogger: ILogger = jsLogger.get('chimerajs')
jsLogger.setLevel(jsLogger.INFO)

export default class WSClient {
  url: string
  closeAfter: number
  ws?: WebSocket
  reconnectInterval: number
  messages: Array<Message>
  shutdown: boolean

  constructor(url: string, closeAfter: number = -1, debug: boolean = true, reconnectInterval: number = 500) {
    this.url = url
    this.closeAfter = closeAfter 
    this.messages = []
    this.shutdown = false
    this.reconnectInterval = reconnectInterval
    this.connect()
  }

  connect() {
    this.ws = new WebSocket(this.url);
   
    // Setting event handler methods
    this.ws.on('open', (event: Event) => {
      jsLogger.info("[ChimeraJS-WSClient]: Connection made to " + this.url) 
      this.onopen(event)
    })

    this.ws.on("message", (data: string) => {
      const message: Message = JSON.parse(data)
      jsLogger.info("[ChimeraJS-WSClient]: Obtain msg: " + message.type) 
      this.messages.push(message);

      if (this.messages.length === this.closeAfter) {
        this.ws.close();
        this.shutdown = true
      }
      this.onmessage(message)
    })

    this.ws.on('close', (event: CloseEvent) => {
      if (event.code == 1000) {
        jsLogger.info("[ChimeraJS-WSClient]: Closing safely") 
      }
      this.onclose(event)
    })
    
    this.ws.on('error', (event: ErrorEvent) => {
      // Keep retrying to connect
      setTimeout(() => {
        if (!this.shutdown) {
          jsLogger.debug("[ChimeraJS-WSClient]: Reconnecting...")
          this.ws.close()
          this.connect() 
        }
      }, this.reconnectInterval)
    })
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
    if (this.ws instanceof WebSocket && this.ws.readyState == this.ws.OPEN){
      jsLogger.debug('[ChimeraJS-WSClient]: Sending msg: ' + content.toString())
      this.ws.send(JSON.stringify(content))
    }
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
