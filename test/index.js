import Bluebird from 'bluebird';
import chai, { expect } from 'chai';
import io from 'socket.io-client';

import { startServer, stopServer } from './server.js';

const testPort = process.env.TEST_PORT || 8090;

Bluebird.promisifyAll(io);

chai.use(require('chai-as-promised'));
chai.use(require('dirty-chai'));

describe('socket.io-as-promised', () => {
  let client;

  before(() => {
    startServer(testPort);
  });

  beforeEach(() => {
    client = io.connect(`http://0.0.0.0:${testPort}`);
    return new Promise(resolve => client.on('connect', resolve));
  });

  afterEach(() => {
    client.disconnect();
  });

  after(() => {
    stopServer();
  });

  it('should not resolve non promises', async () => {
    const res = client.emitAsync('non promise');
    expect(res.isPending()).to.be.true();
    await Bluebird.delay(100);
    return expect(res.isPending()).to.be.true();
  });

  it('should respond when returning a promise', () =>
    expect(client.emitAsync('normal promise')).to.become('normal promise resolved')
  );

  it('should respond when returning a bluebird promise', () =>
    expect(client.emitAsync('bluebird promise')).to.become('bluebird promise resolved')
  );

  it('should respond when using async functions', () =>
    expect(client.emitAsync('async function')).to.become('async function resolved')
  );

  it('should respond when using a bluebird coroutine', () =>
    expect(client.emitAsync('bluebird coroutine')).to.become('bluebird coroutine resolved')
  );

  it('should respond with error upon rejected with error', () =>
    expect(client.emitAsync('rejection error')).to.eventually.be.rejected
      .and.deep.equal({})
  );

  it('should respond with error upon rejected with object', () =>
    expect(client.emitAsync('rejection object')).to.eventually.be.rejected
      .and.deep.equal({ error: 'was rejected with object' })
  );

  it('should respond with error upon thrown error from async function', () =>
    expect(client.emitAsync('throw error async')).to.eventually.be.rejected
      .and.deep.equal({})
  );

  it('should respond with error upon thrown error from coroutine', () =>
    expect(client.emitAsync('throw error coroutine')).to.eventually.be.rejected
      .and.deep.equal({})
  );

  it('should respond with error upon thrown object from async function', () =>
    expect(client.emitAsync('throw object async')).to.eventually.be.rejected
      .and.deep.equal({ error: 'was rejected with thrown object from async function' })
  );

  it('should respond with error upon thrown object from coroutine', () =>
    expect(client.emitAsync('throw object coroutine')).to.eventually.be.rejected
      .and.deep.equal({ error: 'was rejected with thrown object from coroutine' })
  );
});
