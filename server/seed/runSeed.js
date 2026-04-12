import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { adminUser, categories, subCategories, products } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const runSeed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!');

    // 1. Clear existing data
    console.log('Cleaning database...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Database cleaned');

    // 2. Create Admin User
    console.log('Creating Admin User...');
    const admin = await User.create(adminUser);
    console.log('✅ Admin User Created');

    // 3. Create Categories
    console.log('Creating Categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log('✅ Parent Categories Created');

    // 4. Create Subcategories & Sub-subcategories
    console.log('Creating Sub & Sub-sub categories...');
    const buildCategoryTree = async (items, depth = 0) => {
      const allCurrent = await Category.find({});
      for (const item of items) {
        const parent = allCurrent.find(c => c.name === item.parentName);
        if (parent) {
          await Category.create({
            name: item.name,
            slug: item.slug,
            parent: parent._id,
            order: 1
          });
        }
      }
    };

    const { subSubCategories } = await import('./seedData.js');
    await buildCategoryTree(subCategories);
    await buildCategoryTree(subSubCategories);
    
    console.log('✅ All Category Levels Created');

    // 5. Create Products
    console.log('Creating Products...');
    const allCategories = await Category.find({});
    for (const pData of products) {
      const category = allCategories.find(c => c.name === pData.categoryName);
      if (category) {
        const { categoryName, ...productFields } = pData;
        await Product.create({
          ...productFields,
          category: category._id,
          createdBy: admin._id
        });
      }
    }
    console.log('✅ Products Created');

    console.log('🔥🔥 DB SEEDED SUCCESSFULLY 🔥🔥');
    process.exit(0);
  } catch (error) {
    console.error('❌ SEEDING FAILED:', error);
    process.exit(1);
  }
};

runSeed();
