# cPanel Deployment Guide

This project is ready to be deployed to any cPanel hosting with PHP and MySQL support.

## Quick Start

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload to cPanel:**
   - Upload the entire `dist/` folder contents to your `public_html/` directory
   - Make sure to include the `api/` and `database/` folders

3. **Configure Database:**
   - Create a MySQL database in cPanel
   - Import `database/schema.sql` via phpMyAdmin
   - Update `api/config.php` with your database credentials

## File Structure After Deployment

```
public_html/
├── index.html          # Main React app
├── assets/             # JS, CSS, images
├── api/                # PHP backend
│   ├── config.php      # Database configuration (UPDATE THIS!)
│   ├── auth.php        # Authentication endpoints
│   ├── properties.php  # Property CRUD
│   ├── leads.php       # Lead management
│   ├── bookings.php    # Booking management
│   ├── settings.php    # Site settings
│   └── upload.php      # File uploads
├── database/
│   └── schema.sql      # Database schema
├── uploads/            # User uploads (create with 755 permissions)
├── .htaccess           # Apache rewrite rules
└── robots.txt          # SEO
```

## Database Configuration

Edit `api/config.php` and update these values:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_cpanel_user_dbuser');
define('DB_PASS', 'your_database_password');
define('SITE_URL', 'https://yourdomain.com');
```

## User Roles and Permissions

The system supports four user roles:

| Role | Permissions |
|------|-------------|
| `user` | View properties, submit leads, make bookings |
| `tenant` | All user permissions + manage own properties |
| `admin` | All tenant permissions + manage all content |
| `superadmin` | Full access including user management |

### Default Admin Account
- **Email:** sunjida@hause.ink
- **Password:** (set during database import or change in phpMyAdmin)

## Map View (Optional)

To enable the map view:

1. Get a free Mapbox public token from https://mapbox.com
2. Login as admin and go to Settings
3. Add the `mapbox_token` setting with your token value

## Post-Deployment Checklist

- [ ] Database credentials configured in `api/config.php`
- [ ] Database schema imported
- [ ] `uploads/` folder created with proper permissions (755)
- [ ] Admin password changed
- [ ] SSL certificate installed (recommended)
- [ ] SITE_URL updated in `api/config.php`

## Troubleshooting

### Blank page or 500 error
- Check PHP error logs in cPanel
- Verify database credentials
- Ensure `.htaccess` is uploaded (enable "Show Hidden Files" in File Manager)

### API returns 404
- Ensure `api/` folder is in the same directory as `index.html`
- Check `.htaccess` rules are working

### Images not uploading
- Create `uploads/` folder manually
- Set permissions to 755
- Check PHP upload limits in php.ini

### React routes show 404
- Verify `.htaccess` is present and mod_rewrite is enabled
- Contact host to enable mod_rewrite if needed
