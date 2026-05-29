import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import SubSubCategory from '../models/SubSubCategory.js';
import Product from '../models/Product.js';
import { seedData } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const slugify = (text) => {
  if (!text) return 'generic-item';
  let slug = text.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\u0900-\u097F]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
  return slug || `item-${Math.random().toString(36).substring(2, 7)}`;
};

const cleanData = async () => {
  console.log('Cleaning existing data...');
  await Category.deleteMany();
  await Subcategory.deleteMany();
  await SubSubCategory.deleteMany();
  await Product.deleteMany();
  console.log('Data cleaned.');
};

/**
 * HIGH-FIDELITY IMAGE DISCOVERY ENGINE
 * Uses multi-layered keyword mapping for maximum visual relevance.
 */
const getImageUrl = (query, categoryContext = '', subContext = '') => {
  const q = query.toLowerCase();
  const c = categoryContext.toLowerCase();
  const s = subContext.toLowerCase();
  
  // 1. HARD-MAPPED LUXURY DEFAULTS (For consistency in key categories)
  const mapping = [
    { key: ['baby', 'diaper', 'pampers'], tag: 'baby,care,diaper' },
    { key: ['namkeen', 'bhujia', 'haldiram'], tag: 'indian,snacks,namkeen' },
    { key: ['chips', 'lays', 'kurkure'], tag: 'chips,snacks,pack' },
    { key: ['shampoo', 'dove', 'pantene'], tag: 'shampoo,bottle,beauty' },
    { key: ['oil', 'fortune', 'mustard'], tag: 'cooking,oil,bottle' },
    { key: ['atta', 'flour', 'ashirvaad'], tag: 'flour,grain,sack' },
    { key: ['milk', 'dairy', 'amul'], tag: 'milk,dairy,bottle' },
    { key: ['soap', 'lux', 'dettol'], tag: 'soap,wash,clean' },
    { key: ['maggi', 'noodle'], tag: 'noodle,instant,food' },
    { key: ['chocolate', 'cadbury', 'dairymilk'], tag: 'chocolate,sweet' },
    { key: ['biscuit', 'parle', 'marie'], tag: 'biscuit,cookies' },
    { key: ['tea', 'coffee', 'tata'], tag: 'tea,coffee,pack' },
    { key: ['rice', 'basmati'], tag: 'rice,grain' },
    { key: ['dal', 'pulse'], tag: 'lentils,dal,grain' },
    { key: ['detergent', 'surf', 'tide'], tag: 'detergent,powder,clean' },
    { key: ['pooja', 'agarbatti', 'religious'], tag: 'incense,hindu,temple' }
  ];

  const matched = mapping.find(m => m.key.some(k => q.includes(k) || s.includes(k)));
  const keywords = matched ? matched.tag : [q, s, c].filter(Boolean).join(',');

  // Using a specific random seed to ensure different images for different products
  const randomSeed = Math.floor(Math.random() * 1000);
  return `https://loremflickr.com/800/800/${keywords.replace(/\s+/g, '')}/all?lock=${randomSeed}`;
};

const importData = async () => {
  try {
    await connectDB();
    await cleanData();

    let categoryCount = 0;
    let subCategoryCount = 0;
    let subSubCategoryCount = 0;
    let productCount = 0;
    const usedSlugs = new Set();

    const getUniqueSlug = (name) => {
      let baseSlug = slugify(name);
      let finalSlug = baseSlug;
      let counter = 1;
      while (usedSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      usedSlugs.add(finalSlug);
      return finalSlug;
    };

    for (const catData of seedData) {
      const category = await Category.create({
        name: catData.name,
        slug: getUniqueSlug(catData.name),
        image: getImageUrl(catData.name)
      });
      categoryCount++;

      if (catData.subcategories) {
        for (const subData of catData.subcategories) {
          const subCategory = await Subcategory.create({
            name: subData.name,
            slug: getUniqueSlug(subData.name),
            category: category._id,
            image: getImageUrl(subData.name, catData.name)
          });
          subCategoryCount++;

          if (subData.subsubcategories) {
            for (const subSubData of subData.subsubcategories) {
              const subSubCategory = await SubSubCategory.create({
                name: subSubData.name,
                slug: getUniqueSlug(subSubData.name),
                subcategory: subCategory._id,
                image: getImageUrl(subSubData.name, subData.name, catData.name)
              });
              subSubCategoryCount++;

              if (subSubData.products) {
                for (const prodData of subSubData.products) {
                  const slug = getUniqueSlug(prodData.name);
                  await Product.create({
                    name: prodData.name,
                    slug: slug,
                    price: prodData.price || 0,
                    description: `Premium grade ${prodData.name}. Sourced from the finest ${subSubData.name} collections. High quality and fresh.`,
                    category: category._id,
                    subCategory: subCategory._id,
                    subSubCategory: subSubCategory._id,
                    image: getImageUrl(prodData.name, subSubData.name, subData.name),
                    stock: 100
                  });
                  productCount++;
                }
              }
            }
          }
        }
      }
      console.log(`Successfully Populated: ${catData.name} (Integrated All Layers)`);
    }

    console.log('\n--- Final Seeding Report ---');
    console.log(`Departments: ${categoryCount}`);
    console.log(`Sections: ${subCategoryCount}`);
    console.log(`Brands: ${subSubCategoryCount}`);
    console.log(`Products: ${productCount}`);
    console.log('----------------------------');
    console.log('PLATFORM FULLY HYDRATED WITH PREMIUM IMAGERY!');
    process.exit();
  } catch (error) {
    console.error('Seeding Integrity Failure:', error);
    process.exit(1);
  }
};

importData();
