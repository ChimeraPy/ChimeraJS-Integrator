import WebSocket from 'isomorphic-ws'
import { Deque } from '@datastructures-js/deque'
import { waitForSocketState } from '../src/socketUtils'

// Define WSClient instance
interface IOptions {
  reconnectInterval?: number
  reconnecting?: boolean
  debug?: boolean
}

const defaultOptions: IOptions = {
  reconnectInterval: 1000,
  reconnecting: false,
  debug: true,
}

export default class WSClient {
  url: string
  // options: IOptions
  instance?: WebSocket
  receiveMessages: Deque<any>

  constructor(url: string, closeAfter?: number) {
    this.url = url
    this.receiveMessages = new Deque<any>()
    // this.options = {...defaultOptions, ...options} 
    this.instance = new WebSocket(this.url)

    this.instance.onconnection = () => {
      console.log('WSClient connected!')
    }

    this.instance.onmessage = (data: any) => {
      this.receiveMessages.pushFront(data)

      if (this.receiveMessages.size() === closeAfter){
        this.instance.close()
      }
    }
  }

  async connect() {
    await waitForSocketState(this.instance, this.instance.OPEN)
  }

  // Send the content
  send(content: any) {
    this.instance?.send(JSON.stringify(content))
    console.log("Sent: " + content)
  }

  async close() {
    await waitForSocketState(this.instance, this.instance.CLOSED)
  }
}
