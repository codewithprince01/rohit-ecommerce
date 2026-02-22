import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Category from './models/Category.js';
import Subcategory from './models/Subcategory.js';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Subcategory.deleteMany();
    await Product.deleteMany();

    // Create Admin User
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123', // Will be hashed by pre-save hook
      role: 'admin',
      mobile: '9999999999',
      address: 'Admin HQ'
    });

    // Create Categories
    // Helper to create slug
    const createSlug = (str) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    // Create Categories with Slugs
    const categoriesData = [
      { name: 'Fruits & Vegetables', order: 1 },
      { name: 'Dairy & Bakery', order: 2 },
      { name: 'Staples', order: 3 },
      { name: 'Snacks & Branded Foods', order: 4 },
      { name: 'Personal Care', order: 5 },
      { name: 'Home Care', order: 6 },
    ].map(cat => ({
      ...cat,
      slug: createSlug(cat.name)
    }));

    const categories = await Category.insertMany(categoriesData);

    // Create Subcategories for Fruits & Veg
    const fv = categories[0];
    const subcategoriesData = [
      { name: 'Fresh Fruits', category: fv._id },
      { name: 'Fresh Vegetables', category: fv._id },
      { name: 'Herbs & Seasonings', category: fv._id },
    ].map(sub => ({
      ...sub,
      slug: createSlug(sub.name)
    }));

    const subcategories = await Subcategory.insertMany(subcategoriesData);

    // Create Sample Product
    await Product.create({
      name: 'Fresh Onion',
      slug: 'fresh-onion',
      description: 'High quality fresh onions.',
      price: 30,
      comparePrice: 40,
      unit: '1 kg',
      category: fv._id,
      subcategory: subcategories[1]._id,
      stock: 100,
      images: [], // Add placeholder if needed
      user: adminUser._id
    });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Subcategory.deleteMany();
    await Product.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
