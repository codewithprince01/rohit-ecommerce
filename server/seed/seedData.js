import mongoose from 'mongoose';

export const adminUser = {
  name: 'Prince Admin',
  email: 'prince@gmail.com',
  password: 'Prince1234',
  role: 'admin',
  phone: '9876543210',
  isActive: true
};

export const categories = [
  { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', order: 1 },
  { name: 'Dairy & Bakery', slug: 'dairy-bakery', order: 2 },
  { name: 'Staples', slug: 'staples', order: 3 },
  { name: 'Snacks & Branded Foods', slug: 'snacks-branded-foods', order: 4 },
  { name: 'Personal Care', slug: 'personal-care', order: 5 },
  { name: 'Home Care', slug: 'home-care', order: 6 },
];

export const subCategories = [
  { name: 'Fresh Fruits', slug: 'fresh-fruits', parentName: 'Fruits & Vegetables' },
  { name: 'Fresh Vegetables', slug: 'fresh-vegetables', parentName: 'Fruits & Vegetables' },
  { name: 'Milk', slug: 'milk', parentName: 'Dairy & Bakery' },
  { name: 'Bread & Pav', slug: 'bread-pav', parentName: 'Dairy & Bakery' },
  { name: 'Atta & Flours', slug: 'atta-flours', parentName: 'Staples' },
  { name: 'Basmati Rice', slug: 'basmati-rice', parentName: 'Rice & Grains' },
];

export const subSubCategories = [
  { name: 'Organic Mangoes', slug: 'organic-mangoes', parentName: 'Fresh Fruits' },
  { name: 'Deli Breads', slug: 'deli-breads', parentName: 'Bread & Pav' },
];

export const products = [
  {
    name: 'Fresh Onion',
    slug: 'fresh-onion',
    description: 'Fresh and organic onions sourced directly from farmers.',
    shortDescription: 'Fresh farm onions (1kg)',
    pricing: {
      mrp: 50,
      sellingPrice: 35,
      costPrice: 20,
      taxRate: 5
    },
    unit: 'kg',
    stock: 150,
    lowStockThreshold: 20,
    categoryName: 'Fruits & Vegetables',
    images: [{ url: 'https://images.unsplash.com/photo-1580149405513-1f2e33f6406c?auto=format&fit=crop&q=80&w=300', isPrimary: true }],
    isActive: true
  },
  {
    name: 'Amul Taaza Milk',
    slug: 'amul-taaza-milk',
    description: 'Fresh homogenized toned milk.',
    shortDescription: '1L Pouch',
    pricing: {
      mrp: 66,
      sellingPrice: 64,
      costPrice: 58,
      taxRate: 0
    },
    unit: 'piece',
    stock: 50,
    lowStockThreshold: 10,
    categoryName: 'Dairy & Bakery',
    images: [{ url: 'https://images.unsplash.com/photo-1550583724-1255818c053b?auto=format&fit=crop&q=80&w=300', isPrimary: true }],
    isActive: true
  },
  {
    name: 'Basmati Rice',
    slug: 'basmati-rice',
    description: 'Long grain aromatic basmati rice.',
    shortDescription: 'Premium Basmati Rice (5kg)',
    pricing: {
      mrp: 800,
      sellingPrice: 650,
      costPrice: 500,
      taxRate: 5
    },
    unit: 'piece',
    stock: 5,
    lowStockThreshold: 10,
    categoryName: 'Staples',
    images: [{ url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300', isPrimary: true }],
    isActive: true
  }
];
