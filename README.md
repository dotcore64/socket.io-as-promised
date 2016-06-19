# socket.io-as-promised

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coverage Status][coveralls-badge]][coveralls]
[![Dependency Status][dependency-status-badge]][dependency-status]
[![devDependency Status][dev-dependency-status-badge]][dev-dependency-status]

> Socket.IO middleware for supporting returning promises from handlers

## Introduction

Allows you to more easily respond to your user's events by employing promises instead of callbacks. Also supports async functions and [bluebird](https://github.com/petkaantonov/bluebird) coroutines. Supports Node >= 0.10.

## Install

```
$ npm install --save socket.io-as-promised
```

## Usage

```js
// server.js
const io = require('socket.io')();
const socketAsPromised = require('socket.io-as-promised');
const Promise = require('bluebird'); // also works with built-in promises

const co = Promise.coroutine;

io.attach(5000);

// on the main '/' namespare
io.use(socketAsPromised());

// on a custom namespace
io.of('/foo').use(socketAsPromised);

io.on('connection', socket => {
  // Client will get a response with the string 'returned a promise'
  socket.on('returns promise', () => Promise.resolve('returned a promise'));

  // Client will get a response with the string 'returned from async function'
  socket.on('returns from async', async () => 'returned from async function');

  // Client will get a response with the string 'returned from bluebird coroutine'
  socket.on('returns from coroutine', co(function* () {
    return 'returned from bluebird coroutine';
  }));

  // Handles errors
  socket.on('throws exception', () => Promise.reject({ error: 'thrown exception' }));
  socket.on('throws from async', async () => { throw { error: 'thrown exception'; } });
  socket.on('throws from coroutine', co(function* () {
    throw { error: 'thrown exception' };
  }));

  // Error objects get turned into '{}' objects by socket io, so they need serializing
  socket.on('throws error exception', () => Promise.reject(new Error('thrown exception')));
});
```

```js
// client.js
const io = require('socket.io-client');
const client = io.connect('http://0.0.0.0:5000');

client.emit('returns promise', (err, res) => console.log(res)); // 'returned a promise'
client.emit('returns from async', (err, res) => console.log(res)); // 'returned from async'
client.emit('returns from coroutine', (err, res) => console.log(res)); // 'returned from bluebird coroutine'

client.emit('throws exception', err => console.log(err)); // { error: 'thrown exception' }
client.emit('throws from async', err => console.log(err)); // { error: 'thrown exception' }
client.emit('throws from coroutine', err => console.log(err)); // { error: 'thrown exception' }

client.emit('throws error exception', err => console.log(err)); // {}
```

## API

### socketAsPromised()

Type: `function`

Returns Socket.IO middleware. Monkeypatches `socket.on` to wrap the handler function and support returned promises

## Tests

Requires Node 6 to run:

```js
npm test
```

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).

[build-badge]: https://img.shields.io/travis/perrin4869/socket.io-as-promised/master.svg?style=flat-square
[build]: https://travis-ci.org/perrin4869/socket.io-as-promised

[npm-badge]: https://img.shields.io/npm/v/socket.io-as-promised.svg?style=flat-square
[npm]: https://www.npmjs.org/package/socket.io-as-promised

[coveralls-badge]: https://img.shields.io/coveralls/perrin4869/socket.io-as-promised/master.svg?style=flat-square
[coveralls]: https://coveralls.io/r/perrin4869/socket.io-as-promised

[dependency-status-badge]: https://david-dm.org/perrin4869/socket.io-as-promised.svg?style=flat-square
[dependency-status]: https://david-dm.org/perrin4869/socket.io-as-promised

[dev-dependency-status-badge]: https://david-dm.org/perrin4869/socket.io-as-promised/dev-status.svg?style=flat-square
[dev-dependency-status]: https://david-dm.org/perrin4869/socket.io-as-promised#info=devDependencies
