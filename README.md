# socket.io-as-promised

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coverage Status][coveralls-badge]][coveralls]
[![Dependency Status][dependency-status-badge]][dependency-status]
[![devDependency Status][dev-dependency-status-badge]][dev-dependency-status]

> Socket.IO middleware for supporting returning promises from handlers

## Introduction

Allows you to more easily respond to your user's events by employing promises instead of callbacks. Also supports async functions and [bluebird](https://github.com/petkaantonov/bluebird) coroutines. Supports Node >= 16.

It also helps with error handling, which is important since Socket.IO does not serialize `Error` objects.

## Install

```
$ npm install --save socket.io-as-promised
```

## Usage

```js
// server.js
const io = require('socket.io')();
const socketAsPromised = require('socket.io-as-promised');

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

  // Handles errors
  socket.on('throws exception', () => Promise.reject({ error: 'thrown exception' }));
  socket.on('throws from async', async () => { throw { error: 'thrown exception'; } });

  // Error objects get turned into '{}' objects by socket io, so they need serializing
  // use the handleError option documented in the API to handle this case
  socket.on('throws error exception', () => Promise.reject(new Error('thrown exception')));
});
```

```js
// client.js
const io = require('socket.io-client');
const client = io.connect('http://0.0.0.0:5000');

client.emit('returns promise', (err, res) => console.log(res)); // 'returned a promise'
client.emit('returns from async', (err, res) => console.log(res)); // 'returned from async'

client.emit('throws exception', err => console.log(err)); // { error: 'thrown exception' }
client.emit('throws from async', err => console.log(err)); // { error: 'thrown exception' }

client.emit('throws error exception', err => console.log(err)); // {}
```

## API

### socketAsPromised({ handleError } = {})

Type: `function`

Returns Socket.IO middleware. Monkeypatches `socket.on` to wrap the handler function and support returned promises

#### handleError(err, event)

Type: `function`, default: `null`

Optional argument, helps in case you want to ignore certain errors, or serialize other errors.

```js
io.use(socketAsPromised({
  handleError(err, event) {
    return Promise.reject({ name: err.name, message: err.message });

    // or:
    throw { name: err.name, message: err.message };

    // more fancy usage, filter out certain errors, return a
    // generic error instead useful in case of errors like database
    // connectivity that you don't want to reach the end user
    const genericError = { name: 'GenericError', message: 'Something went wrong' };

    if (isKnownError(err.name)) {
      return Promise.reject({ name: err.name, message: err.message });
    }
    return Promise.reject(genericError);
  }
}))
```

## Tests

```js
npm test
```

You can customize the port under which the test server runs (by default 8090):

```js
TEST_PORT=4444 npm test
```

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).

[build-badge]: https://img.shields.io/github/workflow/status/dotcore64/socket.io-as-promised/test/master?style=flat-square
[build]: https://github.com/dotcore64/socket.io-as-promised/actions

[npm-badge]: https://img.shields.io/npm/v/socket.io-as-promised.svg?style=flat-square
[npm]: https://www.npmjs.org/package/socket.io-as-promised

[coveralls-badge]: https://img.shields.io/coveralls/dotcore64/socket.io-as-promised/master.svg?style=flat-square
[coveralls]: https://coveralls.io/r/dotcore64/socket.io-as-promised

[dependency-status-badge]: https://david-dm.org/dotcore64/socket.io-as-promised.svg?style=flat-square
[dependency-status]: https://david-dm.org/dotcore64/socket.io-as-promised

[dev-dependency-status-badge]: https://david-dm.org/dotcore64/socket.io-as-promised/dev-status.svg?style=flat-square
[dev-dependency-status]: https://david-dm.org/dotcore64/socket.io-as-promised#info=devDependencies
