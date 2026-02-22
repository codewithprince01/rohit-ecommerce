import slugify from 'slugify';

/**
 * Generate URL-friendly slug from text
 */
export const createSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
};

/**
 * Generate unique slug by appending timestamp if needed
 */
export const createUniqueSlug = (text) => {
  const baseSlug = createSlug(text);
  const timestamp = Date.now();
  return `${baseSlug}-${timestamp}`;
};

/**
 * Validate and sanitize slug
 */
export const validateSlug = (slug) => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};
