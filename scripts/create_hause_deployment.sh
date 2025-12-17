#!/bin/bash
set -euo pipefail

# Deployment script for hause.ink
# Creates a complete package for cPanel upload

echo "🏠 Building Hause.ink Deployment Package..."
echo "============================================"

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Clean previous builds
rm -rf for_deployment
rm -f hause_deployment.zip

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the frontend
echo "🔨 Building frontend for production..."
npm run build

# Create deployment folder
echo "📁 Creating deployment folder..."
mkdir -p for_deployment

# Copy built frontend files
echo "📋 Copying frontend build..."
cp -r dist/* for_deployment/

# Copy PHP API files
echo "📋 Copying PHP API files..."
cp -r api for_deployment/

# Copy database schema
echo "📋 Copying database schema..."
mkdir -p for_deployment/database
cp database/schema.sql for_deployment/database/

# Create uploads directories
echo "📁 Creating uploads directories..."
mkdir -p for_deployment/uploads/images
mkdir -p for_deployment/uploads/videos
touch for_deployment/uploads/.gitkeep
touch for_deployment/uploads/images/.gitkeep
touch for_deployment/uploads/videos/.gitkeep

# Create .htaccess for Apache
echo "📝 Creating .htaccess..."
cat > for_deployment/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Handle Authorization Header
  RewriteCond %{HTTP:Authorization} .
  RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

  # Allow direct access to API files
  RewriteCond %{REQUEST_URI} ^/api/ [NC]
  RewriteRule ^ - [L]

  # Allow direct access to uploads folder
  RewriteCond %{REQUEST_URI} ^/uploads/ [NC]
  RewriteRule ^ - [L]

  # Redirect Trailing Slashes (if not a folder)
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} (.+)/$
  RewriteRule ^ %1 [L,R=301]

  # Handle React Router - SPA routing
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/json application/javascript text/javascript application/font-woff application/font-woff2 image/svg+xml
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  
  # Cache Control
  <FilesMatch "\.(js|css|png|jpg|jpeg|gif|webp|svg|woff|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  
  <FilesMatch "\.(html|php)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
</IfModule>

# Prevent directory listing
Options -Indexes

# Prevent access to sensitive files
<FilesMatch "^\.">
  Order allow,deny
  Deny from all
</FilesMatch>
EOF

# Create deployment instructions
echo "📝 Creating deployment instructions..."
cat > for_deployment/DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# Hause.ink Deployment Instructions
=====================================

## Your Configuration:
- Domain: hause.ink
- Database: hause_inksun
- Database User: hause_sunjida
- Admin Email: sunjida@hause.ink
- Admin Password: admin123

## Step 1: Upload Files to cPanel

1. Login to cPanel at your hosting provider
2. Go to **File Manager**
3. Navigate to **public_html** folder
4. **Delete or backup existing files** in public_html
5. Click **Upload** in the toolbar
6. Upload the entire contents of this folder (NOT the folder itself)
   - Select all files: index.html, assets/, api/, uploads/, .htaccess, etc.
7. After upload, verify these exist in public_html:
   - index.html
   - assets/ (folder)
   - api/ (folder)
   - uploads/ (folder)
   - .htaccess (enable "Show Hidden Files" to see it)

## Step 2: Set Up Database

1. In cPanel, go to **phpMyAdmin**
2. Select your database: **hause_inksun**
3. Click **Import** tab
4. Choose the file: database/schema.sql
5. Click **Go** to run the import
6. This creates all tables and the admin user

## Step 3: Set File Permissions

In cPanel File Manager, right-click and set permissions:
- api/ folder → 755
- uploads/ folder → 755
- uploads/images/ → 755
- uploads/videos/ → 755

## Step 4: Test Your Site

1. Visit https://hause.ink
2. Click "Admin Login" or go to https://hause.ink/admin
3. Login with:
   - Email: sunjida@hause.ink
   - Password: admin123
4. **IMPORTANT: Change your password immediately after first login!**

## Troubleshooting

### Blank Page or 500 Error
- Check .htaccess is uploaded (enable Show Hidden Files)
- Verify PHP version is 7.4 or higher in cPanel → Select PHP Version

### API Errors / "Failed to fetch"
- Verify database credentials in api/config.php match your cPanel MySQL
- Check api/ folder has 755 permissions
- Test directly: https://hause.ink/api/properties.php?action=list

### Images Not Uploading
- Check uploads/ folder has 755 permissions
- Ensure sufficient disk space

### Can't Login
- Re-import database/schema.sql
- Clear browser cache and cookies

## File Structure
```
public_html/
├── index.html          (main app)
├── assets/             (JS, CSS, images)
├── api/               
│   ├── config.php      (database config)
│   ├── auth.php        (login/logout)
│   ├── properties.php  (property CRUD)
│   ├── bookings.php    (booking management)
│   ├── leads.php       (lead management)
│   ├── settings.php    (site settings)
│   ├── media.php       (media library)
│   ├── pages.php       (CMS pages)
│   ├── stats.php       (dashboard stats)
│   └── upload.php      (file uploads)
├── uploads/
│   ├── images/
│   └── videos/
├── database/
│   └── schema.sql
└── .htaccess
```

## Admin Panel Features
- Dashboard with statistics
- Property management (add, edit, delete)
- Booking management
- Lead management
- Media library
- Site settings (hero, contact, branding, SEO)
- Facebook Pixel & Google Analytics integration
- CMS pages

## Support
For issues, check the browser console (F12) for errors.
EOF

# Create the ZIP file
echo "📦 Creating ZIP archive..."
cd for_deployment
zip -r ../hause_deployment.zip . -x "*.DS_Store"
cd ..

echo ""
echo "✅ Deployment package created successfully!"
echo "============================================"
echo ""
echo "📁 Folder ready: for_deployment/"
echo "📦 ZIP file ready: hause_deployment.zip"
echo ""
echo "🔑 Admin Credentials:"
echo "   Email: sunjida@hause.ink"
echo "   Password: admin123"
echo ""
echo "📋 Next Steps:"
echo "   1. Download for_deployment/ or hause_deployment.zip"
echo "   2. Upload contents to cPanel public_html"
echo "   3. Import database/schema.sql via phpMyAdmin"
echo "   4. Visit https://hause.ink"
echo ""
