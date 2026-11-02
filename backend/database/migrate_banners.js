const { pool } = require('../config/db');

async function migrateBanners() {
  try {
    console.log('🔄 Running banners table migration...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS banners (
        id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
        title           VARCHAR(150)      NOT NULL,
        description     TEXT              NULL,
        image_url       VARCHAR(500)      NOT NULL,
        cloudinary_id   VARCHAR(150)      NULL COMMENT 'Cloudinary public ID for asset cleanup',
        button_text     VARCHAR(50)       NULL DEFAULT 'Shop Now',
        link_url        VARCHAR(255)      NULL DEFAULT '/products',
        display_order   INT UNSIGNED      NOT NULL DEFAULT 1,
        status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
        created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_banners_status_order (status, display_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(createTableQuery);
    console.log('✅ banners table created or verified.');

    // Check existing count
    const [existing] = await pool.query('SELECT COUNT(*) as count FROM banners');
    if (existing[0].count === 0) {
      console.log('🌱 Seeding 5 initial promotional banners...');
      const seedBanners = [
        [
          'Farm Fresh Organics',
          'Crisp vegetables and sweet fruits picked daily with freshness guaranteed.',
          'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=1400&q=80',
          null,
          'Shop Fresh',
          '/products?category=Fruits%20%26%20Vegetables',
          1,
          'active'
        ],
        [
          'Dairy & Morning Essentials',
          'Pure milk, farm eggs, and artisanal butter delivered right to your doorstep.',
          'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1400&q=80',
          null,
          'Explore Dairy',
          '/products?category=Dairy%20%26%20Eggs',
          2,
          'active'
        ],
        [
          'Snack Attack! Up to 30% Off',
          'Crunchy chips, premium nuts, and guilt-free munchies for every craving.',
          'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=1400&q=80',
          null,
          'Grab Snacks',
          '/products?category=Snacks',
          3,
          'active'
        ],
        [
          'Chilled Sips & Refreshing Juices',
          '100% natural fruit juices, fizzy sodas, and cooling hydration.',
          'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=1400&q=80',
          null,
          'View Drinks',
          '/products?category=Beverages',
          4,
          'active'
        ],
        [
          'Weekly Mega Super Savers',
          'Stock up your kitchen pantry with incredible deals on daily staples.',
          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=80',
          null,
          'View All Deals',
          '/products',
          5,
          'active'
        ]
      ];

      for (const b of seedBanners) {
        await pool.query(
          `INSERT INTO banners (title, description, image_url, cloudinary_id, button_text, link_url, display_order, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          b
        );
      }
      console.log('✅ 5 promotional banners seeded successfully.');
    } else {
      console.log(`ℹ️ banners table already has ${existing[0].count} records. Skipping seed.`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

migrateBanners();
