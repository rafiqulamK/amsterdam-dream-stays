# Final Zip Creation Instructions
# Run these commands in your terminal:

cd /workspaces/amsterdam-dream-stays

# Copy all remaining files from dist to the final package
cp -r dist/assets amsterdam-dream-stays-v2.0-final/
cp -r dist/api amsterdam-dream-stays-v2.0-final/
cp -r dist/database amsterdam-dream-stays-v2.0-final/
cp -r dist/uploads amsterdam-dream-stays-v2.0-final/
cp dist/*.* amsterdam-dream-stays-v2.0-final/ 2>/dev/null || true

# Create the final zip
zip -r amsterdam-dream-stays-v2.0-final.zip amsterdam-dream-stays-v2.0-final

# Check the result
ls -lh amsterdam-dream-stays-v2.0-final.zip

echo "✅ Final deployment package created!"
echo "📦 File: amsterdam-dream-stays-v2.0-final.zip"
echo "🚀 Ready for cPanel upload"