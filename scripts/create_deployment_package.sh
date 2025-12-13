#!/bin/bash
set -euo pipefail

# Complete deployment script for Amsterdam Dream Stays
# Creates a full deployment package with frontend, backend, database, and uploads

echo "🏗️  Building Amsterdam Dream Stays for cPanel deployment..."

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Create uploads directories in dist if they don't exist
echo "📁 Setting up directories..."
mkdir -p dist/api
mkdir -p dist/database
mkdir -p dist/uploads/images
mkdir -p dist/uploads/videos

# Copy PHP API files
echo "📋 Copying PHP API files..."
cp -r api/* dist/api/

# Copy database schema
echo "🗄️  Copying database schema..."
cp -r database/* dist/database/

# Copy uploads directory structure (empty directories will be created on server)
echo "📤 Setting up uploads directories..."
touch dist/uploads/.gitkeep
touch dist/uploads/images/.gitkeep
touch dist/uploads/videos/.gitkeep

# Create deployment configuration file
echo "⚙️  Creating deployment config..."
cat > dist/config.example.php << 'EOF'
<?php
// Database Configuration - Update with your cPanel MySQL credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');

// Site Configuration
define('SITE_URL', 'https://hause.ink');
define('ADMIN_EMAIL', 'sunjida@hause.ink');
define('ADMIN_PASSWORD', 'Sunji@#$%'); // Change immediately after first login

// File Upload Configuration
define('UPLOAD_PATH', __DIR__ . '/uploads/');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
?>
EOF

# Create deployment instructions
cat > dist/DEPLOYMENT_README.md << 'EOF'
# 🚀 Amsterdam Dream Stays - cPanel Deployment

## Quick Deploy Steps:

1. **Upload this entire folder** to your cPanel `public_html` directory
2. **Configure Database:**
   - Create MySQL database in cPanel
   - Import `database/schema.sql`
   - Update `api/config.php` with your database credentials
3. **Set File Permissions:**
   - `api/` → 755
   - `uploads/` → 755
   - `uploads/images/` → 755
   - `uploads/videos/` → 755
4. **Default Admin Account:**
   - Email: sunjida@hause.ink
   - Password: Sunji@#$%
   - **CHANGE PASSWORD IMMEDIATELY AFTER LOGIN**

## File Structure:
- `index.html` - Main application
- `assets/` - CSS, JS, images
- `api/` - PHP backend API
- `database/` - MySQL schema
- `uploads/` - File upload directories
- `.htaccess` - Apache configuration

## Post-Deployment:
1. Visit https://hause.ink
2. Login to admin panel at https://hause.ink/admin
3. Change default admin password
4. Configure site settings

## Troubleshooting:
- Check browser console for errors
- Verify PHP 7.4+ and MySQL extensions
- Ensure file permissions are correct
- Check `.htaccess` is uploaded (enable "Show Hidden Files")
EOF

# Create the deployment zip
echo "📦 Creating deployment package..."
rm -f amsterdam-dream-stays-deployment.zip
cd dist
zip -r ../amsterdam-dream-stays-deployment.zip .
cd ..

echo "✅ Deployment package created: amsterdam-dream-stays-deployment.zip"
echo ""
echo "📋 Deployment Summary:"
echo "   - Frontend: ✅ Built and included"
echo "   - PHP API: ✅ Included"
echo "   - Database Schema: ✅ Included"
echo "   - Upload Directories: ✅ Created"
echo "   - Configuration Template: ✅ Created"
echo "   - Deployment Guide: ✅ Included"
echo ""
echo "🚀 Ready for cPanel upload!"
echo "   Upload 'amsterdam-dream-stays-deployment.zip' to cPanel File Manager"
echo "   Extract in 'public_html' directory"
echo "   Follow DEPLOYMENT_README.md for setup"