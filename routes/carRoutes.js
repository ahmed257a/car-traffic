const express = require('express');
const carController = require('./../controllers/carController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect, authController.restrictTo('admin'));

// Search route
router.get('/search', carController.searchCars);

// Delete all cars route
router.delete('/delete-all', carController.deleteAllCars);

// Standard CRUD routes
router
  .route('/')
  .get(carController.getAllCars)
  .post(carController.validateCarData, carController.createCar);

router
  .route('/:id')
  .get(carController.getCar)
  .patch(carController.validateCarData, carController.updateCar)
  .delete(carController.deleteCar);

module.exports = router;
