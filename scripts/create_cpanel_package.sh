#!/bin/bash

# cPanel Deployment Package Creator
# This script creates a complete deployment package for cPanel hosting

set -e

echo "========================================"
echo "  cPanel Deployment Package Creator"
echo "========================================"

# Configuration
PACKAGE_NAME="hause-rental-$(date +%Y%m%d-%H%M%S)"
DIST_DIR="dist"
API_DIR="api"
OUTPUT_DIR="deployment-packages"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

# Step 1: Build the frontend
echo -e "\n${YELLOW}Step 1: Building frontend...${NC}"
npm run build

if [ ! -d "$DIST_DIR" ]; then
    echo -e "${RED}Error: Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Step 2: Create output directory
echo -e "\n${YELLOW}Step 2: Preparing package directory...${NC}"
mkdir -p "$OUTPUT_DIR"
PACKAGE_PATH="$OUTPUT_DIR/$PACKAGE_NAME"
mkdir -p "$PACKAGE_PATH"

# Step 3: Copy frontend files
echo -e "\n${YELLOW}Step 3: Copying frontend files...${NC}"
cp -r "$DIST_DIR"/* "$PACKAGE_PATH/"
echo -e "${GREEN}✓ Frontend files copied${NC}"

# Step 4: Copy API files
echo -e "\n${YELLOW}Step 4: Copying API files...${NC}"
if [ -d "$API_DIR" ]; then
    cp -r "$API_DIR" "$PACKAGE_PATH/"
    echo -e "${GREEN}✓ API files copied${NC}"
else
    echo -e "${RED}Warning: API directory not found${NC}"
fi

# Step 5: Copy database schema
echo -e "\n${YELLOW}Step 5: Copying database schema...${NC}"
if [ -d "database" ]; then
    mkdir -p "$PACKAGE_PATH/database"
    cp -r database/* "$PACKAGE_PATH/database/"
    echo -e "${GREEN}✓ Database schema copied${NC}"
fi

# Step 6: Create .htaccess for SPA routing
echo -e "\n${YELLOW}Step 6: Creating .htaccess for SPA routing...${NC}"
cat > "$PACKAGE_PATH/.htaccess" << 'EOF'
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Handle API requests - let them pass through to PHP
    RewriteRule ^api/ - [L]
    
    # Handle uploads folder
    RewriteRule ^uploads/ - [L]
    
    # Handle existing files and directories
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Redirect all other requests to index.html (SPA routing)
    RewriteRule . /index.html [L]
</IfModule>

# Enable CORS for API
<IfModule mod_headers.c>
    <FilesMatch "\.(php)$">
        Header set Access-Control-Allow-Origin "*"
        Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    </FilesMatch>
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Compress text files
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
EOF
echo -e "${GREEN}✓ .htaccess created${NC}"

# Step 7: Create deployment README
echo -e "\n${YELLOW}Step 7: Creating deployment instructions...${NC}"
cat > "$PACKAGE_PATH/DEPLOYMENT_INSTRUCTIONS.md" << 'EOF'
# Hause Rental - cPanel Deployment Instructions

## Quick Start

1. **Upload Files**
   - Upload ALL contents of this package to your `public_html` folder
   - Do NOT upload the package folder itself, only its contents

2. **Configure Database**
   - Create a MySQL database in cPanel
   - Create a database user with full privileges
   - Import `database/schema.sql` using phpMyAdmin

3. **Configure API**
   - Edit `api/config.php` with your database credentials:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'your_database_name');
   define('DB_USER', 'your_database_user');
   define('DB_PASS', 'your_database_password');
   ```

4. **Create Upload Directory**
   - Create folder: `public_html/uploads`
   - Set permissions to 755

5. **Create Admin User**
   - Register at your domain
   - Use phpMyAdmin to update user role:
   ```sql
   UPDATE user_roles SET role = 'admin' WHERE user_id = 'YOUR_USER_ID';
   ```

## Folder Structure After Upload

```
public_html/
├── index.html
├── assets/
├── api/
│   ├── config.php (configure this!)
│   ├── auth.php
│   ├── properties.php
│   ├── bookings.php
│   ├── leads.php
│   ├── settings.php
│   ├── stats.php
│   ├── media.php
│   ├── pages.php
│   └── upload.php
├── database/
│   └── schema.sql
├── uploads/ (create this)
└── .htaccess
```

## Admin Features

Access the admin dashboard at: `yourdomain.com/admin`

### Facebook Pixel Setup
1. Go to Admin > Settings > Marketing
2. Enter your Facebook Pixel ID
3. Enable tracking events as needed

### Mapbox Setup (Optional)
1. Go to Admin > Settings > Integrations
2. Enter your Mapbox public token
3. Properties will show on map view

## Troubleshooting

### API returns 500 error
- Check `api/config.php` has correct database credentials
- Verify PHP version is 7.4+
- Check error logs in cPanel

### Images not uploading
- Verify `uploads` folder exists with 755 permissions
- Check PHP upload_max_filesize setting

### Login not working
- Clear browser cache/cookies
- Verify users table exists in database

## Support

For issues, check the project documentation or contact support.
EOF
echo -e "${GREEN}✓ Deployment instructions created${NC}"

# Step 8: Create the ZIP package
echo -e "\n${YELLOW}Step 8: Creating ZIP package...${NC}"
cd "$OUTPUT_DIR"
zip -r "$PACKAGE_NAME.zip" "$PACKAGE_NAME" -x "*.DS_Store" -x "*__MACOSX*"
cd ..
echo -e "${GREEN}✓ ZIP package created${NC}"

# Step 9: Cleanup
echo -e "\n${YELLOW}Step 9: Cleaning up...${NC}"
rm -rf "$PACKAGE_PATH"
echo -e "${GREEN}✓ Cleanup complete${NC}"

# Final output
echo -e "\n========================================"
echo -e "${GREEN}Package created successfully!${NC}"
echo -e "========================================"
echo -e "\nPackage location: ${YELLOW}$OUTPUT_DIR/$PACKAGE_NAME.zip${NC}"
echo -e "\nNext steps:"
echo -e "1. Upload and extract the ZIP to your public_html folder"
echo -e "2. Configure api/config.php with database credentials"
echo -e "3. Import database/schema.sql"
echo -e "4. Create uploads directory with 755 permissions"
echo ""
