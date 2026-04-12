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
      name: 'Prince Admin',
      email: 'prince@gmail.com',
      password: 'Prince1234', // Will be hashed by pre-save hook
      role: 'admin',
      mobile: '9999999999',
      address: 'Admin HQ'
    });

    // Create Categories with Hierarchy
    const categoriesData = [
      { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', order: 1 },
      { name: 'Dairy & Bakery', slug: 'dairy-bakery', order: 2 },
      { name: 'Staples', slug: 'staples', order: 3 },
      { name: 'Snacks & Branded Foods', slug: 'snacks-branded-foods', order: 4 },
      { name: 'Personal Care', slug: 'personal-care', order: 5 },
      { name: 'Home Care', slug: 'home-care', order: 6 },
    ];

    const categories = await Category.insertMany(categoriesData);

    // Create a subcategory under Fruits & Veg
    const freshFruits = await Category.create({
      name: 'Fresh Fruits',
      slug: 'fresh-fruits',
      parent: categories[0]._id,
      order: 1
    });

    // Create Sample Product
    await Product.create({
      name: 'Fresh Onion',
      slug: 'fresh-onion',
      description: 'High quality fresh onions.',
      shortDescription: 'Fresh onions from the farm.',
      pricing: {
        mrp: 40,
        sellingPrice: 30,
        costPrice: 20,
        taxRate: 5
      },
      unit: 'kg',
      category: categories[0]._id,
      stock: 100,
      images: [{ url: 'https://images.unsplash.com/photo-1580149405513-1f2e33f6406c?auto=format&fit=crop&q=80&w=300', isPrimary: true }],
      createdBy: adminUser._id
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
