import { startServer, waitForSocketState, createSocketClient } from "../src/socketUtils";

const port = 3000 + Number(process.env.JEST_WORKER_ID);

describe("WebSocket Server", () => {

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
