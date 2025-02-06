// /src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addCategory,
  getCategory
} = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const {authorizeCategory} = require('../middleware/authorizationMiddleware');
const { check } = require('express-validator');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Route to add a new category.
router.post('/add-category', addCategory);
// Route to fetch a specific category based on provided parameters.
router.post('/get-category', getCategory);

// Route to retrieve all categories.
router.get('/', getAllCategories);
// Route to create a new category.
router.post(
  '/',
  [
    check('name').notEmpty().withMessage('Category name is required')
    ],
    (req, res, next) => {
      if (!req.validationErrors) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      next();
    },
  createCategory
);
// Route to update an existing category.
router.put(
  '/:id',
  [
      //Validate that 'name' field, if provided, is not empty.
    check('name').optional().notEmpty().withMessage('Category name cannot be empty')
    ],
    (req, res, next) => {
      if (!req.validationErrors) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      next();
    },
    //authorization to ensure the user is allowed to update the category.
    authorizeCategory,
  updateCategory
);
// Route to delete an existing category.
router.delete('/:id',authorizeCategory, deleteCategory);

module.exports = router;