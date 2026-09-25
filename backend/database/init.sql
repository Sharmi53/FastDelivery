-- ============================================================
-- FreshBasket Grocery App - Quick DB Setup Helper
-- Run this complete file to create database + tables + seed data
-- in ONE single command.
--
-- Usage (from project root):
--   mysql -u root -p < backend/database/init.sql
--
-- Or run schema + seed separately:
--   mysql -u root -p < backend/database/schema.sql
--   mysql -u root -p grocery_app < backend/database/seed.sql
-- ============================================================

SOURCE backend/database/schema.sql;
SOURCE backend/database/seed.sql;
