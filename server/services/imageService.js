import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '..', 'uploads');
  }

  /**
   * Generate unique filename with slug and timestamp
   */
  generateFilename(originalName, slug) {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const cleanSlug = slugify(slug, { lower: true, strict: true });
    return `${cleanSlug}-${timestamp}${ext}`;
  }

  /**
   * Get upload path for a specific model and date
   */
  getUploadPath(modelName) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return path.join(this.uploadDir, modelName, `${year}-${month}-${day}`);
  }

  /**
   * Ensure directory exists, create if not
   */
  async ensureDirectory(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Save uploaded file
   */
  async saveFile(file, modelName, slug) {
    const uploadPath = this.getUploadPath(modelName);
    await this.ensureDirectory(uploadPath);
    
    const filename = this.generateFilename(file.originalname, slug);
    const filePath = path.join(uploadPath, filename);
    
    await fs.writeFile(filePath, file.buffer);
    
    // Return relative path for database storage
    const relativePath = path.relative(this.uploadDir, filePath);
    return relativePath.replace(/\\/g, '/'); // Normalize path separators
  }

  /**
   * Delete file from filesystem
   */
  async deleteFile(relativePath) {
    if (!relativePath) return;
    
    try {
      const fullPath = path.join(this.uploadDir, relativePath);
      await fs.unlink(fullPath);
      console.log(`✅ Deleted file: ${relativePath}`);
    } catch (error) {
      console.error(`❌ Error deleting file ${relativePath}:`, error.message);
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(relativePaths) {
    if (!Array.isArray(relativePaths)) return;
    
    const deletePromises = relativePaths.map(path => this.deleteFile(path));
    await Promise.allSettled(deletePromises);
  }

  /**
   * Replace old image with new one
   */
  async replaceImage(oldPath, newFile, modelName, slug) {
    // Delete old image
    await this.deleteFile(oldPath);
    
    // Save new image
    return await this.saveFile(newFile, modelName, slug);
  }

  /**
   * Get full URL for image
   */
  getImageUrl(relativePath, baseUrl = '') {
    if (!relativePath) return null;
    return `${baseUrl}/uploads/${relativePath}`;
  }

  /**
   * Validate image file
   */
  validateImage(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
    }

    return true;
  }

  /**
   * Process multiple image uploads
   */
  async saveMultipleFiles(files, modelName, slug) {
    if (!files || files.length === 0) return [];
    
    const uploadPromises = files.map(file => this.saveFile(file, modelName, slug));
    return await Promise.all(uploadPromises);
  }
}

export default new ImageService();
