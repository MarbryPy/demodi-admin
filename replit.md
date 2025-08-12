# DémoDi Card Manager

## Overview

This is a mobile-first web application for managing DémoDi game cards with password-protected admin access. The app allows authorized users to create, view, and manage dice game cards with specific attributes including categories (basic/special), alignments (blessed/cursed), visibility settings, rarity levels, and revelation behaviors. It features a responsive React frontend with shadcn/ui components and an Express.js backend with Supabase database integration via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Single-page application with conditional rendering based on auth status

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Session Management**: Express sessions with in-memory storage (MemoryStore)
- **Authentication**: Password-based authentication with session cookies
- **API Design**: RESTful endpoints for auth and card management
- **Error Handling**: Centralized error middleware with structured responses
- **Development**: Hot reload with Vite integration in development mode

### Data Storage
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Two main entities - users and game_cards
- **Migrations**: Drizzle Kit for database schema management
- **Fallback**: In-memory storage implementation for development/testing

### Authentication & Authorization
- **Method**: Session-based authentication with password protection
- **Session Store**: Memory-based session storage with 8-hour expiration
- **Protection**: Middleware-based route protection for authenticated endpoints
- **Security**: HTTP-only cookies, CSRF protection considerations

### Data Models
- **DémoDi Cards (cartes)**: Game-specific card attributes including:
  - titre (title, required text)
  - effet (effect description, required text)  
  - categorie (basic | special)
  - alignement (blessed | cursed)
  - visibilite_defaut (face_up | face_down)
  - rarete (common | uncommon | rare, null for special cards)
  - comportement_revelation (on_view_owner | on_steal_new_owner | immediate)
  - actif (boolean, default true)
- **Users**: Basic user model with username and password (legacy, not actively used)
- **Validation**: Zod schemas with DémoDi-specific business rules including special card rarity constraints

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless database connection
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **express**: Web framework for Node.js backend
- **react**: Frontend UI library with hooks
- **vite**: Build tool and development server

### UI Component Libraries
- **@radix-ui/***: Unstyled, accessible UI primitives (accordion, dialog, select, etc.)
- **@tanstack/react-query**: Server state management and caching
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant styling utility

### Form and Validation
- **react-hook-form**: Performant forms with easy validation
- **@hookform/resolvers**: Integration between react-hook-form and validation libraries
- **zod**: TypeScript-first schema validation
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### Development Tools
- **typescript**: Static type checking
- **@replit/vite-plugin-***: Replit-specific development plugins
- **esbuild**: Fast JavaScript bundler for production builds

### Session Management
- **express-session**: Session middleware for Express
- **memorystore**: Memory-based session store with TTL support
- **connect-pg-simple**: PostgreSQL session store (available but not actively used)