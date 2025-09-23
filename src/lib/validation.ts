import Joi from 'joi';

// Login validation
export const loginSchema = Joi.object({
  password: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password is required',
      'string.max': 'Password is too long',
      'any.required': 'Password is required'
    })
});

// Giveaway creation validation
export const createGiveawaySchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .required()
    .trim()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title is required',
      'string.max': 'Title must be less than 200 characters',
      'any.required': 'Title is required'
    }),
  description: Joi.string()
    .max(1000)
    .allow('', null)
    .trim()
    .messages({
      'string.max': 'Description must be less than 1000 characters'
    })
});

// Giveaway ID validation
export const giveawayIdSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid giveaway ID format',
      'any.required': 'Giveaway ID is required'
    })
});

// Validation middleware
export function validateRequest(schema: Joi.ObjectSchema) {
  return function(data: unknown): { error?: string; value?: unknown } {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      return { error: errorMessage };
    }
    
    return { value };
  };
}
