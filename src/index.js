import asCallback from 'ascallback';

const defaultHandleError = (val) => Promise.reject(val);

export default ({ handleError = defaultHandleError } = {}) => (socket, next) => {
  const on = socket.on.bind(socket);
  socket.on = (event, handler, ...args) => { // eslint-disable-line no-param-reassign
    const newHandler = (...handlerArgs) => {
      const cb = handlerArgs.at(-1);
      const res = handler(...handlerArgs)?.catch?.((err) => handleError(err, event));

      if (typeof res?.then === 'function') {
        asCallback(res, cb);
      }
    };

    on(event, newHandler, ...args);
  };

  next();
};
