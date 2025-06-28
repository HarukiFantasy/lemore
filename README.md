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
import { fetchTodaysPicks } from "~/features/products/queries";

const todaysPicks = await fetchTodaysPicks({
  location: "ChiangMai",
  limit: 4,
  includePopular: true,
  includeRecent: true,
  includeQuality: true,
});
```

## Data Validation with Zod

This project uses [Zod](https://zod.dev/) for runtime type validation. All form inputs, URL parameters, and API responses are validated using Zod schemas.

### Available Schemas

#### URL Parameters

```typescript
import { paramsSchema } from "~/lib/schemas";

// Product ID validation
const validationResult = paramsSchema.productId.safeParse(params);
if (!validationResult.success) {
  // Handle validation error
  return <ErrorComponent message={validationResult.error.errors[0]?.message} />;
}
const { id: productId } = validationResult.data;
```

#### Form Data

```typescript
import { productFormSchema } from "~/lib/schemas";

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
import { searchParamsSchema, paginationSchema } from "~/lib/schemas";

const [searchParams] = useSearchParams();
const searchValidation = searchParamsSchema.safeParse(
  Object.fromEntries(searchParams)
);
const paginationValidation = paginationSchema.safeParse(
  Object.fromEntries(searchParams)
);
```

### Utility Functions

```typescript
import {
  validateWithZod,
  getFieldErrors,
  validateUrlParams,
} from "~/lib/utils";

// Generic validation
const result = validateWithZod(mySchema, data);

// Get field-specific errors
const errors = getFieldErrors(mySchema, data);

// Validate URL parameters
const validatedParams = validateUrlParams(mySchema, params);
```

### Schema Types

- **Product Schemas**: `productFormSchema`, `paramsSchema.productId`
- **User Schemas**: `userSchema`, `createUserSchema`, `loginSchema`
- **Community Schemas**: `communityPostSchema`, `commentSchema`
- **Search Schemas**: `searchParamsSchema`, `paginationSchema`

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
