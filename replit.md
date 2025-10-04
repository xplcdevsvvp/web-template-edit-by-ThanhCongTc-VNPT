# Overview

This is a cloud hosting service marketplace application built with React, Express, and PostgreSQL. The platform allows users to browse and purchase various hosting services including VPS Cloud, Cloud Game hosting, and Dedicated Servers. The application features a modern, animated UI with authentication, service browsing, and order management capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: React with TypeScript, Vite as the build tool, and Wouter for client-side routing.

**UI Framework**: Utilizes shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling. The design system follows a dark theme with custom CSS variables for colors and uses the "new-york" style variant.

**State Management**: TanStack React Query (v5) handles server state management, API data fetching, and caching. The query client is configured with infinite stale time and disabled automatic refetching for predictable data behavior.

**Animation System**: Framer Motion provides interactive animations throughout the UI, including hero section particles, carousel strips, modal transitions, and micro-interactions.

**Component Structure**:
- Page components (`Home`, `NotFound`) handle routing and layout
- Feature components (`HeroSection`, `ServicesSection`, `CarouselStrip`) manage specific sections
- Modal components (`AuthModals`, `ServiceDetailModal`, `CheckoutModal`, `ContactModal`) handle user interactions
- UI components from shadcn/ui provide consistent, accessible interface elements

**Design Rationale**: The single-page application (SPA) architecture with client-side routing provides a smooth user experience without page reloads. React Query eliminates the need for complex state management libraries by handling async data fetching and caching declaratively.

## Backend Architecture

**Framework**: Express.js server with TypeScript running in ESM module mode.

**Development Setup**: Uses tsx for development with hot reloading, and esbuild for production builds bundling the server code.

**Request/Response Flow**:
- JSON body parsing with raw body preservation for webhook verification
- Request logging middleware that captures API calls, response times, and truncated JSON responses
- Route registration pattern separates route definitions from server setup

**Storage Layer**: Currently uses in-memory storage (`MemStorage` class) implementing the `IStorage` interface. This provides a clean abstraction that can be swapped for a database implementation without changing route logic.

**API Design**: RESTful endpoints organized by feature:
- `/api/auth/*` - Authentication (login, register)
- `/api/services/:type/plans` - Service plan retrieval
- `/api/orders` - Order creation and management

**Session Management**: Configured to use `connect-pg-simple` for PostgreSQL session storage (ready for database integration).

**Design Rationale**: The storage abstraction pattern allows rapid prototyping with in-memory storage while maintaining a clear migration path to persistent database storage. Express middleware pipeline provides clean separation of concerns for logging, parsing, and error handling.

## Database Architecture

**ORM**: Drizzle ORM configured for PostgreSQL with migrations stored in `/migrations` directory.

**Schema Design** (defined in `shared/schema.ts`):
- `users` table: Stores user credentials (id, name, email, password)
- `service_plans` table: Defines available hosting plans with features stored as JSONB
- `orders` table: Tracks user purchases with QR code data and status

**Type Safety**: Drizzle-Zod integration generates Zod schemas from Drizzle tables, providing runtime validation and TypeScript types from a single source of truth.

**Database Provider**: Configured to use Neon's serverless PostgreSQL driver for edge-compatible database access.

**Design Rationale**: The schema separates service plans from orders to allow dynamic plan updates without affecting historical order data. JSONB storage for plan features provides flexibility for varying feature sets across different service types. UUID primary keys enable distributed ID generation.

## External Dependencies

**Database**: 
- Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- Drizzle ORM (`drizzle-orm`) for type-safe database queries
- PostgreSQL session store (`connect-pg-simple`)

**UI Libraries**:
- Radix UI component primitives (accordion, dialog, dropdown, etc.)
- Tailwind CSS for utility-first styling
- shadcn/ui component collection (configured in `components.json`)
- Framer Motion for animations
- Lucide React for icons

**Development Tools**:
- Vite with React plugin for fast development
- Replit-specific plugins: runtime error overlay, cartographer, dev banner
- TypeScript for type safety across the stack

**Form & Validation**:
- React Hook Form with Zod resolvers for form validation
- Zod schemas derived from Drizzle tables ensure consistent validation

**Other Services**:
- QR code generation (`react-qr-code`) for payment processing
- Date formatting (`date-fns`)
- Carousel functionality (`embla-carousel-react`)

**Design Rationale**: The dependency choices prioritize developer experience (TypeScript, Drizzle, Vite) and user experience (Radix UI accessibility, Framer Motion smoothness). The Replit plugins are conditional for production builds, avoiding unnecessary bundle size. Neon's serverless driver enables edge deployment without connection pooling concerns.