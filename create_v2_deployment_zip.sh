#!/bin/bash
set -euo pipefail

echo "🎯 Creating New Amsterdam Dream Stays Deployment Package (v2.0)..."
echo "📦 Complete cPanel-ready distribution with all fixes and upgrades"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist/ directory not found. Run 'npm run build' first."
    exit 1
fi

# Create timestamp for unique filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PACKAGE_NAME="amsterdam-dream-stays-v2.0-${TIMESTAMP}"

echo "📁 Creating deployment package: ${PACKAGE_NAME}"

# Create the deployment package directory
cp -r dist "${PACKAGE_NAME}"

# Add version info
cat > "${PACKAGE_NAME}/VERSION.txt" << 'EOF'
Amsterdam Dream Stays - Version 2.0
===================================

Release Date: December 13, 2025
Domain: https://hause.ink

CHANGES:
- Complete Supabase to PHP/MySQL migration
- Enhanced security and authentication
- File upload system with validation
- Admin dashboard improvements
- Responsive design optimizations
- SEO and performance enhancements

DEFAULT ADMIN:
- Email: sunjida@hause.ink
- Password: Sunji@#$%
- CHANGE PASSWORD IMMEDIATELY AFTER LOGIN

TECHNICAL SPECS:
- Frontend: React 18 + TypeScript + Vite
- Backend: PHP 7.4+ + MySQL
- Hosting: cPanel Shared Hosting
- SSL: Required (AutoSSL recommended)
EOF

# Create the zip file
echo "📦 Creating zip archive..."
zip -r "${PACKAGE_NAME}.zip" "${PACKAGE_NAME}/"

# Get file size
FILE_SIZE=$(du -h "${PACKAGE_NAME}.zip" | cut -f1)

# Clean up
rm -rf "${PACKAGE_NAME}"

echo ""
echo "✅ New deployment package created successfully!"
echo "📁 File: ${PACKAGE_NAME}.zip"
echo "📊 Size: ${FILE_SIZE}"
echo ""
echo "🚀 Ready for cPanel deployment!"
echo "   1. Download ${PACKAGE_NAME}.zip"
echo "   2. Upload to cPanel File Manager"
echo "   3. Extract in public_html directory"
echo "   4. Follow DEPLOYMENT_README.md for setup"
echo ""
echo "🌐 Live site: https://hause.ink"
echo "👨‍💼 Admin: https://hause.ink/admin"