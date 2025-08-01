# 🔧 Supabase Migration Troubleshooting

## Error: column "country" already exists

This means your migration is partially complete. Let's check what's already done and fix the remaining issues.

## Step 1: Check Current Database State

Run these queries in Supabase SQL Editor to see what's already in place:

### Check Existing Enums
```sql
-- Check if country enum exists
SELECT typname FROM pg_type WHERE typname = 'country';

-- Check current location enum values
SELECT unnest(enum_range(NULL::location)) as current_locations;
```

### Check Table Columns
```sql
-- Check products table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name IN ('country', 'location');

-- Check locations table structure  
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'locations' AND column_name IN ('country', 'currency', 'timezone');
```

## Step 2: Fix Based on Results

### If Country Enum Doesn't Exist:
```sql
CREATE TYPE "public"."country" AS ENUM('Thailand', 'Korea');
```

### If Location Enum Needs Korean Cities:
```sql
-- Add Korean cities to existing location enum
ALTER TYPE location ADD VALUE 'Seoul';
ALTER TYPE location ADD VALUE 'Busan'; 
ALTER TYPE location ADD VALUE 'Incheon';
ALTER TYPE location ADD VALUE 'Daegu';
ALTER TYPE location ADD VALUE 'Daejeon';
ALTER TYPE location ADD VALUE 'Gwangju';
ALTER TYPE location ADD VALUE 'Ulsan';
ALTER TYPE location ADD VALUE 'Other Korean Cities';

-- Update 'Other Cities' to 'Other Thai Cities' for consistency
ALTER TYPE location RENAME VALUE 'Other Cities' TO 'Other Thai Cities';
```

### If Products Table Missing Country Column (Skip if exists):
```sql
-- Only run if the country column doesn't exist
-- ALTER TABLE "products" ADD COLUMN "country" "country" DEFAULT 'Thailand' NOT NULL;
```

### If Locations Table Missing New Columns:
Check which columns are missing and add only those:

```sql
-- Add missing columns (skip if they already exist)
-- Check first, then run only the missing ones:

-- If country column missing:
ALTER TABLE "locations" ADD COLUMN "country" "country" NOT NULL DEFAULT 'Thailand';

-- If currency column missing:
ALTER TABLE "locations" ADD COLUMN "currency" text NOT NULL DEFAULT 'THB';

-- If timezone column missing:  
ALTER TABLE "locations" ADD COLUMN "timezone" text NOT NULL DEFAULT 'Asia/Bangkok';
```

## Step 3: Always Run These (Safe to Re-run)

### Populate Location Data
```sql
-- Insert/update location data (using ON CONFLICT to handle duplicates)
INSERT INTO locations (name, country, display_name, currency, timezone) VALUES
-- Thailand
('Bangkok', 'Thailand', 'Bangkok', 'THB', 'Asia/Bangkok'),
('ChiangMai', 'Thailand', 'Chiang Mai', 'THB', 'Asia/Bangkok'),
('Phuket', 'Thailand', 'Phuket', 'THB', 'Asia/Bangkok'),
('HuaHin', 'Thailand', 'Hua Hin', 'THB', 'Asia/Bangkok'),
('Pattaya', 'Thailand', 'Pattaya', 'THB', 'Asia/Bangkok'),
('Krabi', 'Thailand', 'Krabi', 'THB', 'Asia/Bangkok'),
('Koh Samui', 'Thailand', 'Koh Samui', 'THB', 'Asia/Bangkok'),
('Other Thai Cities', 'Thailand', 'Other Thai Cities', 'THB', 'Asia/Bangkok'),

-- Korea
('Seoul', 'Korea', 'Seoul', 'KRW', 'Asia/Seoul'),
('Busan', 'Korea', 'Busan', 'KRW', 'Asia/Seoul'),
('Incheon', 'Korea', 'Incheon', 'KRW', 'Asia/Seoul'),
('Daegu', 'Korea', 'Daegu', 'KRW', 'Asia/Seoul'),
('Daejeon', 'Korea', 'Daejeon', 'KRW', 'Asia/Seoul'),
('Gwangju', 'Korea', 'Gwangju', 'KRW', 'Asia/Seoul'),
('Ulsan', 'Korea', 'Ulsan', 'KRW', 'Asia/Seoul'),
('Other Korean Cities', 'Korea', 'Other Korean Cities', 'KRW', 'Asia/Seoul')

ON CONFLICT (name) DO UPDATE SET
  country = EXCLUDED.country,
  display_name = EXCLUDED.display_name,
  currency = EXCLUDED.currency,
  timezone = EXCLUDED.timezone;
```

### Update Existing Products  
```sql
-- Set country for existing products (safe to re-run)
UPDATE products SET country = 'Thailand' 
WHERE location IN ('Bangkok', 'ChiangMai', 'Phuket', 'HuaHin', 'Pattaya', 'Krabi', 'Koh Samui', 'Other Cities', 'Other Thai Cities');

-- Update old 'Other Cities' to new 'Other Thai Cities' 
UPDATE products SET location = 'Other Thai Cities' 
WHERE location = 'Other Cities';
```

## Step 4: Verify Everything Works

```sql
-- Check enum values
SELECT unnest(enum_range(NULL::country)) as countries;
SELECT unnest(enum_range(NULL::location)) as locations;

-- Check data
SELECT country, location, COUNT(*) 
FROM products 
GROUP BY country, location 
ORDER BY country, location;

SELECT * FROM locations ORDER BY country, name;
```

## Step 5: Update Your Local Types

After successful database updates:

```bash
# Generate updated TypeScript types
npm run db:typegen

# Verify compilation
npm run typecheck
```

## Alternative: Reset and Start Fresh

If you're getting too many conflicts, you can reset:

```sql
-- CAREFUL: This will delete existing data
-- Only do this if you're okay losing current products/locations

DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TYPE IF EXISTS location CASCADE;
DROP TYPE IF EXISTS country CASCADE;

-- Then run the full migration from SUPABASE_MIGRATION_GUIDE.md
```

## Common Issues

### "enum value already exists"
Skip the `ALTER TYPE location ADD VALUE` commands for values that already exist.

### "relation does not exist" 
The table might not exist yet. Create it first before adding columns.

### "column has no default value"
Add a default value when adding NOT NULL columns to existing tables.

Let me know what you see from the diagnostic queries and I'll help you with the exact next steps!