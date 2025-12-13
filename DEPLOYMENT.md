# Technical Deployment Guide for Amsterdam Dream Stays

This document provides detailed technical information for deploying the Amsterdam Dream Stays property rental platform to cPanel shared hosting with MySQL backend.

**Production Domain:** https://hause.ink

## Table of Contents

1. [Database Setup](#database-setup)
2. [Build Process](#build-process)
3. [Environment Variables](#environment-variables)
4. [Backend Connection](#backend-connection)
5. [File Upload Details](#file-upload-details)
6. [Apache Configuration](#apache-configuration)
7. [SSL Configuration](#ssl-configuration)
8. [PHP Configuration](#php-configuration)
9. [Troubleshooting](#troubleshooting)
10. [Performance Optimization](#performance-optimization)
11. [Security Considerations](#security-considerations)

---

## Database Setup

### MySQL Database Creation

1. **Login to cPanel** → MySQL Databases
2. **Create Database**: `amsterdam_dream_stays`
3. **Create User**: Choose a strong username and password
4. **Add User to Database**: Grant ALL privileges

### Import Database Schema

1. **Open phpMyAdmin** from cPanel
2. **Select your database**
3. **Import** → Choose `database/schema.sql`
4. **Click Go** to execute the SQL

### Configure Database Connection

Edit `api/config.php` with your database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'amsterdam_dream_stays');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
```

### Default Admin Account

- **Email**: admin@amsterdamdreamstays.com
- **Password**: admin123
- ⚠️ **Change this password immediately after first login!**

---

## Build Process

### Prerequisites

```bash
node --version  # Requires 18+
npm --version   # Requires 9+
```

### Build Commands

```bash
# Install dependencies
npm install

# Development server (for testing)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

### Build Output

The `npm run build` command creates a `dist/` folder:

```
dist/
├── index.html              # Entry point
├── assets/
│   ├── index-[hash].js     # Main JavaScript bundle
│   ├── index-[hash].css    # Compiled CSS
│   └── [images]            # Optimized images
├── .htaccess               # Apache routing rules
├── robots.txt              # SEO configuration
├── favicon.png             # Site icon
└── haus-logo.png           # Logo for emails
```

---

## Environment Variables

### Database Configuration

Database credentials are configured in `api/config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'amsterdam_dream_stays');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
```

**Important:** Update these values with your actual cPanel MySQL database credentials.

### File Permissions

Ensure these directories are writable by the web server:

```bash
chmod 755 api/
chmod 755 uploads/
chmod 755 uploads/images/
chmod 755 uploads/videos/
```

---

## Backend Connection

### Architecture

```
┌─────────────────┐         ┌──────────────────────┐
│   cPanel Host   │         │   cPanel MySQL       │
│   (Full Stack)  │ ←────── │   (Database)         │
│                 │   PHP   │                      │
│  - HTML/CSS/JS  │         │  - All Data          │
│  - PHP API      │         │  - User Accounts     │
│  - File Storage │         │  - Properties        │
│  - Admin Panel  │         │  - Bookings/Leads    │
└─────────────────┘         └──────────────────────┘
```

### What's on cPanel

- **Frontend**: React application (HTML/CSS/JS)
- **Backend**: PHP API endpoints
- **Database**: MySQL database
- **File Storage**: Local file system for uploads
- **Authentication**: PHP session-based auth
- Edge functions (email, sitemap)
- Realtime subscriptions

### What's Deployed to cPanel

- **Frontend**: React application (HTML/JS/CSS)
- **Backend**: PHP API files
- **Database**: MySQL schema and data
- **File Storage**: Upload directories
- **Configuration**: .htaccess, database config

### API Resilience

All API calls include error handling with fallback defaults:

```typescript
const fetchProperties = async () => {
  try {
    const response = await apiClient.getProperties({ status: 'approved' });
    return response.properties || [];
  } catch (error) {
    console.warn('API error, using static data:', error);
    return staticProperties;
  }
};
```
    console.warn('Fetch error, using defaults:', err);
  } finally {
    setLoading(false);
  }
}, []);
```

---

## File Upload Details

### Upload Checklist

| File/Folder | Required | Purpose |
|-------------|----------|---------|
| `index.html` | ✅ Yes | Entry point |
| `assets/` | ✅ Yes | JS, CSS, images |
| `api/` | ✅ Yes | PHP backend API |
| `database/` | ✅ Yes | MySQL schema |
| `uploads/` | ✅ Yes | File upload directories |
| `.htaccess` | ✅ Yes | SPA routing & security |
| `robots.txt` | ✅ Yes | SEO |
| `favicon.png` | ✅ Yes | Browser icon |

### Upload Methods

#### Method 1: File Manager (Recommended for small updates)

1. Open cPanel → File Manager
2. Navigate to `public_html`
3. Click Upload
4. Select all files from `dist/`

#### Method 2: FTP (Recommended for large updates)

```bash
# Using lftp
lftp -u username,password ftp.yourdomain.com
cd public_html
mirror -R dist/ .
```

#### Method 3: Git (Advanced)

If cPanel supports Git:

1. Go to cPanel → Git Version Control
2. Create repository pointing to your GitHub repo
3. Set deployment directory to `public_html`
4. Pull and build on server

---

## Apache Configuration

### Complete .htaccess

```apache
# Enable rewrite engine
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Remove www (optional - choose one)
  # RewriteCond %{HTTP_HOST} ^www\.(.*)$ [NC]
  # RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

  # Handle React Router
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>

# Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

### Testing mod_rewrite

Create a test file to verify mod_rewrite is enabled:

```php
<?php
// test-rewrite.php
if (function_exists('apache_get_modules')) {
    if (in_array('mod_rewrite', apache_get_modules())) {
        echo "mod_rewrite is enabled";
    } else {
        echo "mod_rewrite is NOT enabled";
    }
} else {
    echo "Cannot determine - check with hosting provider";
}
```

---

## SSL Configuration

### AutoSSL (cPanel)

Most cPanel installations include AutoSSL:

1. Go to cPanel → SSL/TLS Status
2. Click "Run AutoSSL"
3. Wait 5-10 minutes
4. Verify at `https://hause.link`

### Manual SSL Installation

If using a custom certificate:

1. Go to cPanel → SSL/TLS → Manage SSL Sites
2. Select domain
3. Paste Certificate (CRT)
4. Paste Private Key
5. Paste CA Bundle (if provided)
6. Click Install

### Testing SSL

```bash
# Check certificate
curl -vI https://hause.link 2>&1 | grep -A5 "Server certificate"

# Test HTTPS redirect
curl -I http://hause.link
# Should return 301 redirect to https://
```

---

## PHP Configuration

### PHP Version Requirements

- **PHP 7.4+** required
- **MySQLi** or **PDO** extension enabled
- **File upload** support enabled
- **Session support** enabled

### PHP Settings Check

Create a `phpinfo.php` file to verify PHP configuration:

```php
<?php
phpinfo();
?>
```

Visit `https://hause.ink/phpinfo.php` and check:
- PHP version ≥ 7.4
- `pdo_mysql` extension loaded
- `file_uploads = On`
- `upload_max_filesize ≥ 5M`
- `post_max_size ≥ 8M`

### Session Configuration

Ensure sessions work properly by checking `phpinfo.php` for:
- `session.save_path` is writable
- `session.gc_maxlifetime` is reasonable (default 1440 seconds)

### File Permissions

Set correct permissions for PHP files and directories:

```bash
# API files should be executable
chmod 644 api/*.php

# Upload directories should be writable
chmod 755 uploads/
chmod 755 uploads/images/
chmod 755 uploads/videos/
```

### PHP Error Reporting

For debugging, add to `api/config.php`:

```php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
```

**Remove these settings in production!**

---

---

## Troubleshooting

### Common Issues

#### 1. Blank Page

**Symptoms:** White screen, no content

**Solutions:**
- Check browser console (F12) for errors
- Verify `index.html` exists in `public_html`
- Check if assets folder was uploaded
- Verify `.htaccess` is present

#### 2. 404 on Page Refresh

**Symptoms:** Direct URLs like `/properties` return 404

**Solutions:**
- Verify `.htaccess` exists
- Check mod_rewrite is enabled
- Try adding `AllowOverride All` (ask hosting provider)

#### 3. API Errors

**Symptoms:** Data not loading, network errors

**Solutions:**
- Check browser console for CORS errors
- Verify Supabase project is active
- Check if you're on a blocked network

#### 4. Mixed Content Warnings

**Symptoms:** Yellow/orange warnings in console

**Solutions:**
- Ensure SSL is active
- Check for hardcoded `http://` URLs
- Force HTTPS in `.htaccess`

#### 5. Slow Loading

**Symptoms:** Site takes long to load

**Solutions:**
- Enable compression in `.htaccess`
- Enable browser caching
- Optimize images
- Use CDN if available

### Debug Mode

Add to browser console to see connection status:

```javascript
// Check Supabase connection
const { data, error } = await window.supabase.from('properties').select('count');
console.log('DB Connection:', error ? 'Failed' : 'OK');
```

### Useful Commands

```bash
# Test if site is accessible
curl -I https://hause.link

# Check DNS propagation
dig hause.link

# Test SSL certificate
openssl s_client -connect hause.link:443 -servername hause.link
```

---

## Performance Optimization

### Recommended Optimizations

1. **Enable Gzip Compression** (in .htaccess above)
2. **Browser Caching** (in .htaccess above)
3. **CDN** (if available through hosting)
4. **Image Optimization** (done automatically by Vite)

### LiteSpeed Cache (if available)

If your cPanel has LiteSpeed:

1. Go to LiteSpeed Web Cache Manager
2. Enable caching for the domain
3. Set cache lifetime (e.g., 1 hour)
4. Exclude dynamic paths: `/admin/*`, `/auth`, `/api/*`

---

## Security Considerations

### Checklist

- [ ] SSL certificate installed and HTTPS forced
- [ ] Security headers in `.htaccess`
- [ ] Admin dashboard requires authentication
- [ ] API keys are embedded (not exposed in source)
- [ ] No sensitive data in client-side code
- [ ] CORS configured on backend

### Rate Limiting

The Lovable Cloud backend handles rate limiting. For additional protection, ask your hosting provider about:
- ModSecurity
- Fail2ban
- CloudFlare integration

---

## Quick Reference

### Update Workflow

```bash
# 1. Pull latest
git pull origin main

# 2. Build
npm run build

# 3. Upload dist/ to cPanel public_html

# 4. Clear cache (if applicable)
```

### Key URLs

| URL | Purpose |
|-----|---------|
| `https://hause.link` | Main website |
| `https://hause.link/admin` | Admin dashboard |
| `https://hause.link/auth` | Login page |
| `https://hause.link/sitemap.xml` | Sitemap |

### Contact

- **Technical Issues:** Check console logs first
- **Hosting Issues:** Contact cPanel provider
- **Backend Issues:** Check Lovable dashboard
