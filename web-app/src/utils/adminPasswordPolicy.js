const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 32;
const SPECIAL_CHARACTER_PATTERN = /[!@#$%^&*]/;

export const ADMIN_PASSWORD_POLICY_HINT =
  "Use 8-32 characters with uppercase, lowercase, number, and !@#$%^&*.";

export function getAdminPasswordPolicyErrors(password) {
  const value = password || "";
  const errors = [];

  if (value.length < MIN_PASSWORD_LENGTH || value.length > MAX_PASSWORD_LENGTH) {
    errors.push("Use 8-32 characters.");
  }

  if (!/[A-Z]/.test(value)) {
    errors.push("Add an uppercase letter.");
  }

  if (!/[a-z]/.test(value)) {
    errors.push("Add a lowercase letter.");
  }

  if (!/\d/.test(value)) {
    errors.push("Add a number.");
  }

  if (!SPECIAL_CHARACTER_PATTERN.test(value)) {
    errors.push("Add a special character (!@#$%^&*).");
  }

  return errors;
}

export function isAdminPasswordValid(password) {
  return getAdminPasswordPolicyErrors(password).length === 0;
}
