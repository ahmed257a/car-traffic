const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const userRouter = require('./routes/userRoutes');
const carRouter = require('./routes/carRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/AppError');

//Initialize express app
const app = express();

/* ---- GLOBAL MIDDLEWARES ---- */

// Set CORS policy first
const corsOptions = {
  origin: [
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://localhost:5501',
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Logging
app.use(morgan('dev'));

// Data sanitization against XSS
app.use(xss());

// Set security HTTP headers with correct CSP
// app.use(
//   helmet({
//     crossOriginEmbedderPolicy: false,
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "'unsafe-inline'"],
//         styleSrc: ["'self'", "'unsafe-inline'"],
//         imgSrc: ["'self'", 'data:', 'blob:'],
//         connectSrc: [
//           "'self'",
//           'http://localhost:3000',
//           'http://127.0.0.1:3000',
//         ],
//       },
//     },
//   })
// );

// Limit requests from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 10 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // limit size of data to 10 kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

app.use((req, res, next) => {
  // console.log('Cookies (from global middleware): ', req.cookies);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('<h1>Hello from home </h1>')
})
app.use('/api/v1/users', userRouter);
app.use('/api/v1/cars', carRouter);

// HANDLE UNHANDLED ROUTES
app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
});

// Register the global error handler middleware
app.use(globalErrorHandler);
module.exports = app;
