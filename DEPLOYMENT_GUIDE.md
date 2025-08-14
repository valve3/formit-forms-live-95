# Deployment Guide for GoDaddy PHP Hosting

## Prerequisites
- GoDaddy hosting account with PHP and MySQL support
- Access to your hosting control panel
- MySQL database credentials

## Step 1: Database Setup

1. **Create MySQL Database in GoDaddy:**
   - Log into your GoDaddy hosting control panel
   - Navigate to "Databases" > "MySQL"
   - Create a new database named `formit_db`
   - Create a database user and assign it to the database
   - Note down: database name, username, password, and host

2. **Import Database Schema:**
   - Open phpMyAdmin or MySQL interface in GoDaddy
   - Import the `database/schema.sql` file
   - This will create all necessary tables and indexes

## Step 2: PHP Backend Configuration

1. **Update Database Configuration:**
   - Edit `api/config/database.php`
   - Replace placeholder values with your actual GoDaddy MySQL credentials:
     ```php
     private $host = 'your_godaddy_mysql_host';
     private $db_name = 'your_database_name';
     private $username = 'your_mysql_username';
     private $password = 'your_mysql_password';
     ```

2. **Upload API Files:**
   - Upload the entire `api/` folder to your GoDaddy hosting root directory
   - Ensure proper file permissions (typically 644 for files, 755 for directories)

## Step 3: Frontend Configuration

1. **Update API Base URL:**
   - Edit `src/utils/api.ts`
   - Change `API_BASE_URL` to your actual domain:
     ```typescript
     const API_BASE_URL = 'https://yourdomain.com/api';
     ```

2. **Build React App:**
   ```bash
   npm run build
   ```

3. **Upload Frontend:**
   - Upload contents of `dist/` folder to your GoDaddy public_html directory
   - Do NOT upload the `api/` folder inside dist

## Step 4: Final Directory Structure on GoDaddy

```
public_html/
├── api/
│   ├── config/
│   ├── auth/
│   ├── forms/
│   ├── submissions/
│   └── themes/
├── index.html
├── assets/
└── ... (other React build files)
```

## Step 5: Data Migration from Supabase

### Export from Supabase:
1. Go to your Supabase dashboard
2. Navigate to each table (profiles, forms, themes, etc.)
3. Export data as CSV or JSON

### Import to MySQL:
1. Convert exported data to MySQL INSERT statements
2. Run the following SQL to migrate data:

```sql
-- Migrate profiles (users)
INSERT INTO profiles (id, email, full_name, password_hash, role, created_at) 
VALUES ('user_id', 'email', 'name', 'temp_hash', 'user', 'timestamp');

-- Note: You'll need to reset passwords as Supabase uses different hashing
-- Users will need to reset their passwords after migration
```

## Step 6: Testing

1. **Create Admin User:**
   - Visit `/api/admin/create-admin.php` to create the initial admin account
   - Default admin credentials: `admin@formit.com` / `admin123`
   - **IMPORTANT**: Change the password after first login

2. **Test Authentication:**
   - Try creating a new account
   - Test login functionality
   - Test admin login to access user management

3. **Test Forms:**
   - Create, edit, and delete forms
   - Submit test form data

3. **Test Admin Features:**
   - Access admin panel (if applicable)
   - Test user management

## Step 7: Production Considerations

1. **Security:**
   - Enable HTTPS on your domain
   - Review database permissions
   - Consider adding rate limiting

2. **Performance:**
   - Enable gzip compression
   - Set up caching headers
   - Optimize database indexes

3. **Monitoring:**
   - Set up error logging
   - Monitor database performance
   - Regular backups

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Ensure `cors.php` is included in all API endpoints
   - Check that your domain is allowed

2. **Database Connection Issues:**
   - Verify MySQL credentials
   - Check if your GoDaddy plan supports the required MySQL version

3. **File Upload Issues:**
   - Check PHP file upload limits
   - Verify directory permissions

4. **API Not Working:**
   - Check PHP error logs in GoDaddy control panel
   - Ensure all required PHP extensions are enabled

### Support:
- Check GoDaddy hosting documentation
- Review PHP error logs for specific issues
- Test API endpoints individually using tools like Postman

## Next Steps:
- Set up regular database backups
- Consider implementing email functionality
- Add monitoring and analytics
- Implement additional security measures