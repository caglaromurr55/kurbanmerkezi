-- V4 Migration Script
ALTER TABLE animals ADD COLUMN video_url text;
ALTER TABLE tenant_settings ADD COLUMN default_international_sale_price_tl numeric(10,2) DEFAULT 0;
