# 🚀 Amsterdam Dream Stays v2.0 - FINAL DEPLOYMENT PACKAGE

**Version 2.0 - December 13, 2025**
**Domain: https://hause.ink**
**Status: PRODUCTION READY**

## ⚡ QUICK DEPLOYMENT (5 minutes):

### 1. Upload Package
- Upload this entire folder to cPanel `public_html`
- Extract if uploaded as zip

### 2. Database Setup
```sql
-- Create database in cPanel MySQL
CREATE DATABASE amsterdam_dream_stays;

-- Import schema.sql from database/ folder
-- Use phpMyAdmin or cPanel database tools
```

### 3. Configure Connection
Edit `api/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'amsterdam_dream_stays');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
```

### 4. Set Permissions
```
api/ → 755
uploads/ → 755
uploads/images/ → 755
uploads/videos/ → 755
```

### 5. Launch
- **Site:** https://hause.ink
- **Admin:** https://hause.ink/admin
- **Login:** sunjida@hause.ink / Sunji@#$%

## 📦 Package Contents

```
amsterdam-dream-stays-v2.0-final/
├── index.html                 # Main application
├── assets/                    # Built CSS/JS/images
├── api/                       # PHP backend
│   ├── auth.php              # Authentication
│   ├── properties.php        # Property management
│   ├── bookings.php          # Booking system
│   ├── leads.php             # Lead capture
│   ├── settings.php          # Site settings
│   └── upload.php            # File uploads
├── database/
│   └── schema.sql            # MySQL schema
├── uploads/                   # File storage
│   ├── images/               # Property images
│   └── videos/               # Property videos
├── .htaccess                  # Apache config
├── VERSION.txt                # Version info
└── DEPLOYMENT_README.md       # This file
```

## ✨ What's New in v2.0

- **🔄 Complete Migration** - From Supabase to PHP/MySQL
- **🔐 Security First** - Enhanced authentication & validation
- **📁 Media Management** - Full upload system
- **👨‍💼 Admin Control** - Complete dashboard
- **📱 Mobile Ready** - Responsive design
- **⚡ Performance** - Optimized assets
- **🔍 SEO Ready** - Search engine optimized

## 🐛 Troubleshooting

### Common Issues:
- **Blank page:** Check `.htaccess` and mod_rewrite
- **API errors:** Verify database credentials
- **Upload fails:** Check folder permissions
- **Login issues:** Confirm admin credentials

### Debug:
Create `phpinfo.php`:
```php
<?php phpinfo();
```
Visit: https://hause.ink/phpinfo.php

## ✅ Success Checklist

- [ ] Site loads at https://hause.ink
- [ ] Admin login works
- [ ] Database connected
- [ ] File uploads work
- [ ] SSL active
- [ ] Password changed

---

**Ready for immediate production deployment!** 🚀