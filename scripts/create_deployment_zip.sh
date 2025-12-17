#!/bin/bash

# Hause.ink Deployment Package Creator
# Creates a complete ZIP ready for cPanel upload

set -e

echo "🏠 Creating Hause.ink Deployment Package..."
echo "============================================"

# Clean up previous builds
rm -rf for_deployment
rm -f hause_deployment.zip

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Create deployment directory
echo "📁 Creating deployment structure..."
mkdir -p for_deployment
mkdir -p for_deployment/api
mkdir -p for_deployment/database
mkdir -p for_deployment/uploads/properties
mkdir -p for_deployment/uploads/media

# Copy frontend build
echo "📋 Copying frontend files..."
cp -r dist/* for_deployment/

# Copy API files
echo "📋 Copying API files..."
cp -r api/* for_deployment/api/

# Copy database files
echo "📋 Copying database files..."
cp database/schema.sql for_deployment/database/
cp database/set_admin_password.sql for_deployment/database/

# Copy password setup script
cp for_deployment_manual/set_admin_password.php for_deployment/

# Create .htaccess for Apache
echo "📋 Creating .htaccess..."
cat > for_deployment/.htaccess << 'HTACCESS'
# Hause.ink Apache Configuration
RewriteEngine On
RewriteBase /

# Force HTTPS (uncomment in production)
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle API requests
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ api/$1 [L]

# Handle uploads
RewriteCond %{REQUEST_URI} ^/uploads/
RewriteRule ^uploads/(.*)$ uploads/$1 [L]

# Handle static assets
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Route everything else to index.html (React Router)
RewriteRule ^ index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# GZIP Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript application/javascript application/json
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
</IfModule>

# Prevent directory listing
Options -Indexes

# Protect sensitive files
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
HTACCESS

# Create .gitkeep files for upload directories
touch for_deployment/uploads/properties/.gitkeep
touch for_deployment/uploads/media/.gitkeep

# Create README with deployment instructions
cat > for_deployment/DEPLOY_README.txt << 'README'
===============================================
HAUSE.INK DEPLOYMENT INSTRUCTIONS
===============================================

ADMIN CREDENTIALS:
Email: sunjida@hause.ink
Password: Sunji@#$%

STEP 1: Upload Files
--------------------
1. Login to cPanel
2. Open File Manager
3. Navigate to public_html
4. Upload and extract this ZIP file
5. Make sure all files are in public_html root (not in a subfolder)

STEP 2: Database Setup
----------------------
1. Open phpMyAdmin in cPanel
2. Select database: hause_inksun
3. Click "Import" tab
4. Choose file: database/schema.sql
5. Click "Go" to import

STEP 3: Set Admin Password
--------------------------
1. Visit: https://hause.ink/set_admin_password.php
2. Wait for success message
3. DELETE set_admin_password.php immediately!

STEP 4: Verify
--------------
1. Visit: https://hause.ink
2. Visit: https://hause.ink/admin
3. Login with credentials above

STEP 5: Cleanup
---------------
Delete these files after setup:
- set_admin_password.php
- DEPLOY_README.txt
- database/ folder (optional)

TROUBLESHOOTING:
----------------
- Blank page? Check .htaccess is uploaded
- API errors? Verify api/config.php has correct DB credentials
- Login fails? Run set_admin_password.php again

Database Config (api/config.php):
- Host: localhost
- Database: hause_inksun
- User: hause_sunjida
- Password: Pjokjict4@#$%

===============================================
README

# Create the ZIP file
echo "📦 Creating ZIP archive..."
cd for_deployment
zip -r ../hause_deployment.zip . -x "*.DS_Store"
cd ..

# Show results
echo ""
echo "============================================"
echo "✅ Deployment package created successfully!"
echo "============================================"
echo ""
echo "📦 File: hause_deployment.zip"
echo "📏 Size: $(du -h hause_deployment.zip | cut -f1)"
echo ""
echo "🔐 Admin Credentials:"
echo "   Email: sunjida@hause.ink"
echo "   Password: Sunji@#$%"
echo ""
echo "📋 Next Steps:"
echo "   1. Download hause_deployment.zip"
echo "   2. Upload to cPanel File Manager"
echo "   3. Extract to public_html"
echo "   4. Import database/schema.sql in phpMyAdmin"
echo "   5. Run set_admin_password.php once"
echo "   6. Delete set_admin_password.php"
echo "   7. Login at /admin"
echo ""
