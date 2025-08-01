# 🚀 Supabase Migration Guide: Phase 2 - Korean Locations

This guide will help you apply the Phase 2 changes (Korean location support) to your Supabase database.

## 📋 **Prerequisites**

- Supabase project set up and running
- Access to Supabase Dashboard SQL Editor
- Local development environment connected to Supabase

## 🔧 **Option 1: Using Drizzle Migration (Recommended)**

### Step 1: Apply the Migration
```bash
npm run db:migrate
```

If you get any enum errors, proceed to **Option 2: Manual Setup**.

## 🛠️ **Option 2: Manual Supabase Setup**

### Step 1: Create New Enums

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create country enum
CREATE TYPE "public"."country" AS ENUM('Thailand', 'Korea');

-- Update location enum to include Korean cities
DROP TYPE IF EXISTS "public"."location" CASCADE;
CREATE TYPE "public"."location" AS ENUM(
  'Bangkok', 'ChiangMai', 'Phuket', 'HuaHin', 'Pattaya', 'Krabi', 'Koh Samui', 'Other Thai Cities',
  'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan', 'Other Korean Cities'
);
```

### Step 2: Update Existing Tables

```sql
-- Add country field to products table
ALTER TABLE "products" 
ADD COLUMN "country" "country" DEFAULT 'Thailand' NOT NULL;

-- Update locations table to include country, currency, timezone
ALTER TABLE "locations" 
ADD COLUMN "country" "country" NOT NULL DEFAULT 'Thailand',
ADD COLUMN "currency" text NOT NULL DEFAULT 'THB',
ADD COLUMN "timezone" text NOT NULL DEFAULT 'Asia/Bangkok';
```

### Step 3: Populate Location Data

```sql
-- Insert Thailand locations
INSERT INTO locations (name, country, display_name, currency, timezone) VALUES
('Bangkok', 'Thailand', 'Bangkok', 'THB', 'Asia/Bangkok'),
('ChiangMai', 'Thailand', 'Chiang Mai', 'THB', 'Asia/Bangkok'),
('Phuket', 'Thailand', 'Phuket', 'THB', 'Asia/Bangkok'),
('HuaHin', 'Thailand', 'Hua Hin', 'THB', 'Asia/Bangkok'),
('Pattaya', 'Thailand', 'Pattaya', 'THB', 'Asia/Bangkok'),
('Krabi', 'Thailand', 'Krabi', 'THB', 'Asia/Bangkok'),
('Koh Samui', 'Thailand', 'Koh Samui', 'THB', 'Asia/Bangkok'),
('Other Thai Cities', 'Thailand', 'Other Thai Cities', 'THB', 'Asia/Bangkok'),

-- Insert Korea locations  
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
  currency = EXCLUDED.currency,
  timezone = EXCLUDED.timezone;
```

### Step 4: Update Existing Product Data

```sql
-- Set country field for existing products based on their location
UPDATE products SET country = 'Thailand' 
WHERE location IN ('Bangkok', 'ChiangMai', 'Phuket', 'HuaHin', 'Pattaya', 'Krabi', 'Koh Samui', 'Other Cities');

-- Update 'Other Cities' to 'Other Thai Cities' for consistency
UPDATE products SET location = 'Other Thai Cities' WHERE location = 'Other Cities';
```

## 🧪 **Step 5: Verify Setup**

### Test the Schema
```sql
-- Check enums
SELECT unnest(enum_range(NULL::country)) as countries;
SELECT unnest(enum_range(NULL::location)) as locations;

-- Check products table structure
\d products;

-- Check locations data
SELECT * FROM locations ORDER BY country, name;

-- Verify existing products have correct country assignment
SELECT country, location, COUNT(*) 
FROM products 
GROUP BY country, location 
ORDER BY country, location;
```

## 🔍 **Troubleshooting**

### Error: "type does not exist"
If you get enum type errors:

1. **Check existing types:**
   ```sql
   SELECT typname FROM pg_type WHERE typname IN ('location', 'country');
   ```

2. **Drop and recreate if needed:**
   ```sql
   DROP TYPE IF EXISTS "public"."location" CASCADE;
   DROP TYPE IF EXISTS "public"."country" CASCADE;
   -- Then run the CREATE TYPE commands again
   ```

### Error: "column already exists"
If you get column exists errors:
```sql
-- Check existing columns
\d products;
\d locations;

-- Skip ALTER TABLE commands for columns that already exist
```

### Error: "migration already applied"
If using Drizzle migration:
```bash
# Reset migrations if needed
rm -rf app/sql/migrations
npm run db:generate
npm run db:migrate
```

## ✅ **Verification Checklist**

After completing the migration:

- [ ] New `country` enum exists with Thailand, Korea
- [ ] Updated `location` enum includes Korean cities
- [ ] Products table has `country` column with Thailand default
- [ ] Locations table has country, currency, timezone columns
- [ ] All existing Thai products have country='Thailand'
- [ ] Location data is populated for both countries
- [ ] Your application starts without database errors

## 🎯 **Next Steps**

1. **Update Type Definitions:**
   ```bash
   npm run db:typegen
   ```

2. **Test the Application:**
   - Navigate through location dropdown
   - Create test products in different countries
   - Verify currency formatting works correctly

3. **Optional: Populate Sample Korean Data**
   You can now create products in Korean cities to test the full functionality.

## 📞 **Need Help?**

If you encounter issues:
1. Check Supabase logs in the Dashboard
2. Verify your database connection
3. Ensure all SQL statements completed successfully
4. Check that your local `.env` has the correct Supabase credentials