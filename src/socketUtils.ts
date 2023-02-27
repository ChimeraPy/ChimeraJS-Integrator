/**
 * Forces a process to wait until the socket's `readyState` becomes the specified value.
 * @param socket The socket whose `readyState` is being watched
 * @param state The desired `readyState` for the socket
 */
function waitForSocketState(socket: WebSocket, state: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(function () {
      if (socket.readyState === state) {
        resolve();
      } else {
        waitForSocketState(socket, state).then(resolve);
      }
    });
  });
}

export { waitForSocketState }
