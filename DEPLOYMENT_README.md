# 🚀 Complete cPanel Deployment Package for Amsterdam Dream Stays

## 📦 Deployment Package Contents

Your complete deployment package should include these files and folders:

```
amsterdam-dream-stays-deployment/
├── index.html                 # Main React application
├── assets/                    # CSS, JS, images (built files)
├── api/                       # PHP backend API
│   ├── auth.php
│   ├── bookings.php
│   ├── config.php
│   ├── leads.php
│   ├── properties.php
│   ├── settings.php
│   └── upload.php
├── database/
│   └── schema.sql            # MySQL database schema
├── uploads/                   # File upload directories
│   ├── images/
│   └── videos/
├── .htaccess                  # Apache configuration for SPA routing
├── _redirects                 # Netlify-style redirects
├── robots.txt                 # SEO configuration
├── favicon.ico
├── favicon.png
└── DEPLOYMENT_README.md       # This file
```

## 🛠️ How to Create the Deployment Package

### Option 1: Automated Script (Recommended)

```bash
# Run the deployment script
chmod +x scripts/create_deployment_package.sh
./scripts/create_deployment_package.sh
```

This will create `amsterdam-dream-stays-deployment.zip`

### Option 2: Manual Creation

If the automated script fails:

1. **Build the frontend:**
   ```bash
   npm install
   npm run build
   ```

2. **Copy backend files to dist/:**
   ```bash
   cp -r api/ dist/
   cp -r database/ dist/
   mkdir -p dist/uploads/images dist/uploads/videos
   ```

3. **Create deployment config:**
   ```bash
   cp api/config.php dist/config.example.php
   # Edit dist/config.example.php with your database credentials
   ```

4. **Create zip package:**
   ```bash
   cd dist
   zip -r ../amsterdam-dream-stays-deployment.zip .
   ```

## 📤 cPanel Deployment Steps

### 1. Prepare Your Hosting
- Ensure PHP 7.4+ is available
- MySQL database is accessible
- File Manager access in cPanel

### 2. Upload to cPanel
1. Login to cPanel
2. Go to **File Manager**
3. Navigate to `public_html` (or your domain folder)
4. Click **Upload**
5. Upload `amsterdam-dream-stays-deployment.zip`
6. Extract the zip file in `public_html`

### 3. Database Setup
1. In cPanel, go to **MySQL Databases**
2. Create database: `amsterdam_dream_stays`
3. Create user and grant ALL privileges
4. Go to **phpMyAdmin**
5. Import `database/schema.sql`

### 4. Configure Database Connection
Edit `api/config.php` with your database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
```

### 5. Set File Permissions
In cPanel File Manager:
- Right-click `api/` → **Permissions** → 755
- Right-click `uploads/` → **Permissions** → 755
- Right-click `uploads/images/` → **Permissions** → 755
- Right-click `uploads/videos/` → **Permissions** → 755

### 6. Access Your Site
- **Website:** https://hause.ink
- **Admin Panel:** https://hause.ink/admin
- **Default Admin:**
  - Email: sunjida@hause.ink
  - Password: Sunji@#$%
  - ⚠️ **CHANGE PASSWORD IMMEDIATELY**

## 🔧 Post-Deployment Configuration

### SSL Certificate
1. In cPanel → **SSL/TLS** or **SSL/TLS Status**
2. Find hause.ink domain
3. Click **Run AutoSSL** or **Issue Certificate**

### Custom Domain (if needed)
1. In cPanel → **Domains**
2. Add domain: hause.ink
3. Point DNS to your hosting

## 🐛 Troubleshooting

### Common Issues:

**Blank page after deployment:**
- Check browser console (F12) for errors
- Verify `.htaccess` file exists
- Ensure mod_rewrite is enabled

**404 errors on routes:**
- `.htaccess` file missing or incorrect
- mod_rewrite disabled on server

**API not working:**
- Check `api/config.php` database credentials
- Verify PHP MySQL extensions loaded
- Check file permissions on `api/` folder

**Images not loading:**
- Check `uploads/` directory permissions
- Verify file paths in database

### Debug Steps:
1. Create `phpinfo.php` in root:
   ```php
   <?php phpinfo(); ?>
   ```
2. Visit https://hause.ink/phpinfo.php
3. Check PHP version ≥7.4
4. Verify `pdo_mysql` extension loaded

## 📞 Support

- **Technical Issues:** Check browser console and server logs
- **Database Issues:** Verify credentials in `api/config.php`
- **Permission Issues:** Use cPanel File Manager to set permissions

## ✅ Success Checklist

- [ ] Site loads at https://hause.ink
- [ ] Admin login works with default credentials
- [ ] Database connection successful
- [ ] File uploads working
- [ ] SSL certificate active
- [ ] Password changed from default

---

**Deployment completed on:** $(date)
**Domain:** https://hause.ink
**Admin Email:** sunjida@hause.ink