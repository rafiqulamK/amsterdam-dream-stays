# Amsterdam Dream Stays - Property Rental Platform

A modern property rental platform for Amsterdam, built with React, TypeScript, PHP backend, and MySQL database.

## 🌟 Features

### Website Features
- **Property Listings** - Browse rental properties with filters and search
- **Property Detail Pages** - Full property info with image galleries, amenities, energy ratings
- **Lead Capture** - Multi-step questionnaire for interested renters
- **EU Compliance** - GDPR-compliant cookie consent, legal pages
- **SEO Optimized** - Dynamic sitemap, meta tags, structured data
- **Responsive Design** - Works on all devices
- **Dark/Light Mode** - Theme toggle support

### Admin Dashboard Features
- **Analytics Dashboard** - View leads, bookings, and traffic stats
- **Properties Management** - Add, edit, delete rental listings
- **Bookings Management** - Track and manage bookings
- **Leads Management** - View and respond to inquiries
- **Hero Section Editor** - Customize homepage hero with realtime preview
- **Featured Properties** - Select which properties to highlight
- **Section Visibility** - Toggle homepage sections on/off
- **CMS Pages** - Create and edit content pages
- **Media Library** - Upload and manage images
- **Lead Form Config** - Customize the lead capture questionnaire
- **Facebook Pixel Settings** - Configure FB tracking
- **Google Analytics Settings** - Configure GA tracking
- **SEO Settings** - Edit site-wide SEO metadata
- **Email Notifications** - Configure notification recipients
- **Contact Settings** - Update company contact info
- **Social Links** - Manage social media URLs
- **User Roles** - Manage admin and tenant access

---

## �️ Database Setup

This project uses MySQL database instead of Supabase. Before deployment:

### 1. Create MySQL Database
- Login to cPanel → MySQL Databases
- Create database: `amsterdam_dream_stays`
- Create user with full privileges

### 2. Import Schema
- Go to phpMyAdmin
- Import `database/schema.sql`

### 3. Configure Environment
Update `api/config.php` with your database credentials:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'amsterdam_dream_stays');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
```

### 4. Default Admin Account
- Email: admin@amsterdamdreamstays.com
- Password: admin123
- **Change password after first login!**

---

## �🚀 Deployment Guide: GitHub to cPanel

### Prerequisites

Before starting, ensure you have:
- [ ] GitHub account connected to Lovable
- [ ] cPanel hosting account with File Manager access
- [ ] Node.js 18+ installed locally ([install with nvm](https://github.com/nvm-sh/nvm))
- [ ] Git installed on your computer
- [ ] Domain configured (haus.online)

---

### Step 1: Connect Lovable to GitHub

1. In Lovable editor, click **Settings** (gear icon)
2. Go to **GitHub** tab under Integrations
3. Click **Connect to GitHub**
4. Authorize the Lovable GitHub App
5. Click **Create Repository**
6. Note your repository URL (e.g., `https://github.com/username/haus-online`)

---

### Step 2: Clone Repository Locally

Open your terminal and run:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Navigate to project folder
cd YOUR_REPO_NAME

# Install dependencies
npm install
```

---

### Step 3: Build for Production

```bash
# Create production build
npm run build
```

This creates a `dist/` folder containing all production-ready files:
- `index.html` - Main entry point
- `assets/` - JavaScript, CSS, and images
- `.htaccess` - Apache routing configuration

---

### Step 4: Upload to cPanel File Manager

1. **Login to cPanel** at your hosting provider

2. **Open File Manager**
   - Find it under "Files" section
   - Click to open

3. **Navigate to your domain folder**
   - For main domain: `public_html`
   - For subdomain: `public_html/subdomain` or dedicated folder

4. **Backup existing files** (if any)
   - Select all files → Compress → Download backup

5. **Delete old files** (if updating)
   - Select all files in the directory
   - Click Delete (keep `.htaccess` if it has custom rules)

6. **Upload new files**
   - Click **Upload** button in toolbar
   - Drag all contents from your local `dist/` folder
   - Wait for upload to complete

7. **IMPORTANT: Show Hidden Files**
   - Click **Settings** (top right of File Manager)
   - Check **"Show Hidden Files (dotfiles)"**
   - Click Save
   - Verify `.htaccess` file is present in the directory

---

### Step 5: Verify .htaccess Configuration

The `.htaccess` file is **critical** for React Router to work. Verify it contains:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

If the file is missing, create it manually in File Manager:
1. Click **+ File** button
2. Name it `.htaccess` (include the dot)
3. Paste the content above
4. Save

---

### Step 6: Configure SSL Certificate

**HTTPS is required** for security and SEO.

1. In cPanel, go to **SSL/TLS** or **SSL/TLS Status**
2. Find your domain in the list
3. Click **Run AutoSSL** or **Issue Certificate**
4. Wait 5-10 minutes for certificate to be issued
5. Verify by visiting `https://haus.online`

