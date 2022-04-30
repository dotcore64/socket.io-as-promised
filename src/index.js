export default ({ handleError = Promise.reject.bind(Promise) } = {}) => (socket, next) => {
  const on = socket.on.bind(socket);
  socket.on = (event, handler, ...args) => { // eslint-disable-line no-param-reassign
    const newHandler = (...handlerArgs) => {
      const cb = handlerArgs.at(-1);

      handler(...handlerArgs)
        ?.catch?.((err) => handleError(err, event))
        ?.then(cb.bind(null, null), cb);
    };

    on(event, newHandler, ...args);
  };

  next();
};
