const generateSlug = (length = 6) => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
};

// Helper to validate slugs
const validateSlug = (slug: string): boolean => {
  const reservedKeywords = ["admin", "api", "help", "login", "signup", "404"];

  // Updated regex:
  // 1. Allows 3-12 characters
  // 2. Can contain letters (a-z, A-Z), numbers (0-9), and at most one hyphen (-)
  const slugRegex = /^(?!.*--)(?!^-)(?!.*-$)[a-zA-Z0-9-]{3,12}$/;

  // Validate the slug against the regex and check for reserved keywords
  return slugRegex.test(slug) && !reservedKeywords.includes(slug.toLowerCase());
};

module.exports = { generateSlug, validateSlug };
