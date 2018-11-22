const JwtStrategy = require('passport-jwt').Strategy;
const Extract = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('User');

const opts = {};
//we are sending the token as a bearer token
opts.jwtFromRequest = Extract.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.APP_SECRET;

module.exports = passport => {
  //the payload is the same payload we encoed when we created the token (id name avatar)
  passport.use(
    new JwtStrategy(opts, (jwt_payload, next) => {
      //find the user
      User.findById(jwt_payload.id)
        .then(user => {
          if (user) {
            return next(null, user);
          }
          return next(null, false);
        })
        .catch(console.log);
    })
  );
};
