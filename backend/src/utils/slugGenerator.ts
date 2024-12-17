const generateSlug = (length = 6) => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
};

// Helper to validate slugs
const validateSlug = (slug:string) => {
  const reservedKeywords = ["admin", "api", "help", "login", "signup", "404"];
  // Adjusted regex to exclude numbers
  const slugRegex = /^[a-zA-Z-]{3,12}$/;

  return slugRegex.test(slug) && !reservedKeywords.includes(slug.toLowerCase());

  // Slug rules:
  // 1. Must be 3-12 characters long
  // 2. Must contain only letters (a-z, A-Z) and hyphens
  // 3. Should not match reserved keywords
};

module.exports = { generateSlug, validateSlug };
