# Manual Zip Creation for Amsterdam Dream Stays v2.0

If you can't run the automated script, follow these steps:

## Windows (PowerShell):
```powershell
# Navigate to project directory
cd C:\path\to\amsterdam-dream-stays

# Create timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$packageName = "amsterdam-dream-stays-v2.0-$timestamp"

# Copy dist folder
Copy-Item -Path "dist" -Destination $packageName -Recurse

# Create version file
@"
Amsterdam Dream Stays - Version 2.0
===================================

Release Date: December 13, 2025
Domain: https://hause.ink

DEFAULT ADMIN:
- Email: sunjida@hause.ink
- Password: Sunji@#$%
"@ | Out-File -FilePath "$packageName/VERSION.txt"

# Create zip (requires 7-Zip or PowerShell 5+)
Compress-Archive -Path $packageName -DestinationPath "$packageName.zip"
```

## Linux/Mac (Terminal):
```bash
cd /path/to/amsterdam-dream-stays

# Create timestamp
timestamp=$(date +"%Y%m%d_%H%M%S")
packageName="amsterdam-dream-stays-v2.0-$timestamp"

# Copy dist folder
cp -r dist "$packageName"

# Create version file
cat > "$packageName/VERSION.txt" << 'EOF'
Amsterdam Dream Stays - Version 2.0
===================================

Release Date: December 13, 2025
Domain: https://hause.ink

DEFAULT ADMIN:
- Email: sunjida@hause.ink
- Password: Sunji@#$%
EOF

# Create zip
zip -r "${packageName}.zip" "$packageName/"

# Clean up (optional)
rm -rf "$packageName"
```

## Using File Explorer/Finder:
1. Navigate to the `amsterdam-dream-stays` folder
2. Copy the entire `dist` folder
3. Rename the copy to `amsterdam-dream-stays-v2.0-[timestamp]`
4. Create a `VERSION.txt` file inside with the version info above
5. Right-click the folder → Send to → Compressed (zipped) folder

## Result:
You should have a file named something like:
`amsterdam-dream-stays-v2.0-20251213_143000.zip`

This zip contains the complete, upgraded version ready for cPanel deployment.