const validator = require('validator');
const isEmpty = require('../utils/isEmpty');

const validation = {};

validation.validateRegisterInput = data => {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';

  //see if name is between 2 and 30
  if (!validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = 'Name must be between 2 and 30 characters.';
  }

  if (validator.isEmpty(data.name)) {
    errors.name = 'Name is required.';
  }

  if (validator.isEmpty(data.email)) {
    errors.email = 'Email is required.';
  }

  if (!validator.isEmail(data.email)) {
    errors.email = 'Email is invalid.';
  }

  if (!validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = 'Password must be bewteen 6 and 30 characters.';
  }

  if (validator.isEmpty(data.password)) {
    errors.password = 'Password is required.';
  }

  if (validator.isEmpty(data.password2)) {
    errors.password2 = 'Confirm password is required.';
  }

  if (!validator.equals(data.password2, data.password)) {
    errors.password2 = 'Passwords must match.';
  }

  return {
    errors,
    isValid: isEmpty(errors) //if its empty valid must be false
  };
};

validation.validateLoginInput = data => {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';

  if (!validator.isEmail(data.email)) {
    errors.email = 'Please provide a valid email.';
  }

  if (validator.isEmpty(data.password)) {
    errors.password = 'Password is required.';
  }

  return {
    errors,
    isValid: isEmpty(errors) //if its empty valid must be false
  };
};

validation.validateProfileInput = data => {
  let errors = {};
  let { handle, status, skills } = data;
  //if they arnt empty(undefined) use them, else default to empty string
  handle = !isEmpty(handle) ? handle : '';
  status = !isEmpty(status) ? status : '';
  skills = !isEmpty(skills) ? skills : '';

  if (!validator.isLength(handle, { min: 2, max: 40 })) {
    errors.handle = 'Handle must be between 2 and 40 characters.';
  }

  if (validator.isEmpty(handle)) {
    errors.handle = 'Handle is required.';
  }

  if (validator.isEmpty(status)) {
    errors.status = 'Status is required.';
  }

  if (validator.isEmpty(skills)) {
    errors.skills = 'Skills is required.';
  }
  //if the social media is provided, validate it
  const { website, youtube, twitter, facebook, linkedin, instagram } = data;
  if (!isEmpty(website)) {
    if (!validator.isURL(website)) {
      errors.website = 'Not a valid URL.';
    }
  }
  if (!isEmpty(youtube)) {
    if (!validator.isURL(youtube)) {
      errors.youtube = 'Not a valid URL.';
    }
  }
  if (!isEmpty(twitter)) {
    if (!validator.isURL(twitter)) {
      errors.twitter = 'Not a valid URL.';
    }
  }
  if (!isEmpty(facebook)) {
    if (!validator.isURL(facebook)) {
      errors.facebook = 'Not a valid URL.';
    }
  }
  if (!isEmpty(linkedin)) {
    if (!validator.isURL(linkedin)) {
      errors.linkedin = 'Not a valid URL.';
    }
  }
  if (!isEmpty(instagram)) {
    if (!validator.isURL(instagram)) {
      errors.instagram = 'Not a valid URL.';
    }
  }

  return {
    errors,
    isValid: isEmpty(errors) //if its empty valid must be false
  };
};

validation.validateExperienceInput = data => {
  let errors = {};
  let { title, company, from } = data;
  //if they arnt empty(undefined) use them, else default to empty string
  title = !isEmpty(title) ? title : '';
  company = !isEmpty(company) ? company : '';
  from = !isEmpty(from) ? from : '';

  if (validator.isEmpty(title)) {
    errors.title = 'Job title is required.';
  }

  if (validator.isEmpty(company)) {
    errors.company = 'Company is required.';
  }

  if (validator.isEmpty(from)) {
    errors.from = 'From date is required.';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

validation.validateEducationInput = data => {
  let errors = {};
  let { school, degree, fieldOfStudy, from } = data;
  //if they arnt empty(undefined) use them, else default to empty string
  school = !isEmpty(school) ? school : '';
  degree = !isEmpty(degree) ? degree : '';
  from = !isEmpty(from) ? from : '';

  if (validator.isEmpty(school)) {
    errors.school = 'Job title is required.';
  }

  if (validator.isEmpty(degree)) {
    errors.degree = 'Company is required.';
  }

  if (validator.isEmpty(from)) {
    errors.from = 'From date is required.';
  }

  if (validator.isEmpty(fieldOfStudy)) {
    errors.fieldOfStudy = 'Field of study is required.';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

/**
 * Using this for post and comment since they require same field
 */
validation.validatePostInput = data => {
  let errors = {};
  let { text } = data;
  //if they arnt empty(undefined) use them, else default to empty string
  text = !isEmpty(text) ? text : '';

  if (!validator.isLength(text, { min: 10, max: 300 })) {
    errors.text = 'Text field must be between 10 and 300 characters.';
  }

  if (validator.isEmpty(text)) {
    errors.text = 'Text field is required.';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

validation.errorResponse = errors => {
  const err = new Error('Validation Errors');
  err.errors = errors;
  throw err;
};

module.exports = validation;
