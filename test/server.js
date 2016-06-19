import Server from 'socket.io';
import socketAsPromised from '../src';

let io;

export function startServer(testPort) {
  io = new Server();
  io.attach(testPort);
}

export function stopServer() {
  io.close();
}

export function setupServer(handler, options = undefined) {
  io.use(socketAsPromised(options));

  io.on('connection', socket => {
    socket.on('test', handler);
  });
}
