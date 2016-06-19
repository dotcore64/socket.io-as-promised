const isPromise = require('is-promise');
const asCallback = require('ascallback');

function socketAsPromised({ handleError } = {}) {
  return (socket, next) => {
    const on = socket.on;
    socket.on = (event, handler, ...args) => {
      const newHandler = (...handlerArgs) => {
        const cb = handlerArgs[handlerArgs.length - 1];
        let res = handler.apply(null, handlerArgs);

        if (isPromise(res)) {
          if (typeof handleError === 'function') {
            res = res.catch(err => handleError(err, event));
          }

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
