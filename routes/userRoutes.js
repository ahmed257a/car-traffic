const express = require('express');
const userController = require('./../controllers/UserController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// PROTECT ALL ROUTES AFTER THIS MIDDLEWARE
router.use(authController.protect);

router.patch('/update-my-password', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);

router.patch(
  '/update-me',
  userController.updateMe
);

router.delete('/delete-me', userController.deleteMe);

// RESTRICT ALL ROUTES AFTER THIS MIDDLEWARE
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = router;
