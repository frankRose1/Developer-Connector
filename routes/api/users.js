const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const {
  validateRegisterInput,
  validateLoginInput
} = require('../../handlers/validation');
const mongoose = require('mongoose');
const User = mongoose.model('User');

//All routes are prepended with /api/users

router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { email, password, name } = req.body;
  User.findOne({ email }).then(user => {
    if (user) {
      return res
        .status(400)
        .json({ email: 'A user with that email already exists!' });
    } else {
      //find users avatar, if not fallback to a dummy avatar
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

      newUser
        .save()
        .then(user => res.json(user))
        .catch(err => res.json({ error: err.message }));
    }
  });
});

router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { password, email } = req.body;
  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ email: 'User with that email not found' });
    }

    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //set the token
        //token will take a payload, secret, and time limit
        //payload is everything that we want to encode ( eg user id )
        const payload = { id: user.id, name: user.name, avatar: user.avatar };
        jwt.sign(
          payload,
          process.env.APP_SECRET,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({ token });
          }
        );
      } else {
        return res.status(400).json({ password: 'Invalid Password' });
      }
    });
  });
});

//protected route, return the currently logged in user
//if the auth passes, there will be a req.user available
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { name, id, email, avatar } = req.user;
    res.json({ name, id, email, avatar });
  }
);

module.exports = router;
