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
  options: IOptions
  instance?: WebSocket

  constructor(url: string, options?: IOptions) {
    this.url = url
    this.options = {...defaultOptions, ...options} 
    this.open()
  }

  // Open the URL
  open() {

    // Define that
    let that = this

    // Create underlying websocket instance
    this.instance = new WebSocket(this.url)

    // Setup the event handler for onmessage
    if (this.instance instanceof WebSocket){
    
      // Setup the event handler for onopen
      this.instance.onopen = (ev: Event) => {
        console.log("Opening!")

        // Run the open function
        // this.onopen?.(ev)
      }

      this.instance.onmessage = (event: MessageEvent) => {
        console.log(event.data)
      }

      // Setup the event handler for onclose
      // this.instance.onclose = function(e: CloseEvent) {
      //   console.log('Closing!')
        // that.reconnect(e)
        // switch (e.code){

          // Normal closure
          // case 1000:
          //   if (that.options.debug) {
          //     console.log("[WS]: Closed");
          //   }
          //   break;

          // Abnormal closure
          // default:
          //   that.reconnect(e);
          //   break;
        // }

        // Run onclose event
        // this.onclose?.(e);
      // }

      // Setup the event handler for onerror
      this.instance.onerror = (e: ErrorEvent) => {
        console.log('Error: ' + e.message)
        that.reconnect(e)
      }
    }
  }

  // Send the content
  send(content: any) {
    this.instance?.send(content)
  }

  // Define the reconnection function
  reconnect(e: any) {

    if (!this.options.reconnecting) {
      this.options.reconnecting = true
      
      // Set reconnect timeout
      setTimeout(() => {

        // Log reconnecting
        if (this.options.debug) {
            console.log("[WS]: Reconnecting...")
        }

        // Try and open the URL
        this.instance.close()
        this.open()
        this.options.reconnecting = false

      }, this.options.reconnectInterval)
    }
  }
}
