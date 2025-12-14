#!/bin/bash

# Build script for cPanel deployment
# This script creates a deployment-ready zip file

echo "Building for cPanel deployment..."

# Build the React app
npm run build

# Create uploads directory if it doesn't exist
mkdir -p dist/uploads

# Create a deployment zip
cd dist
zip -r ../deployment.zip . -x "*.DS_Store" -x "__MACOSX/*"
cd ..

echo ""
echo "✅ Build complete!"
echo ""
echo "Next steps:"
echo "1. Upload deployment.zip to your cPanel File Manager"
echo "2. Extract it to public_html/"
echo "3. Edit api/config.php with your database credentials"
echo "4. Import database/schema.sql via phpMyAdmin"
echo ""
echo "See CPANEL_DEPLOYMENT.md for detailed instructions."
