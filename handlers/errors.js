const errorHandler = {};

errorHandler.catchErrors = fn => {
  return function(req, res, next) {
    return fn(req, res, next).catch(next);
  };
};

errorHandler.notFound = (req, res, next) => {
  const error = new Error('Not found.');
  error.status = 404;
  next(error);
};

errorHandler.validationErrors = (err, req, res, next) => {
  if (err.message !== 'Validation Errors') return next(err);
  res.status(422);
  res.json({ message: err.message, errors: err.errors });
};

errorHandler.globalErrorHandler = (err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ message: err.message });
};

module.exports = errorHandler;
