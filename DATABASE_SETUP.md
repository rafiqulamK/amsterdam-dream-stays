# Amsterdam Dream Stays - Database Setup

This project now uses MySQL database instead of Supabase. Follow these steps to set up the database:

## 1. Database Setup

### Option A: Using cPanel phpMyAdmin

1. Login to your cPanel
2. Go to phpMyAdmin
3. Create a new database (e.g., `amsterdam_dream_stays`)
4. Create a database user with full privileges
5. Import the `database/schema.sql` file

### Option B: Using MySQL Command Line

```bash
mysql -u username -p
CREATE DATABASE amsterdam_dream_stays;
USE amsterdam_dream_stays;
SOURCE database/schema.sql;
```

## 2. Environment Configuration

Create a `.env` file in the root directory with your database credentials:

```env
DB_HOST=localhost
DB_NAME=amsterdam_dream_stays
DB_USER=your_db_user
DB_PASS=your_db_password
```

## 3. File Permissions

Make sure the following directories are writable by the web server:

```bash
chmod 755 api/
chmod 755 uploads/
chmod 755 uploads/images/
chmod 755 uploads/videos/
```

## 4. Default Admin Account

The database schema creates a default admin account:
- Email: admin@amsterdamdreamstays.com
- Password: admin123

**Important:** Change this password after first login!

## 5. Upload Files

After setting up the database, upload all files to your cPanel public_html directory. The structure should be:

```
public_html/
├── api/
│   ├── auth.php
│   ├── bookings.php
│   ├── config.php
│   ├── leads.php
│   ├── properties.php
│   ├── settings.php
│   └── upload.php
├── database/
│   └── schema.sql
├── uploads/
│   ├── images/
│   └── videos/
├── assets/
├── index.html
├── .htaccess
└── ... (other built files)
```

## 6. Test the Installation

1. Visit your website
2. Try logging in with the admin account
3. Check if properties load (may show static fallback initially)
4. Test creating a lead/contact form

## Troubleshooting

### Database Connection Issues
- Verify DB_HOST, DB_NAME, DB_USER, DB_PASS in config.php
- Check if the database user has proper permissions
- Ensure MySQL server is running

### File Upload Issues
- Check permissions on uploads/ directory
- Verify PHP file upload settings in php.ini

### API Errors
- Check PHP error logs
- Verify all API files are uploaded
- Ensure .htaccess allows PHP execution

## Security Notes

- Change the default admin password immediately
- Use strong passwords for database users
- Keep PHP and MySQL updated
- Regularly backup your database
- Consider using SSL/HTTPS