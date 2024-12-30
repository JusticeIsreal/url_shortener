"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultExpirationDate =
  exports.validateSlug =
  exports.generateSlug =
    void 0;
// generate slug for request body without slug value
const generateSlug = (length = 6) => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
};
exports.generateSlug = generateSlug;
// Helper to validate slugs
const validateSlug = (slug) => {
  const reservedKeywords = ["admin", "api", "help", "login", "signup", "404"];
  // Updated regex:
  // 1. Allows 3-12 characters
  // 2. Can contain letters (a-z, A-Z), numbers (0-9), and at most one hyphen (-)
  const slugRegex = /^(?!.*--)(?!^-)(?!.*-$)[a-zA-Z0-9-]{3,12}$/;
  // Validate the slug against the regex and check for reserved keywords
  return slugRegex.test(slug) && !reservedKeywords.includes(slug);
};
exports.validateSlug = validateSlug;
// generate expiration date for request without expiration date
// Utility function to compute the expiration date
const getDefaultExpirationDate = () => {
  const now = new Date();
  now.setDate(now.getDate() + 30); // Default to 30 days from now
  return now.toISOString();
};
exports.getDefaultExpirationDate = getDefaultExpirationDate;
