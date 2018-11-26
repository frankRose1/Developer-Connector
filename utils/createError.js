/**
 * Use to create errors where needed throughout the API
 *    note: all errors will be caught by catchErrors handler
 * @param {string} message - Error message
 * @param {interger} statusCode - Error code
 * @param {object} object - Object with specific error info(eg user not found), no needed for every error
 */
const createError = (
  message = 'Server Error',
  statusCode = 500,
  errors = {}
) => {
  const error = new Error(message);
  error.status = statusCode;
  error.errors = errors;
  throw error;
};

module.exports = createError;
