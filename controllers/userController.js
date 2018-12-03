const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  validateRegisterInput,
  validateLoginInput,
  errorResponse
} = require('../handlers/validation');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const userController = {};

userController.createUser = async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    errorResponse(errors);
  }

  const { email, password, name } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error('Existing user');
    err.status = 400;
    err.errors = { email: 'A user with that email already exists!' };
    throw err;
  }

  const avatar = gravatar.url(email, {
    r: 'pg', //Rating,
    s: '200', //Size
    d: 'mm' //Default photo
  });
  const newUser = new User({
    name,
    email,
    password,
    avatar
  });
  await newUser.save();
  res.status(201).json({ message: 'User created successfully.' });
};

userController.loginUser = async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    errorResponse(errors);
  }

  const { password, email } = req.body;
  let err;

  const user = await User.findOne({ email });
  if (!user) {
    err = new Error('No user');
    err.status = 404;
    err.errors = { email: 'No user found for that email address' };
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    err = new Error('Invalid Password');
    err.status = 404;
    err.errors = { password: 'Invalid Password' };
    throw err;
  }

  jwt.sign(
    { id: user.id, name: user.name, avatar: user.avatar },
    process.env.APP_SECRET,
    { expiresIn: '1h' },
    (err, token) => {
      res.json({ token });
    }
  );
};

userController.currentUser = (req, res) => {
  const { name, id, email, avatar } = req.user;
  res.json({ name, id, email, avatar });
};

module.exports = userController;
