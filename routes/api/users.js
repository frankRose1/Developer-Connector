const express = require('express');
const router = express.Router();
const passport = require('passport');
const { catchErrors } = require('../../handlers/errors');
const {
  createUser,
  loginUser,
  currentUser
} = require('../../controllers/userController');

//All routes are prepended with /api/users

router.post('/register', catchErrors(createUser));
router.post('/login', catchErrors(loginUser));
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  currentUser
);

module.exports = router;