**Force HTTPS (Recommended):**

Add to top of `.htaccess`:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

### Step 7: Connect haus.online Domain

**If domain is at a different registrar:**

1. Login to your domain registrar (GoDaddy, Namecheap, etc.)
2. Go to DNS settings
3. Add/Update these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | Your cPanel IP address | 3600 |
| A | www | Your cPanel IP address | 3600 |

4. Wait 24-48 hours for DNS propagation

**If domain is at cPanel:**

1. Go to **Domains** or **Addon Domains**
2. The domain should already be pointed correctly

---

### Step 8: Post-Deployment Checklist

Test everything works correctly:

- [ ] Homepage loads at `https://haus.online`
- [ ] All page routes work (refresh test: go to `/properties`, refresh page)
- [ ] Property listings display correctly
- [ ] Property detail pages load with images
- [ ] Lead form opens and submits successfully
- [ ] Admin dashboard accessible at `/admin`
- [ ] Authentication (login/logout) works
- [ ] Images load from storage
- [ ] Cookie consent banner appears
- [ ] Dark/light mode toggle works
- [ ] Mobile responsive design works
- [ ] SSL certificate active (padlock in browser)
- [ ] Facebook Pixel fires (use FB Pixel Helper extension)
- [ ] Google Analytics tracking (check GA dashboard)
- [ ] Email notifications received

---

## 🔄 How to Update the Website

When you make changes in Lovable:

1. **Pull latest changes locally:**
   ```bash
   cd YOUR_REPO_NAME
   git pull origin main
   ```

2. **Rebuild:**
   ```bash
   npm install  # Only if dependencies changed
   npm run build
   ```

3. **Upload to cPanel:**
   - Delete old files in `public_html` (except `.htaccess`)
   - Upload new contents from `dist/` folder

4. **Clear cache (if needed):**
   - In cPanel: Go to **LiteSpeed Web Cache Manager** → Flush All
   - Or add cache-busting: The build automatically generates unique filenames

---

## 🔧 Troubleshooting

### Blank page after deployment
- Check browser console for errors (F12)
- Verify `.htaccess` file exists and is correct
- Ensure all files were uploaded from `dist/` folder

### Routes not working (404 errors)
- The `.htaccess` file is missing or incorrect
- mod_rewrite might be disabled on server

### Images not loading
- Check if images are in `assets/` folder
- Verify file paths are correct
- Storage images load from backend automatically

### API/Backend not working
- Backend (Lovable Cloud) is separate from hosting
- Environment variables are embedded during build
- No configuration needed on cPanel

### Mixed content warnings
- Ensure all resources use HTTPS
- Check for hardcoded HTTP URLs

---

## 📁 Project Structure

```
haus-online/
├── public/              # Static files (copied to dist/)
│   ├── .htaccess       # Apache routing config
│   ├── robots.txt      # SEO robots file
│   └── favicon.png     # Site favicon
├── src/
│   ├── assets/         # Images and static assets
│   ├── components/     # React components
│   │   ├── admin/      # Admin dashboard components
│   │   ├── tenant/     # Tenant dashboard components
│   │   └── ui/         # Shadcn UI components
│   ├── contexts/       # React contexts (Auth, Theme)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   └── integrations/   # Supabase client
├── supabase/
│   └── functions/      # Edge functions (email, sitemap)
└── dist/               # Production build output
```

---

## 🛠 Technologies Used

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Shadcn UI
- **Backend:** Lovable Cloud (Supabase)
- **Authentication:** Supabase Auth
- **Database:** PostgreSQL
- **Email:** Resend API
- **Analytics:** Google Analytics, Facebook Pixel

---

## 📞 Support

For technical issues:
- Check the [Troubleshooting](#-troubleshooting) section
- Review [Lovable Documentation](https://docs.lovable.dev/)

For business inquiries:
- Email: info@haus.online
