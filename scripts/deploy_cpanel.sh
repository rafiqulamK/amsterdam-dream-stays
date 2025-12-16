#!/bin/bash

# ===========================================
# cPanel Deployment Package Creator
# ===========================================
# Creates a complete deployment package for
# cPanel hosting environments (public_html)
# ===========================================

set -e

echo "🚀 Building production bundle..."
npm run build

# Create deployment directory
DEPLOY_DIR="cpanel-deploy"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

echo "📦 Preparing deployment package..."

# Copy frontend build
cp -r dist/* $DEPLOY_DIR/

# Copy API files
mkdir -p $DEPLOY_DIR/api
cp -r api/* $DEPLOY_DIR/api/

# Copy database schema
mkdir -p $DEPLOY_DIR/database
cp database/schema.sql $DEPLOY_DIR/database/

# Create .htaccess for SPA routing
cat > $DEPLOY_DIR/.htaccess << 'HTACCESS'
# Enable rewrite engine
RewriteEngine On

# Handle API requests
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ api/$1 [L]

# Handle static assets
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Route all other requests to index.html (SPA)
RewriteRule ^ index.html [L]

# Enable GZIP compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
HTACCESS

# Create deployment readme
cat > $DEPLOY_DIR/DEPLOY_INSTRUCTIONS.md << 'README'
# cPanel Deployment Instructions

## Quick Deploy Steps

1. **Upload Files**
   - Extract the contents of `cpanel-deploy.zip` 
   - Upload ALL contents to your `public_html` folder

2. **Configure Database**
   - Create a MySQL database in cPanel
   - Import `database/schema.sql` via phpMyAdmin
   - Update `api/config.php` with your database credentials:
     ```php
     define('DB_HOST', 'localhost');
     define('DB_NAME', 'your_database_name');
     define('DB_USER', 'your_database_user');
     define('DB_PASS', 'your_database_password');
     ```

3. **Set Permissions**
   ```
   chmod 755 api/
   chmod 644 api/*.php
   chmod 755 uploads/ (create if needed)
   ```

4. **Test the Installation**
   - Visit your domain to see the frontend
   - Test API: `https://yourdomain.com/api/properties.php`

## Folder Structure After Upload

```
public_html/
├── index.html          # Main app entry
├── assets/             # CSS, JS, images
├── .htaccess           # URL rewriting & caching
├── api/
│   ├── config.php      # Database configuration
│   ├── auth.php        # Authentication endpoints
│   ├── properties.php  # Property CRUD
│   ├── leads.php       # Lead management
│   ├── bookings.php    # Booking management
│   ├── settings.php    # Site settings
│   ├── upload.php      # File uploads
│   ├── stats.php       # Analytics
│   ├── media.php       # Media library
│   └── pages.php       # CMS pages
├── database/
│   └── schema.sql      # Database structure
└── uploads/            # User uploads (create this)
```

## Troubleshooting

### 404 on page refresh
- Ensure `.htaccess` is uploaded and `mod_rewrite` is enabled

### API returns 500 error
- Check `api/config.php` credentials
- Verify PHP version (7.4+ required)
- Check error logs in cPanel

### CORS errors
- The API already includes CORS headers
- Ensure your domain matches the config

### Images not uploading
- Create `uploads/` folder with 755 permissions
- Check PHP `upload_max_filesize` in php.ini
README

# Create the zip file
cd $DEPLOY_DIR
zip -r ../cpanel-deploy.zip .
cd ..

echo ""
echo "✅ Deployment package created successfully!"
echo ""
echo "📁 Package location: cpanel-deploy.zip"
echo "📁 Unzipped folder: cpanel-deploy/"
echo ""
echo "📋 Next steps:"
echo "   1. Upload cpanel-deploy.zip to cPanel File Manager"
echo "   2. Extract to public_html folder"
echo "   3. Configure api/config.php with database credentials"
echo "   4. Import database/schema.sql via phpMyAdmin"
echo ""
echo "📖 See DEPLOY_INSTRUCTIONS.md for detailed guide"
