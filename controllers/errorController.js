const AppError = require('./../utils/AppError');

const handleJWTExpiredError = () => {
  return new AppError('Your  token has expired! Please login again.', 401);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please login again!', 401);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsErrorDB = (err) => {
  const regex = /(["'])(\\?.)*?\1/;
  const value = err.errmsg.match(regex)[0];
  const message = `Duplicate field value: ${value} please use another value`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  let errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  // For API
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) FOR API
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // 1) log the error
  console.log('Error 💥', err);
  // 2) send generic message
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
};

const globalErrorHandler = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // if in development mode -> send all error in full details
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = Object.create(
      Object.getPrototypeOf(err),
      Object.getOwnPropertyDescriptors(err)
    );
    // let error = { ...err, message: err.message };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsErrorDB(error);
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // Send the error
    sendErrorProd(error, req, res);
  }
};

module.exports = globalErrorHandler;
