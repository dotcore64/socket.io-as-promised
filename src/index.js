const isPromise = require('is-promise');
const asCallback = require('ascallback');

function socketAsPromised() {
  return (socket, next) => {
    const on = socket.on;
    socket.on = (event, handler, ...args) => {
      const newHandler = (...handlerArgs) => {
        const res = handler.apply(null, handlerArgs);
        const cb = handlerArgs[handlerArgs.length - 1];

        if (isPromise(res)) {
          if (typeof res.asCallback === 'function') {
            res.asCallback(cb);
          } else {
            asCallback(res, cb);
          }
        }
      };

      on.call(socket, event, newHandler, ...args);
    };

    next();
  };
}

module.exports = socketAsPromised;
