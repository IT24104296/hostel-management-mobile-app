export const isValidUsername = (username) => {
  const value = String(username || "").trim();
  return /^[a-zA-Z0-9._-]{3,20}$/.test(value);
};

export const isValidEmail = (email) => {
  const value = String(email || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isStrongEnoughPassword = (password) => {
  const value = String(password || "");
  return value.length >= 6;
};

export const validateSignupForm = ({ username, email, password }) => {
  const errors = {};

  if (!username?.trim()) {
    errors.username = "Username is required";
  } else if (username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters";
  } else if (username.trim().length > 20) {
    errors.username = "Username must be at most 20 characters";
  } else if (!isValidUsername(username)) {
    errors.username =
      "Username can contain letters, numbers, dot, underscore and hyphen only";
  }

  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (!isValidEmail(email)) {
    errors.email = "Invalid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
};

export const validateLoginForm = ({ username, password }) => {
  const errors = {};

  if (!username?.trim()) {
    errors.username = "Username is required";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
};