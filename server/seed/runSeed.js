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
  
  // Basic slugify logic
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-\u0900-\u097F]+/g, '') // Remove all non-word chars (allow Hindi range)
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
    
  // Fallback if slug becomes empty (for non-latin/non-hindi chars)
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

const getImageUrl = (query) => {
  const keywords = query.toLowerCase().split(' ').join(',');
  return `https://source.unsplash.com/featured/?${keywords},grocery`;
};

const importData = async () => {
  try {
    await connectDB();
    await cleanData();

    let categoryCount = 0;
    let subCategoryCount = 0;
    let subSubCategoryCount = 0;
    let productCount = 0;
    
    // Track used slugs to prevent E11000 errors
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
            image: getImageUrl(subData.name)
          });
          subCategoryCount++;

          if (subData.subsubcategories) {
            for (const subSubData of subData.subsubcategories) {
              const subSubCategory = await SubSubCategory.create({
                name: subSubData.name,
                slug: getUniqueSlug(subSubData.name),
                subcategory: subCategory._id,
                image: getImageUrl(subSubData.name)
              });
              subSubCategoryCount++;

              if (subSubData.products) {
                for (const prodData of subSubData.products) {
                  const slug = getUniqueSlug(prodData.name);

                  await Product.create({
                    name: prodData.name,
                    slug: slug,
                    price: prodData.price || 0,
                    description: `Premium quality ${prodData.name} from ${subSubData.name}`,
                    category: category._id,
                    subCategory: subCategory._id,
                    subSubCategory: subSubCategory._id,
                    image: getImageUrl(prodData.name),
                    stock: 100
                  });
                  productCount++;
                }
              }
            }
          }
        }
      }
      console.log(`Finished seeding category: ${catData.name}`);
    }

    console.log('\n--- Seeding Summary ---');
    console.log(`Categories: ${categoryCount}`);
    console.log(`Subcategories: ${subCategoryCount}`);
    console.log(`Sub-subcategories: ${subSubCategoryCount}`);
    console.log(`Products: ${productCount}`);
    console.log('-----------------------');
    console.log('Data Seeding Completed Successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

importData();
