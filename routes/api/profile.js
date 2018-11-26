const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Profile = mongoose.model('Profile');
const User = mongoose.model('User');
const passport = require('passport');
const {
  validateProfileInput,
  validateExperienceInput,
  validateEducationInput
} = require('../../handlers/validation');

//All routes are prepended with /api/profile

// @route GET api/profile
// @desc Get a user profile
// @access Privte
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    //find the profile associated with the user
    let errors = {};
    Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'avatar'])
      .then(profile => {
        //if there is no profile, handle it with frontend
        res.json(profile);
      })
      .catch(err => res.status(400).json(err));
  }
);

// @route POST api/profile
// @desc Create OR Edit a user profile
// @access Privte
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const userId = req.user.id;
    const { errors, isValid } = validateProfileInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    //skills is coming in as csv so it needs to be converted to an array

    const profileData = {
      ...req.body,
      user: userId,
      skills:
        typeof req.body.skills !== 'undefined'
          ? req.body.skills.split(',')
          : [''],
      social: {
        youtube: req.body.youtube,
        facebook: req.body.facebook,
        linkedin: req.body.linkedin,
        instagram: req.body.instagram,
        twitter: req.body.twitter
      }
    };
    Profile.findOne({ user: userId })
      .then(profile => {
        if (profile) {
          //Update
          Profile.findOneAndUpdate(
            { user: userId },
            { $set: profileData },
            { new: true }
          ).then(profile => res.json(profile));
        } else {
          //Create

          //see if handle exists
          Profile.findOne({ handle: profileData.handle }).then(profile => {
            if (profile) {
              errors.handle = 'That handle is already in use';
              res.status(400).json(errors);
            }
          });

          new Profile(profileData).save().then(profile => res.json(profile));
        }
      })
      .catch(err => res.status(400).json(err));
  }
);

// @route GET api/profile/all
// @desc Get all profiles
// @access Public
router.get('/all', (req, res) => {
  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => res.json(profiles))
    .catch(err => res.status(500).json(err));
});

// @route GET api/profile/handle/:handle
// @desc Get a profile b its handle
// @access Public
router.get('/handle/:handle', (req, res, next) => {
  const { handle } = req.params;
  let errors = {};
  Profile.findOne({ handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'No profile found for this handle.';
        return res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

// @route GET api/profile/user/:user_id
// @desc Get a profile by user ID
// @access Public
router.get('/user/:user_id', (req, res, next) => {
  const { user_id } = req.params;
  let errors = {};
  Profile.findOne({ user: user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'No profile found for this user.';
        return res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

// @route POST api/profile/experience
// @desc Add experience to a profile
// @access Private
router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    const { errors, isValid } = validateExperienceInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noprofile = 'No profile found for this user.';
          return res.status(404).json(errors);
        }
        const newExp = {
          ...req.body
        };
        //add experience to the beginning
        profile.experience.unshift(newExp);
        return profile.save();
      })
      .then(profile => res.json(profile))
      .catch(err => {
        res.status(500).json(err);
      });
  }
);

// @route POST api/profile/education
// @desc Add education to a profile
// @access Private
router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    const { errors, isValid } = validateEducationInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noprofile = 'No profile found for this user.';
          return res.status(404).json(errors);
        }
        const newEdu = {
          ...req.body
        };
        //add experience to the beginning
        profile.education.unshift(newEdu);
        return profile.save();
      })
      .then(profile => res.json(profile))
      .catch(err => {
        res.status(500).json(err);
      });
  }
);

// @route DELETE api/profile/experience/:exp_id
// @desc Remove experience from a profile
// @access Private
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    const { exp_id } = req.params;
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const removeIdx = profile.experience
          .map(item => item._id)
          .indexOf(exp_id);

        profile.experience.splice(removeIdx, 1);
        return profile.save();
      })
      .then(profile => res.json(profile))
      .catch(err => {
        res.status(500).json(err);
      });
  }
);

// @route DELETE api/profile/education/:edu_id
// @desc Remove education from a profile
// @access Private
router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    const { edu_id } = req.params;
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const removeIdx = profile.education
          .map(item => item._id)
          .indexOf(edu_id);

        profile.education.splice(removeIdx, 1);
        return profile.save();
      })
      .then(profile => res.json(profile))
      .catch(err => {
        res.status(500).json(err);
      });
  }
);

// @route DELETE api/profile
// @desc Remove the profile and the use
// @access Private
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    const userId = req.user.id;
    Profile.findOneAndRemove({ user: userId })
      .then(() => {
        return User.findByIdAndRemove(userId);
      })
      .then(() => res.json({ message: "Successfully deleted user's account" }))
      .catch(err => {
        res.status(500).json(err);
      });
  }
);

module.exports = router;
