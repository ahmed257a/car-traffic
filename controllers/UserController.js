const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/UserModel');
const factory = require('./handlerFactory');

// ---- UTILs --------
const filterObj = (obj, ...allowedFields) =>
  // convert into entries - use .filter - use Set for fast search
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => new Set(allowedFields).has(key))
  );
// ---- End UTILs -------

// FOR ADMINS ONLY
exports.getAllUsers = factory.getAll(User);
exports.createUser = factory.createOne(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

// FOR USERS
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    const message =
      'This route is not for password updates. Please use /update-my-password';
    return next(new AppError(message, 400));
  }

  /** NOTE
   * .save() enable full document validation
   * .findByIdAndUpdate() enable validation only at the field to be updated
   */

  // 2) filter out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
