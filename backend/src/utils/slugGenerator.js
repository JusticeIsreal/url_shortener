// generate slug value
const generateSlug = (length = 4) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
};

// Helper to validate slugs
const validateSlug = (slug) => {
  const reservedKeywords = ["admin", "api", "help", "login", "signup"];
  const slugRegex = /^[a-zA-Z0-9-]{3,12}$/;

  return slugRegex.test(slug) && !reservedKeywords.includes(slug.toLowerCase());

  // Slug rules:
  // 1. Must be 3-12 characters long
  // 2. Must contain only alphanumeric characters and hyphens
  // 3. Should not match reserved keywords
};

module.exports = { generateSlug, validateSlug };
