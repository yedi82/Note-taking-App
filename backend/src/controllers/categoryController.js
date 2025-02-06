// /src/controllers/categoryController.js
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

/**
 * Create a new category
 * @param {*} req - Request object containing category name
 * @param {*} res - Response object with created category details or error message
 */
exports.createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body; // Get category name from request body
  const user_id = req.user.id; // Get user ID from authenticated user

  try {
    const newCategory = await Category.create({ name, user_id });
    res.status(201).json(newCategory); // Return the newly created category
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'An error occurred while creating the category' });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ error: 'An error occurred while fetching categories' });
  }
};

//  Update a category by ID
exports.updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params; // Get category ID from request parameters
  const { name } = req.body; // Get updated category name from request body

  try {
    const category = await Category.findOne({ where: { id, user_id: req.user.id } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    category.name = name || category.name;

    await category.save();
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'An error occurred while updating the category' });
  }
};

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Find category by ID and user ID
    const category = await Category.findOne({ where: { id, user_id: req.user.id } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    // Delete the category from the database
    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'An error occurred while deleting the category' });
  }
};

// Add a new category by name
exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }
    // Check if the category already exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(409).json({ error: "Category already exists" });
    }
    // Create and return the new category
    const newCategory = await Category.create({ name});
    res.status(201).json(newCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add category" });
  }
};

// Get a single category by name
exports.getCategory = async (req, res) => {
  const { name } = req.body;

  try {
    // Find the category by name
    const category = await Category.findOne({ where: { name} });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category); // Return the category details
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'An error occurred while fetching the category' });
  }
};

