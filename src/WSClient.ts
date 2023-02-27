import WebSocket from 'isomorphic-ws'

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

  constructor(url: string, options?: IOptions) {
    this.url = url
    // this.options = {...defaultOptions, ...options} 
    this.instance = new WebSocket(this.url)
  }

  // Send the content
  send(content: any) {
    this.instance?.send(content)
  }

  close() {
    this.instance.close()
  }
}
