-- ============================================================
-- FreshBasket Grocery App - Seed Data
-- Run AFTER schema.sql has been executed.
-- Usage:
--   mysql -u root -p grocery_app < backend/database/seed.sql
-- ============================================================

USE grocery_app;

-- ============================================================
-- USERS
-- Passwords are plain-text placeholders for development only.
-- Real bcrypt hashing will be added in the Authentication step.
-- ============================================================
INSERT INTO users (name, email, phone, password, role, status) VALUES
  ('Store Administrator',  'admin@freshbasket.com',    '+1-555-0100', 'admin123',    'admin',            'active'),
  ('Raj Kumar',            'raj@freshbasket.com',      '+1-555-0201', 'driver123',   'delivery_partner', 'active'),
  ('Priya Singh',          'priya@freshbasket.com',    '+1-555-0202', 'driver123',   'delivery_partner', 'active'),
  ('Alice Johnson',        'alice@example.com',         '+1-555-0301', 'customer123', 'customer',         'active'),
  ('Bob Williams',         'bob@example.com',           '+1-555-0302', 'customer123', 'customer',         'active');

-- ============================================================
-- DELIVERY PARTNERS (linked to users with role=delivery_partner)
-- ============================================================
INSERT INTO delivery_partners (user_id, vehicle_type, vehicle_number, is_online) VALUES
  (2, 'motorcycle', 'MH-01-AB-1234', 1),
  (3, 'bicycle',    NULL,            0);

-- ============================================================
-- ADDRESSES  (for both customer users)
-- ============================================================
INSERT INTO addresses (user_id, full_name, phone, address_line, landmark, city, state, pincode, latitude, longitude, is_default) VALUES
  -- Alice (user_id=4)
  (4, 'Alice Johnson', '+1-555-0301', '123 Green Valley St, Apt 4B', 'Near Central Park', 'New York',   'NY', '10001', 40.71280000, -74.00600000, 1),
  (4, 'Alice Johnson', '+1-555-0301', '45 Riverside Drive, Office 2', 'FreshCo Building',  'New York',   'NY', '10024', 40.79290000, -73.98220000, 0),
  -- Bob (user_id=5)
  (5, 'Bob Williams',  '+1-555-0302', '78 Oak Avenue, House 7',       'Next to Walmart',   'Los Angeles','CA', '90001', 34.05220000,-118.24370000, 1);

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (name, description, image, status) VALUES
  ('Fruits & Vegetables', 'Fresh farm-to-table produce, seasonal fruits and crisp vegetables.',      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80', 'active'),
  ('Dairy & Eggs',        'Pasteurized milk, artisan cheeses, farm-fresh eggs and butter.',          'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80', 'active'),
  ('Rice & Grains',       'Premium basmati, whole wheat, oats and assorted pulses.',                 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', 'active'),
  ('Snacks',              'Crispy chips, biscuits, cookies, nuts and healthy munchies.',             'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80', 'active'),
  ('Beverages',           'Fresh juices, carbonated drinks, teas, coffees and health drinks.',       'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80', 'active'),
  ('Personal Care',       'Body wash, shampoo, skincare, oral care and grooming essentials.',        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80', 'active'),
  ('Household',           'Cleaning supplies, detergents, tissue papers and home essentials.',       'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&q=80', 'active');

-- ============================================================
-- PRODUCTS (12 items distributed across 7 categories)
-- category_id follows the insertion order above (1-7)
-- ============================================================
INSERT INTO products (category_id, name, description, image, price, original_price, unit, stock_quantity, status) VALUES
  -- Fruits & Vegetables (1)
  (1, 'Fresh Organic Bananas',
      'Farm-fresh, naturally ripened organic yellow bananas packed with potassium and essential nutrients.',
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80',
      2.49, 2.99, '1 dozen', 150, 'active'),

  (1, 'Crisp Honeycrisp Apples',
      'Sweet, juicy and extra crunchy red apples grown in local orchards. Perfect for snacking.',
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80',
      3.29, 3.79, '1 kg', 200, 'active'),

  -- Dairy & Eggs (2)
  (2, 'Farm Fresh Whole Milk',
      'Pure pasteurized whole milk from grass-fed cows. Rich in calcium and Vitamin D.',
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80',
      3.99, 4.49, '1 Gallon', 80, 'active'),

  (2, 'Organic Brown Eggs',
      'Cage-free, pasture-raised organic brown eggs. High in omega-3 fatty acids.',
      'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=600&q=80',
      4.79, 5.29, '12 pcs (Grade A)', 120, 'active'),

  -- Rice & Grains (3)
  (3, 'Premium Basmati Rice',
      'Aromatic long-grain aged Basmati rice. Perfect for biryanis, pilafs and everyday meals.',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
      14.99, 16.99, '5 kg', 60, 'active'),

  (3, 'Organic Whole Wheat Flour',
      'Stone-ground 100% whole wheat flour. Perfect for rotis, breads and healthy baking.',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
      6.49, 7.29, '2 kg', 90, 'active'),

  -- Snacks (4)
  (4, 'Crunchy Salted Potato Chips',
      'Crispy fried potato slices seasoned with sea salt. The ultimate snack for movie nights.',
      'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&q=80',
      1.99, 2.29, '150g pack', 300, 'active'),

  -- Beverages (5)
  (5, 'Cold Pressed Orange Juice',
      '100% pure squeezed orange juice with pulp. No added sugar or preservatives.',
      'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&q=80',
      4.49, 4.99, '1 Liter', 100, 'active'),

  (5, 'Sparkling Lemon Lime Soda',
      'Refreshing carbonated beverage with real lemon and lime extracts.',
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80',
      2.99, 3.49, '6 cans (330ml)', 180, 'active'),

  -- Personal Care (6)
  (6, 'Nourishing Herbal Body Wash',
      'Gentle skin cleanser enriched with aloe vera and botanical oils for hydrated skin.',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
      5.99, 6.99, '500ml', 75, 'active'),

  -- Household (7)
  (7, 'Citrus Multi-Surface Cleaner',
      'Powerful eco-friendly spray that kills 99.9% bacteria with a refreshing lemon scent.',
      'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=600&q=80',
      3.49, 3.99, '750ml spray', 0, 'out_of_stock'),

  (7, 'Soft Facial Tissue Box',
      '2-ply ultra soft facial tissues for sensitive skin. Dermatologist tested.',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
      2.19, 2.49, '200 sheets', 250, 'active');

-- ============================================================
-- SAMPLE NOTIFICATIONS (for customers)
-- ============================================================
INSERT INTO notifications (user_id, order_id, title, message, type, is_read) VALUES
  (4, NULL, 'Welcome to FreshBasket!', 'Thank you for joining. Enjoy fresh groceries delivered in 20 minutes.', 'system', 0),
  (5, NULL, 'Welcome to FreshBasket!', 'Thank you for joining. Enjoy fresh groceries delivered in 20 minutes.', 'system', 0),
  (4, NULL, 'Special Offer Today!',    'Get 20% off on all Fruits & Vegetables. Use code FRESH20.',          'promotion', 0);
