import { setTimeout } from 'timers/promises';
import { expect } from 'chai';
import io from 'socket.io-client';
import { pEvent as fromEvent } from 'p-event';

// https://github.com/import-js/eslint-plugin-import/issues/2104
import { startServer, stopServer, setupServer } from './server.js'; // eslint-disable-line import/extensions

const TEST_PORT = process.env.TEST_PORT || 8090;

describe('socket.io-as-promised', () => {
  let client;

  function setupTest(...args) {
    setupServer(...args);

    client = io(`http://0.0.0.0:${TEST_PORT}`);
    return fromEvent(client, 'connect');
  }

  beforeEach(() => {
    startServer(TEST_PORT);
  });

  afterEach(() => {
    client.disconnect();
    stopServer();
  });

  it('should not resolve non promises', () => {
    setupTest(() => 'foo');

    return expect(
      Promise.race([
        client.emitAsync('test'),
        setTimeout(100).then(() => 'done'),
      ]),
    ).to.become('done');
  });

  it('should respond when returning a promise', () => {
    setupTest(() => Promise.resolve('normal promise resolved'));
    return expect(client.emitAsync('test')).to.become('normal promise resolved');
  });

  it('should respond with error upon rejected with error', () => {
    setupTest(() => Promise.reject(new Error('was rejected with error')));
    return expect(client.emitAsync('test')).to.eventually.be.rejected
      .and.deep.equal({});
  });

  it('should respond with error upon rejected with object', () => {
    setupTest(() => Promise.reject({ error: 'was rejected with object' })); // eslint-disable-line prefer-promise-reject-errors
    return expect(client.emitAsync('test')).to.eventually.be.rejected
      .and.deep.equal({ error: 'was rejected with object' });
  });

  it('should call handle error with the right args', (done) => {
    const error = new Error('serialized error');
    setupTest(() => Promise.reject(error), {
      handleError(err, event) {
        try {
          expect(err).to.equal(error);
          expect(event).to.equal('test');

          done();
        } catch (e) {
          done(e);
        }
      },
    });

    client.emitAsync('test');
  });

  it('should serialize rejected error', () => {
    setupTest(() => Promise.reject(new Error('serialized error')), {
      handleError(err) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject({ name: err.name, message: err.message });
      },
    });

    return expect(client.emitAsync('test')).to.eventually.be.rejected
      .and.deep.equal({ name: 'Error', message: 'serialized error' });
  });

  it('should catch error thrown from handleError', () => {
    setupTest(() => Promise.reject(new Error('serialized error')), {
      handleError(err) {
        throw { name: err.name, message: err.message }; // eslint-disable-line no-throw-literal
      },
    });

    return expect(client.emitAsync('test')).to.eventually.be.rejected
      .and.deep.equal({ name: 'Error', message: 'serialized error' });
  });
});
