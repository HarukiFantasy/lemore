# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Essential Commands
- `npm run build` - Build production bundle with React Router
- `npm run dev` - Start development server with HMR and Sentry instrumentation
- `npm run start` - Start production server with Sentry instrumentation  
- `npm run typecheck` - Run React Router type generation and TypeScript checking

### Database Commands
- `npm run db:generate` - Generate Drizzle migrations from schema changes
- `npm run db:push` - Push schema changes to database (development)
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run db:migrate` - Run database migrations
- `npm run db:typegen` - Generate TypeScript types from Supabase schema

## High-Level Architecture

### Core Framework Stack
- **Frontend**: React 19 with React Router 7 (file-based routing)
- **Backend**: React Router SSR with Supabase integration
- **Database**: PostgreSQL via Supabase with Drizzle ORM
- **Authentication**: Supabase Auth with PKCE flow
- **Styling**: Tailwind CSS with Shadcn UI components
- **AI Integration**: OpenAI API for Let Go Buddy features
- **Multi-Country**: Thailand and Korea location support with currency handling

### Project Structure
```
app/
├── features/           # Feature-based modules
│   ├── auth/          # Authentication (login, join, OTP, social)
│   ├── products/      # Secondhand marketplace
│   ├── let-go-buddy/  # AI-powered decluttering assistant
│   └── users/         # User profiles, messages, notifications
├── common/            # Shared components and pages
├── hooks/             # Reusable React hooks  
├── lib/               # Utility functions
└── sql/               # Database schema, migrations, views, triggers
```

### Database Architecture
- **Dual ORM Setup**: Drizzle for schema definition, Supabase client for queries
- **Row Level Security**: Comprehensive RLS policies for all tables
- **Schema Organization**: Features have dedicated table groups with proper foreign keys
- **Views & Functions**: Complex queries abstracted into database views and SQL functions
- **Triggers**: Automated data consistency maintenance (stats, notifications, badges)

### Key Development Patterns

#### Route Structure
- Routes defined in `app/routes.ts` using React Router's config-based approach
- Feature-based routing with prefixes (`/secondhand`, `/let-go-buddy`)
- Layout nesting for auth pages and shared UI components

#### Component Architecture  
- Export loader, action, and meta functions for all pages
- Use `Route.ComponentProps` instead of `useLoaderData`/`useActionData` hooks
- Import route types as `import type { Route } from "./+types/..."`
- Return plain objects from loaders (no `json()` wrapper needed)

#### Authentication Flow
- SSR authentication in root loader with automatic profile creation
- PKCE flow for improved security
- Comprehensive error handling for token refresh scenarios
- Auth state managed globally with error boundaries

#### Database Queries
- Use Supabase client for all database operations (not Drizzle directly)
- Views handle complex joins and calculations
- Triggers maintain data consistency (stats, notifications)
- RLS policies enforce security at database level

## Development Guidelines

### Component Development
- Use TypeScript for all code; prefer interfaces over types
- Functional and declarative programming patterns
- Use descriptive variable names with auxiliary verbs
- Import UI components from Shadcn UI, not Radix directly
- Import from "react-router", not "@remix-run"

### Database Development
- Schema changes require both Drizzle migration and Supabase sync
- Test RLS policies thoroughly - they're critical for security
- Use database views for complex read operations
- Leverage triggers for maintaining computed fields

### Feature Development
- Each feature is self-contained with its own pages, components, queries
- Follow established patterns for loader/action/meta exports
- Validate all inputs with Zod schemas (defined locally per component)
- Handle authentication errors gracefully throughout the app

## Important Notes

### Environment Setup
- Supabase configuration required for auth and database
- OpenAI API key needed for Let Go Buddy AI features
- Sentry configuration for error tracking in production

### Multi-Country Location System
- **Supported Countries**: Thailand, Korea
- **Thailand Cities**: Bangkok (default), ChiangMai, Phuket, HuaHin, Pattaya, Krabi, Koh Samui, Other Thai Cities
- **Korea Cities**: Seoul (default), Busan, Incheon, Daegu, Daejeon, Gwangju, Ulsan, Other Korean Cities
- **Currency Support**: THB for Thailand, KRW for Korea (with formatting utilities)
- **Location Utilities**: `getCountryByLocation()`, `getCurrencyByLocation()`, `formatPrice()` functions

### File Upload Features
- Avatar uploads: `avatars` bucket with user-specific folders
- Product images: `letgobuddy-product` bucket with RLS policies
- 5MB limit, JPEG/PNG/WebP formats supported

### Testing & Deployment
- No specific test runner configured - check with user for testing approach
- Docker support available with production-ready container setup
- Built for deployment on various platforms (Vercel, Fly.io, Railway, etc.)