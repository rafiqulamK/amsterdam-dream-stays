# Technical Deployment Guide for Hause.link

This document provides detailed technical information for deploying the Hause property rental platform to cPanel shared hosting.

**Production Domain:** https://hause.link

## Table of Contents

1. [Build Process](#build-process)
2. [Environment Variables](#environment-variables)
3. [Backend Connection](#backend-connection)
4. [File Upload Details](#file-upload-details)
5. [Apache Configuration](#apache-configuration)
6. [SSL Configuration](#ssl-configuration)
7. [Edge Functions](#edge-functions)
8. [Troubleshooting](#troubleshooting)
9. [Performance Optimization](#performance-optimization)
10. [Security Considerations](#security-considerations)

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

### How They Work

Environment variables are **embedded at build time**. The `.env` file contains:

```env
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon-key]
VITE_SUPABASE_PROJECT_ID=[project-id]
```

**Important:** These values are baked into the JavaScript bundle during `npm run build`. You do NOT need to configure environment variables on cPanel.

### Accessing in Code

```typescript
// These are available in the built application
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

---

## Backend Connection

### Architecture

```
┌─────────────────┐         ┌──────────────────────┐
│   cPanel Host   │         │   Lovable Cloud      │
│   (Frontend)    │ ←────── │   (Backend)          │
│                 │  HTTPS  │                      │
│  - HTML/CSS/JS  │         │  - Database          │
│  - Static files │         │  - Authentication    │
│                 │         │  - Edge Functions    │
│                 │         │  - File Storage      │
└─────────────────┘         └──────────────────────┘
```

### What Stays on Lovable Cloud

- PostgreSQL database (all data)
- User authentication
- File storage (images uploaded via admin)
- Edge functions (email, sitemap)
- Realtime subscriptions

### What Goes to cPanel

- React application (HTML/JS/CSS)
- Static images from `src/assets/`
- Configuration files (.htaccess, robots.txt)

### Connection Resilience

All data hooks include error handling with fallback defaults:

```typescript
const fetchSettings = useCallback(async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'hero_section')
      .maybeSingle();

    if (error) {
      console.warn('Using defaults:', error.message);
      return;
    }
    // Use data...
  } catch (err) {
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
| `.htaccess` | ✅ Yes | SPA routing |
| `robots.txt` | ✅ Yes | SEO |
| `favicon.png` | ✅ Yes | Browser icon |
| `haus-logo.png` | ✅ Yes | Email templates |

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

## Edge Functions

### Available Functions

| Function | URL | Purpose | Auth Required |
|----------|-----|---------|---------------|
| sitemap | `/sitemap.xml` | Dynamic XML sitemap | No |
| send-notification-email | (internal) | Lead & admin emails | Optional (webhook secret) |

### Sitemap Function

The sitemap is dynamically generated and returns fresh data:

```
https://hause.link/sitemap.xml
→ Proxied to edge function
→ Returns XML with all properties and pages
```

**Note:** The sitemap URL in `robots.txt` points to `https://hause.link/sitemap.xml`, which the edge function handles via the configured route.

### Email Function Security

The email notification function supports optional webhook secret authentication:

1. **Generate a secret** in Admin Dashboard → Settings → Email Notifications → Security tab
2. **Save the settings** to store the secret in the database
3. **Add the secret** as `EMAIL_WEBHOOK_SECRET` in your backend secrets
4. When configured, unauthorized email requests will be rejected

**Note:** If no secret is configured, the endpoint remains open (suitable for development, not recommended for production).

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
