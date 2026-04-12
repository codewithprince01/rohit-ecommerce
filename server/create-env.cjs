const fs = require('fs');

const envContent = `PORT=5000
MONGODB_URI=mongodb+srv://prinsaibritannica_db_user:rohit123@cluster0.ogwldd4.mongodb.net/
JWT_ACCESS_SECRET=grocery_access_secret_key_2024_change_in_production
JWT_REFRESH_SECRET=grocery_refresh_secret_key_2024_change_in_production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173`;

fs.writeFileSync('.env', envContent);
console.log('.env file created successfully');
