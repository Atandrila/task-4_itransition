import crypto from "crypto";

export function getUniqIdValue(prefix = "") {
  // important: this creates a public unique value for the user.
  // note: database unique indexes still protect uniqueness.
  // nota bene: never depend only on JS for uniqueness.
  return `${prefix}${crypto.randomUUID()}`;
}

export function getEmailToken() {
  // important: this token is used for email verification.
  // note: it must be hard to guess.
  // nota bene: blocked users must stay blocked after verification.
  return crypto.randomBytes(32).toString("hex");
}

export function getPasswordResetToken() {
  // important: this token lets a user reset password securely.
  // note: it expires and is removed after successful reset.
  // nota bene: never put the user's password inside the link.
  return crypto.randomBytes(32).toString("hex");
}
