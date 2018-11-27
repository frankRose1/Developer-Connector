const express = require('express');
const router = express.Router();
const passport = require('passport');
const profileController = require('../../controllers/profileController');
const { catchErrors } = require('../../handlers/errors');

//All routes are prepended with /api/profile

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  catchErrors(profileController.getUserProfile)
);
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  catchErrors(profileController.createProfile)
);
router.get('/all', catchErrors(profileController.getAllProfiles));
router.get(
  '/handle/:handle',
  catchErrors(profileController.getProfileByHandle)
);
router.get('/user/:user_id', catchErrors(profileController.getProfileByUserId));
router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  catchErrors(profileController.createExperience)
);
router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  catchErrors(profileController.createEducation)
);
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  catchErrors(profileController.deleteExperience)
);
router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  catchErrors(profileController.deleteEducation)
);
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  catchErrors(profileController.deleteProfile)
);

module.exports = router;
