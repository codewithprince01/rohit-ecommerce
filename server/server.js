import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import compression from 'compression';

import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import dbCheck from './middleware/dbCheck.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Prevent XSS attacks
// xss-clean is a bit old/unmaintained but commonly requested. 
// Alternatively, we can rely on React's auto-escaping and helmet.
// app.use(xss()); 

// Prevent NoSQL injection
app.use(mongoSanitize());

// Prevent Parameter Pollution
app.use(hpp());

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Better error logging for debugging
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    if (res.statusCode >= 400) {
      console.log(`[Response Error] ${req.method} ${req.url} - Status: ${res.statusCode} - Message: ${data.message || 'No message'}`);
    }
    return originalJson.call(this, data);
  };
  next();
});

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Compression
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  message: 'Too many requests from this IP, please try again after 10 minutes'
});
app.use('/api', limiter);

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply DB check to all /api routes
app.use('/api', dbCheck);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/customers', customerRoutes);

// Also expose them under /api/v1 for API versioning
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/customers', customerRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
