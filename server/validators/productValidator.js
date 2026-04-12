import Joi from 'joi';

// Product creation/update validation
export const productSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Product name is required',
      'string.min': 'Product name must be at least 2 characters long',
      'string.max': 'Product name cannot exceed 200 characters'
    }),
  
  description: Joi.string()
    .trim()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  
  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  
  comparePrice: Joi.number()
    .min(0)
    .allow(null)
    .messages({
      'number.base': 'Compare price must be a number',
      'number.min': 'Compare price cannot be negative'
    }),
  
  unit: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Unit is required'
    }),
  
  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid category ID',
      'any.required': 'Category is required'
    }),
  
  inStock: Joi.boolean()
    .default(true),
  
  featured: Joi.boolean()
    .default(false),
  
  tags: Joi.array()
    .items(Joi.string().trim())
    .default([]),
  
  isActive: Joi.boolean()
    .default(true),
  
  stock: Joi.number()
    .min(0)
    .default(0),

  images: Joi.array().items(Joi.any()).allow(null)
}).unknown(true);

// Product query validation
export const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
  sort: Joi.string().valid('price', '-price', 'name', '-name', 'createdAt', '-createdAt').default('-createdAt'),
  search: Joi.string().trim().allow(''),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  inStock: Joi.string().valid('true', 'false'),
  featured: Joi.string().valid('true', 'false'),
  isActive: Joi.string().valid('true', 'false').default('true')
});
