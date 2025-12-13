#!/bin/bash
# Simple zip creation script for Amsterdam Dream Stays v2.0

echo "📦 Creating Amsterdam Dream Stays v2.0 Final Deployment Package..."

# Copy dist to final package
cp -r dist amsterdam-dream-stays-v2.0-final

# Add final version info
cat > amsterdam-dream-stays-v2.0-final/FINAL_VERSION.txt << 'EOF'
Amsterdam Dream Stays - FINAL v2.0
==================================

Created: December 13, 2025
Domain: https://hause.ink
Status: READY FOR DEPLOYMENT

This is the complete, production-ready package for cPanel deployment.

DEFAULT ADMIN:
- Email: sunjida@hause.ink
- Password: Sunji@#$%

CONTENTS:
- Complete React frontend
- PHP/MySQL backend
- Database schema
- Upload directories
- Deployment documentation

DEPLOYMENT: Upload to cPanel public_html and follow DEPLOYMENT_README.md
EOF

# Create the zip
zip -r amsterdam-dream-stays-v2.0-final.zip amsterdam-dream-stays-v2.0-final

echo "✅ Created: amsterdam-dream-stays-v2.0-final.zip"
echo "📊 Size: $(du -h amsterdam-dream-stays-v2.0-final.zip | cut -f1)"
echo ""
echo "🚀 Ready for cPanel upload!"