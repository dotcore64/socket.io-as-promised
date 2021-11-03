import { Server } from 'socket.io';

// https://github.com/import-js/eslint-plugin-import/issues/1649
// eslint-disable-next-line import/no-unresolved,node/no-missing-import
import socketAsPromised from 'socket.io-as-promised';

let io;

export function startServer(testPort) {
  io = new Server();
  io.attach(testPort);
}

export function stopServer() {
  io.close();
}

export function setupServer(handler, options) {
  io.use(socketAsPromised(options));

  io.on('connection', (socket) => {
    socket.on('test', handler);
  });
}
