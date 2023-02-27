import { startServer, waitForSocketState, createSocketClient } from "../src/socketUtils";
import WSServer from '../src/WSServer'
import WSClient from '../src/WSClient'

const port = 3000 + Number(process.env.JEST_WORKER_ID);

describe("WebSocket Server (external implementation)", () => {

  test("Server echoes the message it receives from client", async () => {
    const server = await startServer(port);
    
    // Create test client
    const [client, messages] = await createSocketClient(port, 1);
    const testMessage = {type: 'ECHO', data: "This is a test message"}

    // Send client message
    client.send(JSON.stringify(testMessage));

    // Perform assertions on the response
    await waitForSocketState(client, client.CLOSED);

    const [responseMessage] = messages;
    expect(responseMessage).toStrictEqual(testMessage);
  
    server.close()

  });
});

describe('WebSocket Server with Class Implementation', () => {

  test("Server Class implementation", async () => {
    const server = new WSServer(port)
    await server.start()
    
    // Create test client
    const [client, messages] = await createSocketClient(port, 1);
    const testMessage = {type: 'ECHO', data: "This is a test message"}

    // Send client message
    client.send(JSON.stringify(testMessage));

    // Perform assertions on the response
    await waitForSocketState(client, client.CLOSED);

    const [responseMessage] = messages;
    expect(responseMessage).toStrictEqual(testMessage);
  
    server.close()

  })

  test("Client Class Implementation", async () => {
    const server = new WSServer(port)
    await server.start()
    
    // Create test client
    const client = new WSClient('ws://localhost:' + port.toString(), 1)
    await client.connect()

    // Send client message
    const testMessage = {type: 'ECHO', data: "This is a test message"}
    client.send(testMessage);

    // Perform assertions on the response
    await client.close()

    const [responseMessage] = client.messages;
    expect(responseMessage).toStrictEqual(testMessage);
  
    server.close()

  })
})
