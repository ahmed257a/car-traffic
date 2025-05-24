const Car = require('../models/carModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/AppError');

// Middleware to validate car data
exports.validateCarData = catchAsync(async (req, res, next) => {
  const { number, letters, governorate } = req.body; // Validate car number
  console.log(number);

  if (!number || typeof number !== 'string') {
    return next(new AppError('من فضلك ادخل رقم سيارة صحيح', 400));
  }
  // Validate letters
  if (!letters || typeof letters !== 'string' || letters.trim().length === 0) {
    return next(new AppError('من فضلك ادخل حروف السيارة', 400));
  }

  // Validate governorate
  if (!governorate || typeof governorate !== 'string') {
    return next(new AppError('من فضلك ادخل اسم المحافظة', 400));
  }

  next();
});

// Search cars by criteria
exports.searchCars = catchAsync(async (req, res, next) => {
  const { number, letters, governorate } = req.query;

  const filter = {};
  if (number) filter.number = number;
  if (letters) filter.letters = letters;
  if (governorate) filter.governorate = governorate;

  const cars = await Car.find(filter);
  res.status(200).json({
    status: 'success',
    results: cars.length,
    data: {
      cars,
    },
  });
});

// Delete all cars
exports.deleteAllCars = catchAsync(async (req, res, next) => {
  await Car.deleteMany({});

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Use the factory handler for standard CRUD operations
exports.getAllCars = factory.getAll(Car);
exports.getCar = factory.getOne(Car);
exports.createCar = factory.createOne(Car);
exports.updateCar = factory.updateOne(Car);
exports.deleteCar = factory.deleteOne(Car);
