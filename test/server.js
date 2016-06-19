import Bluebird, { coroutine as co } from 'bluebird';
import Server from 'socket.io';

import socketAsPromised from '../src';

const io = new Server();

io.use(socketAsPromised());

io.on('connection', socket => {
  socket.on('non promise', () => 'foo');

  socket.on('normal promise', () => (
    Promise.resolve('normal promise resolved')
  ));

  socket.on('bluebird promise', () => (
    Bluebird.resolve('bluebird promise resolved')
  ));

  socket.on('async function', async () => (
    'async function resolved'
  ));

  socket.on('bluebird coroutine', co(function* () {
    return 'bluebird coroutine resolved';
  }));

  socket.on('rejection error', () => (
    Promise.reject(new Error('was rejected with error'))
  ));

  socket.on('rejection object', () => (
    Promise.reject({ error: 'was rejected with object' })
  ));

  socket.on('throw error async', async function () {
    throw new Error('was rejected with thrown error from async function');
  });

  socket.on('throw error coroutine', co(function* () {
    throw new Error('was rejected with thrown error from coroutine');
  }));

  socket.on('throw object async', async function () {
    // eslint-disable-next-line no-throw-literal
    throw { error: 'was rejected with thrown object from async function' };
  });

  socket.on('throw object coroutine', co(function* () {
    // eslint-disable-next-line no-throw-literal
    throw { error: 'was rejected with thrown object from coroutine' };
  }));
});

export function startServer(testPort) {
  io.attach(testPort);
}

export function stopServer() {
  io.close();
}
