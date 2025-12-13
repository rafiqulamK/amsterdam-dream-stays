#!/bin/bash
set -euo pipefail

echo "🎯 Creating Complete Amsterdam Dream Stays Deployment Package..."
echo "📦 This package includes everything needed for cPanel deployment"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist/ directory not found. Run 'npm run build' first."
    exit 1
fi

# Create timestamp for unique filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PACKAGE_NAME="amsterdam-dream-stays-deployment-${TIMESTAMP}"

echo "📁 Creating deployment package: ${PACKAGE_NAME}"

# Create the deployment package directory
cp -r dist "${PACKAGE_NAME}"

# Create additional deployment files
cat > "${PACKAGE_NAME}/QUICK_START.md" << 'EOF'
# 🚀 Quick Start Guide - Amsterdam Dream Stays

## ⚡ 5-Minute Setup:

1. **Upload:** Upload this entire folder to cPanel `public_html`
2. **Database:** Create MySQL database and import `database/schema.sql`
3. **Config:** Edit `api/config.php` with your database credentials
4. **Permissions:** Set `api/` and `uploads/` to 755
5. **Access:** Visit https://hause.ink and login with admin credentials

## 🔑 Default Admin:
- Email: sunjida@hause.ink
- Password: Sunji@#$%
- **CHANGE PASSWORD IMMEDIATELY**

## ✅ You're Done!
Your property rental platform is now live on hause.ink
EOF

# Create the zip file
echo "📦 Creating zip archive..."
zip -r "${PACKAGE_NAME}.zip" "${PACKAGE_NAME}/"

# Clean up
rm -rf "${PACKAGE_NAME}"

echo ""
echo "✅ Deployment package created successfully!"
echo "📁 File: ${PACKAGE_NAME}.zip"
echo "📊 Size: $(du -h "${PACKAGE_NAME}.zip" | cut -f1)"
echo ""
echo "🚀 Ready for cPanel upload!"
echo "   1. Upload ${PACKAGE_NAME}.zip to cPanel File Manager"
echo "   2. Extract in public_html directory"
echo "   3. Follow QUICK_START.md for setup"
echo ""
echo "🌐 Your site will be live at: https://hause.ink"