import Bluebird, { coroutine as co } from 'bluebird';
import chai, { expect } from 'chai';
import io from 'socket.io-client';

import { startServer, stopServer, setupServer } from './server.js';

const testPort = process.env.TEST_PORT || 8090;

Bluebird.promisifyAll(io);

chai.use(require('chai-as-promised'));
chai.use(require('dirty-chai'));

describe('socket.io-as-promised', () => {
  let client;

  function setupTest(...args) {
    setupServer.call(null, ...args);

    client = io.connect(`http://0.0.0.0:${testPort}`);
    return new Promise(resolve => client.on('connect', resolve));
  }

  beforeEach(() => {
    startServer(testPort);
  });

  afterEach(() => {
    client.disconnect();
    stopServer();
  });

  it('should not resolve non promises', async () => {
    setupTest(() => 'foo');

    const res = client.emitAsync('test');
    expect(res.isPending()).to.be.true();
    await Bluebird.delay(100);
    return expect(res.isPending()).to.be.true();
  });

  it('should respond when returning a promise', () => {
    setupTest(() => Promise.resolve('normal promise resolved'));
    return expect(client.emitAsync('test')).to.become('normal promise resolved');
  });

  it('should respond when returning a bluebird promise', () => {
    setupTest(() => Bluebird.resolve('bluebird promise resolved'));
    return expect(client.emitAsync('test')).to.become('bluebird promise resolved');
  });

  it('should respond when using async functions', () => {
    setupTest(async () => 'async function resolved');
    return expect(client.emitAsync('test')).to.become('async function resolved');
  });

  it('should respond when using a bluebird coroutine', () => {
    setupTest(co(function* () {
      return 'bluebird coroutine resolved';
    }));

    return expect(client.emitAsync('test')).to.become('bluebird coroutine resolved');
  });

  it('should respond with error upon rejected with error', () => {
    setupTest(() => Promise.reject(new Error('was rejected with error')));
    return expect(client.emitAsync('test')).to.eventually.be.rejected
      .and.deep.equal({});
  });

  it('should respond with error upon rejected with object', () => {
    setupTest(() => Promise.reject({ error: 'was rejected with object' }));
    return expect(client.emitAsync('test')).to.eventually.be.rejected
      .and.deep.equal({ error: 'was rejected with object' });
  });

  it('should respond with error upon thrown error from async function', () => {
    setupTest(async function () {
      throw new Error('was rejected with thrown error from async function');
    });

    return expect(client.emitAsync('test')).to.eventually.be.rejected
      .and.deep.equal({});
  });

  it('should respond with error upon thrown error from coroutine', () => {
    setupTest(co(function* () {
      throw new Error('was rejected with thrown error from coroutine');
    }));

    return expect(client.emitAsync('test')).to.eventually.be.rejected
      .and.deep.equal({});
  });

  it('should respond with error upon thrown object from async function', () => {
    setupTest(async function () {
      // eslint-disable-next-line no-throw-literal
      throw { error: 'was rejected with thrown object from async function' };
    });

    return expect(client.emitAsync('test')).to.eventually.be.rejected
      .and.deep.equal({ error: 'was rejected with thrown object from async function' });
  });

  it('should respond with error upon thrown object from coroutine', () => {
    setupTest(co(function* () {
      // eslint-disable-next-line no-throw-literal
      throw { error: 'was rejected with thrown object from coroutine' };
    }));

    return expect(client.emitAsync('test')).to.eventually.be.rejected
      .and.deep.equal({ error: 'was rejected with thrown object from coroutine' });
  });
});
