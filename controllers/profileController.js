const mongoose = require('mongoose');
const Profile = mongoose.model('Profile');
const User = mongoose.model('User');
const {
  validateProfileInput,
  validateExperienceInput,
  validateEducationInput,
  errorResponse
} = require('../../handlers/validation');
const createError = require('../utils/createError');

const profileController = {};

// @route GET api/profile
// @desc Get a user profile
// @access Privte
profileController.getUserProfile = async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id }).populate(
    'user',
    ['name', 'avatar']
  );
  res.json(profile);
};

// @route POST api/profile
// @desc Create OR Edit a user profile
// @access Privte
profileController.createProfile = async (req, res) => {
  const userId = req.user.id;
  const { errors, isValid } = validateProfileInput(req.body);
  if (!isValid) {
    errorResponse(errors);
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
  const profile = await Profile.findOne({ user: userId });

  if (profile) {
    //Update
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: profileData },
      { new: true }
    );
    res.json(updatedProfile);
  } else {
    //Create
    //see if handle exists
    const profileWithHandle = await Profile.findOne({
      handle: profileData.handle
    });
    if (profileWithHandle) {
      createError('Profile Handle', 400, {
        handle: 'That profile handle is already in use.'
      });
    }

    const newProfile = new Profile(profileData);
    await newProfile.save();
    res.status(201).json(newProfile);
  }
};

// @route GET api/profile/all
// @desc Get all profiles
// @access Public
profileController.getAllProfiles = async (req, res) => {
  const profiles = await Profile.find({}).populate('user', ['name', 'avatar']);
  res.json(profiles);
};

// @route GET api/profile/handle/:handle
// @desc Get a profile b its handle
// @access Public
profileController.getProfileByHandle = async (req, res) => {
  const { handle } = req.params;
  const profile = await Profile.findOne({ handle }).populate('user', [
    'name',
    'avatar'
  ]);
  if (!profile) {
    createError('No Profile', 404, {
      message: `No profile found with the handle ${handle}`
    });
  }
  res.json(profile);
};

// @route GET api/profile/user/:user_id
// @desc Get a profile by user ID
// @access Public
profileController.getProfileByUserId = async (req, res) => {
  const { user_id } = req.params;
  const profile = await Profile.findOne({ user: user_id }).populate('user', [
    'name',
    'avatar'
  ]);
  if (!profile) {
    createError('No Profile', 404, {
      message:
        'No profile found for this user, they may have deleted their account.'
    });
  }
  res.json(profile);
};

// @route POST api/profile/experience
// @desc Add experience to a profile
// @access Private
profileController.createExperience = async (req, res) => {
  const { errors, isValid } = validateExperienceInput(req.body);
  if (!isValid) {
    errorResponse(errors);
  }
  const profile = await Profile.findOne({ user: req.user.id });
  if (!profile) {
    createError('No Profile', 404, {
      message: 'No profile found for this user.'
    });
  }
  const newExp = {
    ...req.body
  };
  //add experience to the beginning
  profile.experience.unshift(newExp);
  await profile.save();
  res.status(201).json(profile);
};

// @route POST api/profile/education
// @desc Add education to a profile
// @access Private
profileController.createEducation = async (req, res) => {
  const { errors, isValid } = validateEducationInput(req.body);
  if (!isValid) {
    errorResponse(errors);
  }
  const profile = await Profile.findOne({ user: req.user.id });
  if (!profile) {
    createError('No Profile', 404, {
      message: 'No profile found for this user.'
    });
  }
  const newEdu = {
    ...req.body
  };
  profile.education.unshift(newEdu);
  await profile.save();
  res.status(201).json(profile);
};

// @route DELETE api/profile/experience/:exp_id
// @desc Remove experience from a profile
// @access Private
profileController.deleteExperience = async (req, res) => {
  const { exp_id } = req.params;
  const profile = await Profile.findOne({ user: req.user.id });
  if (!profile) {
    createError('No Profile.', 404, { message: 'No profile found.' });
  }
  const updatedExperience = profile.experience.filter(
    exp => exp._id.toString() !== exp_id
  );
  profile.experience = updatedExperience;
  await profile.save();
  res.json(profile);
};

// @route DELETE api/profile/education/:edu_id
// @desc Remove education from a profile
// @access Private
profileController.deleteEducation = async (req, res) => {
  const { edu_id } = req.params;
  const profile = await Profile.findOne({ user: req.user.id });
  if (!profile) {
    createError('No Profile.', 404, { message: 'No profile found.' });
  }
  const updatedEducation = profile.education.filter(
    edu => edu._id.toString() !== edu_id
  );
  profile.education = updatedEducation;
  await profile.save();
  res.json(profile);
};

// @route DELETE api/profile
// @desc Remove the profile and the user
// @access Private
profileController.deleteProfile = async (req, res) => {
  const userId = req.user.id;
  const profilePromise = Profile.findOneAndRemove({ user: userId });
  const userPromise = User.findByIdAndRemove(userId);
  await Promise.all[(profilePromise, userPromise)];
  res.json({ message: "Successfully deleted user's account." });
};

module.exports = profileController;
