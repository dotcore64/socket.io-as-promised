export default ({ handleError = Promise.reject.bind(Promise) } = {}) => (socket, next) => {
  const on = socket.on.bind(socket);
  socket.on = (event, handler, ...args) => { // eslint-disable-line no-param-reassign
    const newHandler = (...handlerArgs) => {
      const result = handler(...handlerArgs)
        ?.catch?.((err) => handleError(err, event));

      if (typeof result?.then === 'function') {
        const cb = handlerArgs.at(-1);
        if (typeof cb === 'function') {
          result.then(cb.bind(null, null), cb);
        }
      }
    };

    on(event, newHandler, ...args);
  };

  next();
};
