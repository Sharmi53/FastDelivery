-- ============================================================
-- FreshBasket Grocery App - Database Schema
-- Run this file FIRST to create all tables.
-- Usage:
--   mysql -u root -p < backend/database/schema.sql
-- OR paste into MySQL Workbench / phpMyAdmin.
-- ============================================================

-- Create and select database
CREATE DATABASE IF NOT EXISTS grocery_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE grocery_app;

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)      NOT NULL,
  email         VARCHAR(150)      NOT NULL,
  phone         VARCHAR(20)       NULL,
  password      VARCHAR(255)      NOT NULL COMMENT 'Hashed password - plain text only for dev seed',
  role          ENUM('customer','admin','delivery_partner') NOT NULL DEFAULT 'customer',
  status        ENUM('active','inactive','suspended')      NOT NULL DEFAULT 'active',
  created_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- 2. addresses
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED      NOT NULL,
  full_name     VARCHAR(100)      NOT NULL,
  phone         VARCHAR(20)       NOT NULL,
  address_line  VARCHAR(255)      NOT NULL,
  landmark      VARCHAR(150)      NULL,
  city          VARCHAR(100)      NOT NULL,
  state         VARCHAR(100)      NOT NULL,
  pincode       VARCHAR(20)       NOT NULL,
  latitude      DECIMAL(10,8)     NULL,
  longitude     DECIMAL(11,8)     NULL,
  is_default    TINYINT(1)        NOT NULL DEFAULT 0,
  created_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_addresses_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 3. categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)      NOT NULL,
  description   TEXT              NULL,
  image         VARCHAR(500)      NULL,
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB;

-- ============================================================
-- 4. products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  category_id     INT UNSIGNED      NOT NULL,
  name            VARCHAR(200)      NOT NULL,
  description     TEXT              NULL,
  image           VARCHAR(500)      NULL,
  price           DECIMAL(10,2)     NOT NULL,
  original_price  DECIMAL(10,2)     NULL COMMENT 'MRP / original price before discount',
  unit            VARCHAR(50)       NOT NULL COMMENT 'e.g. 1 kg, 500ml, 1 dozen',
  stock_quantity  INT UNSIGNED      NOT NULL DEFAULT 0,
  status          ENUM('active','inactive','out_of_stock') NOT NULL DEFAULT 'active',
  created_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. carts
-- ============================================================
CREATE TABLE IF NOT EXISTS carts (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED  NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_carts_user (user_id),
  CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. cart_items
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  cart_id     INT UNSIGNED  NOT NULL,
  product_id  INT UNSIGNED  NOT NULL,
  quantity    INT UNSIGNED  NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_product (cart_id, product_id),
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id) REFERENCES carts(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 7. orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED    NOT NULL,
  address_id      INT UNSIGNED    NULL COMMENT 'NULL if address was deleted after order placed',
  order_number    VARCHAR(30)     NOT NULL,
  subtotal        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  delivery_charge DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  discount        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  total_amount    DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  payment_method  ENUM('cod','online','qr') NOT NULL DEFAULT 'cod',
  payment_status  ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  order_status    ENUM(
    'placed','confirmed','preparing','ready_for_pickup',
    'assigned','picked_up','out_for_delivery','delivered','cancelled'
  ) NOT NULL DEFAULT 'placed',
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_number (order_number),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_orders_address
    FOREIGN KEY (address_id) REFERENCES addresses(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 8. order_items
-- Stores a snapshot of product name & price at time of order
-- so history is preserved even if the product is later changed.
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  order_id      INT UNSIGNED    NOT NULL,
  product_id    INT UNSIGNED    NULL COMMENT 'NULL if product is later deleted',
  product_name  VARCHAR(200)    NOT NULL COMMENT 'Snapshot at time of order',
  price         DECIMAL(10,2)   NOT NULL COMMENT 'Snapshot at time of order',
  quantity      INT UNSIGNED    NOT NULL DEFAULT 1,
  subtotal      DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 9. payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  order_id        INT UNSIGNED    NOT NULL,
  payment_method  ENUM('cod','online','qr') NOT NULL,
  transaction_id  VARCHAR(150)    NULL COMMENT 'Gateway transaction ID (future use)',
  amount          DECIMAL(10,2)   NOT NULL,
  payment_status  ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  paid_at         DATETIME        NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 10. delivery_partners
-- ============================================================
CREATE TABLE IF NOT EXISTS delivery_partners (
  id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id             INT UNSIGNED    NOT NULL,
  vehicle_type        ENUM('bicycle','motorcycle','car','other') NOT NULL DEFAULT 'motorcycle',
  vehicle_number      VARCHAR(30)     NULL,
  is_online           TINYINT(1)      NOT NULL DEFAULT 0,
  current_latitude    DECIMAL(10,8)   NULL,
  current_longitude   DECIMAL(11,8)   NULL,
  created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_delivery_partner_user (user_id),
  CONSTRAINT fk_delivery_partners_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 11. delivery_assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS delivery_assignments (
  id                    INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  order_id              INT UNSIGNED    NOT NULL,
  delivery_partner_id   INT UNSIGNED    NOT NULL,
  assigned_at           DATETIME        NULL,
  accepted_at           DATETIME        NULL,
  picked_up_at          DATETIME        NULL,
  delivered_at          DATETIME        NULL,
  status                ENUM(
    'assigned','accepted','picked_up','delivered','failed'
  ) NOT NULL DEFAULT 'assigned',
  created_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_da_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_da_partner
    FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 12. notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED    NOT NULL,
  order_id    INT UNSIGNED    NULL,
  title       VARCHAR(200)    NOT NULL,
  message     TEXT            NOT NULL,
  type        ENUM('order_update','promotion','system','delivery_update') NOT NULL DEFAULT 'system',
  is_read     TINYINT(1)      NOT NULL DEFAULT 0,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_notifications_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
