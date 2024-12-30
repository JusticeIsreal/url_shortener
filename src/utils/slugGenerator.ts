// generate slug for request body without slug value
export const generateSlug = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let slug = "";
  for (let i = 0; i < 4; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
};

// Helper to validate slugs
export const validateSlug = (slug: string): boolean => {
  const reservedKeywords = ["admin", "api", "help", "login", "signup", "404"];

  // Updated regex:
  // 1. Allows 3-12 characters
  // 2. Can contain letters (a-z, A-Z), numbers (0-9), and at most one hyphen (-)
  const slugRegex = /^(?!.*--)(?!^-)(?!.*-$)[a-zA-Z0-9-]{3,12}$/;

  // Validate the slug against the regex and check for reserved keywords
  return slugRegex.test(slug) && !reservedKeywords.includes(slug);
};

// generate expiration date for request without expiration date
// Utility function to compute the expiration date
export const getDefaultExpirationDate = (): string => {
  const now = new Date();
  now.setDate(now.getDate() + 30); // Default to 30 days from now
  return now.toISOString();
};
