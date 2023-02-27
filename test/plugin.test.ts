// Third-party
import mitt, { Emitter } from 'mitt'

// Internal
import ChimeraJSIntegrator from '../src/ChimeraJSIntegrator'
import WSClient from '../src/WSClient'
import WSServer from '../src/WSServer'
import { waitForSocketState } from '../src/socketUtils'

function setup(): {cpjs: ChimeraJSIntegrator, emitter:Emitter<any>} {
      
  // Create emitter and Vue app
  const emitter = mitt<any>()

  // Mock Install
  const cpjs = new ChimeraJSIntegrator()
  cpjs.install({
    emitter: emitter,
    eventArray: ['hello'],
    wsPort: 6767
  })

  return {cpjs, emitter}
}

describe('WebSocket Server', () => {
  let server: WSServer
  
  beforeAll(async () => {
    server = new WSServer('ws://localhost:6767', 6767)
    await server.start()
  })

  test("connect and send message", async () => {
    const client = new WSClient("ws://localhost:6767")
    await waitForSocketState(client.instance, client.instance.OPEN)

    client.send('hello')

    client.close()
    await waitForSocketState(client.instance, client.instance.CLOSED)
  })

  afterAll(() => server.close())
})
