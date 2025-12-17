-- Database schema for Hause.ink
-- Run this SQL in your hause_inksun database via phpMyAdmin
-- Database: hause_inksun (already exists on server)

USE hause_inksun;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User roles table
CREATE TABLE user_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role ENUM('user', 'tenant', 'admin', 'superadmin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role)
);

-- Properties table with latitude/longitude for map
CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    location VARCHAR(255),
    city VARCHAR(100),
    bedrooms INT DEFAULT 1,
    bathrooms INT DEFAULT 1,
    area DECIMAL(8,2),
    property_type VARCHAR(50) DEFAULT 'apartment',
    available_from DATE,
    amenities JSON,
    images JSON,
    videos JSON,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    owner_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    user_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    total_price DECIMAL(10,2) DEFAULT 0,
    message TEXT,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Leads table
CREATE TABLE leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT NOT NULL,
    property_id INT,
    desired_location VARCHAR(255),
    desired_move_date DATE,
    price_range VARCHAR(100),
    bedroom_preference VARCHAR(50),
    people_count INT,
    property_type_preference VARCHAR(50),
    employment_status VARCHAR(100),
    has_pets BOOLEAN DEFAULT FALSE,
    has_criminal_history BOOLEAN DEFAULT FALSE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    source VARCHAR(50) DEFAULT 'website',
    status ENUM('new', 'contacted', 'converted', 'closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);

-- Media library table
CREATE TABLE media_library (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size INT,
    alt_text VARCHAR(255),
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Site settings table
CREATE TABLE site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Pages table for CMS
CREATE TABLE pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    featured_image VARCHAR(500),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_coords ON properties(latitude, longitude);
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_published ON pages(is_published);

-- Insert default admin user
-- Email: sunjida@hause.ink
-- Password: Sunji@#$% (hash generated with bcrypt cost 10)
INSERT INTO users (email, password_hash, full_name) VALUES
('sunjida@hause.ink', '$2y$10$N9qo8uLOickgx2ZMRZoMy.MqrqxLv6nZX.MZFy/XBYqxwzz9R7W6K', 'Super Admin');

-- Set admin role
INSERT INTO user_roles (user_id, role) VALUES (1, 'admin');
INSERT INTO user_roles (user_id, role) VALUES (1, 'superadmin');

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
('hero_section', '{"title": "Find Your Dream Stay in Amsterdam", "subtitle": "Discover unique properties in the heart of Amsterdam", "search_placeholder": "Search properties...", "background_image_url": "", "popular_areas": ["Centrum", "Jordaan", "De Pijp", "Oud-West"]}'),
('contact_info', '{"company_name": "Hause", "email": "info@hause.ink", "phone": "+31 20 123 4567", "address": "Wamelplein 68", "city": "1106 Amsterdam", "country": "Netherlands", "whatsapp_enabled": false, "whatsapp_number": "", "business_hours": "Mon-Fri: 9:00 - 18:00"}'),
('social_links', '{"facebook": "", "instagram": "", "linkedin": "", "twitter": "", "youtube": "", "tiktok": ""}'),
('branding', '{"lightModeLogo": "", "darkModeLogo": ""}'),
('seo', '{"site_title": "Hause - Find Your Dream Home", "site_description": "Discover verified rental properties in Amsterdam", "keywords": "Amsterdam, rentals, properties, housing"}');

-- Migration for existing databases: Add latitude/longitude columns
-- ALTER TABLE properties ADD COLUMN latitude DECIMAL(10, 8) NULL;
-- ALTER TABLE properties ADD COLUMN longitude DECIMAL(11, 8) NULL;
-- CREATE INDEX idx_properties_coords ON properties(latitude, longitude);
