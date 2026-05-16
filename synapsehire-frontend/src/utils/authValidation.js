export const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

export const validateSignup = ({ name, email, password }) => {
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  if (!validateEmail(email)) errors.email = 'Enter a valid email address.';
  if (!password || password.length < 8) errors.password = 'Password must be at least 8 characters.';
  return errors;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!validateEmail(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  return errors;
};
