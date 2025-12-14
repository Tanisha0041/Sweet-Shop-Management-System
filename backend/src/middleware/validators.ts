import { body, query, param, ValidationChain } from 'express-validator';
import { SweetCategory } from '../entities/Sweet';

/**
 * Validation rules for user registration
 */
export const registerValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('username')
    .isLength({ min: 3, max: 100 })
    .withMessage('Username must be between 3 and 100 characters')
    .trim(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

/**
 * Validation rules for user login
 */
export const loginValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for creating a sweet
 */
export const createSweetValidation: ValidationChain[] = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Name must be between 1 and 200 characters')
    .trim(),
  body('description')
    .optional()
    .isString()
    .trim(),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(Object.values(SweetCategory))
    .withMessage(`Category must be one of: ${Object.values(SweetCategory).join(', ')}`),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
];

/**
 * Validation rules for updating a sweet
 */
export const updateSweetValidation: ValidationChain[] = [
  param('id')
    .notEmpty()
    .withMessage('Sweet ID is required'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Name must be between 1 and 200 characters')
    .trim(),
  body('description')
    .optional()
    .isString()
    .trim(),
  body('category')
    .optional()
    .isIn(Object.values(SweetCategory))
    .withMessage(`Category must be one of: ${Object.values(SweetCategory).join(', ')}`),
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
];

/**
 * Validation rules for searching sweets
 */
export const searchSweetValidation: ValidationChain[] = [
  query('name')
    .optional()
    .isString()
    .trim(),
  query('category')
    .optional()
    .isIn(Object.values(SweetCategory))
    .withMessage(`Category must be one of: ${Object.values(SweetCategory).join(', ')}`),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a non-negative number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a non-negative number'),
];

/**
 * Validation rules for purchase
 */
export const purchaseValidation: ValidationChain[] = [
  param('id')
    .notEmpty()
    .withMessage('Sweet ID is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
];

/**
 * Validation rules for restock
 */
export const restockValidation: ValidationChain[] = [
  param('id')
    .notEmpty()
    .withMessage('Sweet ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
];
