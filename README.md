# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- ✅ Zod data validation
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Supabase Storage Setup

### Avatar Upload Feature

The profile page includes avatar upload functionality that stores images in Supabase Storage. To enable this feature:

1. **Create Storage Bucket**
   
   In your Supabase dashboard, go to Storage and create a new bucket named `avatars`:
   
   ```bash
   # Using Supabase CLI
   supabase storage create avatars
   ```

2. **Configure Bucket Policies**
   
   Set up the following RLS policies for the `avatars` bucket:
   
   ```sql
   -- Allow authenticated users to upload their own avatars
   CREATE POLICY "Users can upload their own avatars" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'avatars' AND 
     auth.uid()::text = (storage.foldername(name))[1]
   );
   
   -- Allow public read access to avatars
   CREATE POLICY "Public read access to avatars" ON storage.objects
   FOR SELECT USING (bucket_id = 'avatars');
   
   -- Allow users to update their own avatars
   CREATE POLICY "Users can update their own avatars" ON storage.objects
   FOR UPDATE USING (
     bucket_id = 'avatars' AND 
     auth.uid()::text = (storage.foldername(name))[1]
   );
   
   -- Allow users to delete their own avatars
   CREATE POLICY "Users can delete their own avatars" ON storage.objects
   FOR DELETE USING (
     bucket_id = 'avatars' AND 
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

3. **Environment Variables**
   
   Make sure your environment variables are set up correctly:
   
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### File Upload Limits

- **Maximum file size**: 5MB
- **Allowed formats**: JPEG, PNG, WebP
- **Storage path**: `avatars/{user_id}/{timestamp}`

## Today's Picks Selection Algorithm

The "Today's Picks" feature on the home page uses a sophisticated scoring algorithm to select the best 4 products to showcase. Here's how it works:

### Scoring Criteria

1. **Recency Score (0-30 points)**

   - Recently posted (≤7 days): +30 points
   - Posted within 2 weeks: +20 points
   - Posted within a month: +10 points

2. **Quality Score (5-25 points)**

   - New condition: +25 points
   - Like new condition: +20 points
   - Good condition: +15 points
   - Fair condition: +10 points
   - Poor condition: +5 points

3. **Popularity Score (10-30 points)**

   - Reasonable price (1000-3000 THB): +20 points
   - Great value (<1000 THB): +15 points
   - Fair price (≤5000 THB): +10 points
   - Popular categories (Electronics, Clothing, Home goods): +10 points

4. **Location Score (0-15 points)**

   - Local items (matching user location): +15 points

5. **Diversity Factor (0-10 points)**
   - Random factor to ensure variety

### Selection Process

1. **Score Calculation**: Each product gets a total score based on the above criteria
2. **Category Diversity**: First pass selects the highest-scoring product from each category
3. **Score-based Selection**: Second pass fills remaining slots with highest-scoring products
4. **Final Selection**: Returns up to 4 diverse, high-quality products

### Usage

```typescript
// Mock function (임시)
async function fetchTodaysPicks(criteria: any = {}) {
  // 실제로는 데이터베이스에서 상품들을 가져옴
  return Array.from({ length: 4 }, (_, index) => ({
    id: `product-${index + 1}`,
    title: `Sample Product ${index + 1}`,
    price: Math.floor(Math.random() * 5000) + 100,
    currency: "THB",
    priceType: Math.random() > 0.85 ? "free" : "fixed",
    image: "/sample.png",
    sellerId: `seller-${index + 1}`,
    isSold: Math.random() > 0.8,
    createdAt: new Date(),
  }));
}

const todaysPicks = await fetchTodaysPicks({
  location: "ChiangMai",
  limit: 4,
  includePopular: true,
  includeRecent: true,
  includeQuality: true,
});
```

## Database Schema Changes

### Local Reviews - Data Normalization

The local reviews feature has been updated to prevent data duplication by normalizing the database schema:

#### Before (Denormalized)

- `local_business_reviews` table contained duplicate business information:
  - `business_name`, `business_type`, `location`, `price_range`
- This led to data inconsistency and maintenance issues

#### After (Normalized)

- `local_business_reviews` table now only contains:
  - `business_id` (foreign key to `local_businesses.id`)
  - Review-specific data: `rating`, `review`, `author`, `tags`, etc.
- Business information is retrieved via JOIN operations
- Automatic triggers update business statistics (average_rating, total_reviews)

#### Migration

Run the migration script to update existing data:

```sql
-- Located at: app/sql/migrations/001_remove_duplicate_business_data.sql
```

#### Benefits

- **Data Consistency**: Single source of truth for business information
- **Reduced Storage**: Eliminates redundant data storage
- **Easier Maintenance**: Business updates only need to be made in one place
- **Better Performance**: Proper indexing on foreign keys

## Data Validation with Zod

This project uses [Zod](https://zod.dev/) for runtime type validation. All form inputs, URL parameters, and API responses are validated using Zod schemas defined within each feature module.

### Validation Examples

#### URL Parameters

```typescript
// Define schema locally in the component
const paramsSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
});

// Validate parameters
const validationResult = paramsSchema.safeParse(params);
if (!validationResult.success) {
  return <ErrorComponent message={validationResult.error.errors[0]?.message} />;
}
const { id: productId } = validationResult.data;
```

#### Form Data

```typescript
// Define form schema locally
const productFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.string().min(1, "Price is required"),
  // ... other fields
});

// Validate form data
const validateForm = (formData: unknown) => {
  const result = productFormSchema.safeParse(formData);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((error) => {
      const field = error.path.join(".");
      errors[field] = error.message;
    });
    return { success: false, errors };
  }
  return { success: true, data: result.data };
};
```

#### Search Parameters

```typescript
// Define search schema locally
const searchParamsSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Validate search parameters
const [searchParams] = useSearchParams();
const searchValidation = searchParamsSchema.safeParse(
  Object.fromEntries(searchParams)
);
```

### Schema Organization

Each feature module contains its own validation schemas:

- **Auth Schemas**: `app/features/auth/constants.ts` - Login, registration, OTP schemas
- **Product Schemas**: Defined locally in each product page component
- **User Schemas**: `app/features/users/constants.ts` - User profile and settings schemas
- **Community Schemas**: `app/features/community/constants.ts` - Community post schemas

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

# Lemore - Secondhand Marketplace

A modern secondhand marketplace application built with React, TypeScript, and Drizzle ORM.

## Features

### Appreciation Badge System

The application includes an appreciation badge system that recognizes users who have received high ratings in the Give & Glow community:

- **Criteria**: Users receive an "Appreciation" badge when they have at least one review with a rating greater than 4 in the give-and-glow table
- **Display**: The badge appears in product cards and user profiles to highlight generous community members
- **Performance**: Uses caching to avoid repeated database queries
- **Real-time**: Badge status updates automatically when new reviews are submitted

#### How it works:

1. **Database Query**: The system queries the `give_and_glow_reviews` table for reviews where:

   - The user is the giver (`giver_id` matches the user)
   - The rating is greater than 4 (`rating > 4`)

2. **Caching**: Results are cached to improve performance and reduce database load

3. **Display**: The appreciation badge appears as a green badge with "Appreciation" text

4. **Cache Invalidation**: When new reviews are submitted, the cache is invalidated to ensure fresh data

#### Components using the appreciation badge:

- `ProductCard`: Shows appreciation badge in seller hover card
- `GiveAndGlowCard`: Shows appreciation badge for reviews with rating > 4
- Custom hook: `useAppreciationBadge` for reusable badge logic

## Getting Started

// ... existing content ...
