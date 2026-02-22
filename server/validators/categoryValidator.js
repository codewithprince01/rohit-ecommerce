import Joi from 'joi';

// Category validation
export const categorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 2 characters long',
      'string.max': 'Category name cannot exceed 100 characters'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  
  order: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Order must be a number',
      'number.min': 'Order cannot be negative'
    }),
  
  isActive: Joi.boolean()
    .default(true)
});

// Subcategory validation
export const subcategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Subcategory name is required',
      'string.min': 'Subcategory name must be at least 2 characters long',
      'string.max': 'Subcategory name cannot exceed 100 characters'
    }),
  
  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid category ID',
      'any.required': 'Category is required'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  
  isActive: Joi.boolean()
    .default(true)
});

// Sub-subcategory validation
export const subSubCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Sub-subcategory name is required',
      'string.min': 'Sub-subcategory name must be at least 2 characters long',
      'string.max': 'Sub-subcategory name cannot exceed 100 characters'
    }),
  
  subcategory: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid subcategory ID',
      'any.required': 'Subcategory is required'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  
  isActive: Joi.boolean()
    .default(true)
});
