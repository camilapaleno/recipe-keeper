# Recipe Manager Application

## Overview

This is a full-stack recipe management application built with React, Express, and PostgreSQL. The application allows users to create, organize, and manage recipes in collections called "stacks." It features a modern UI with drag-and-drop functionality for organizing recipes and stacks in a grid layout.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation for form handling
- **Animations**: Framer Motion for smooth drag-and-drop interactions

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript for type safety across the stack
- **API Design**: RESTful API with standard HTTP methods
- **Request Handling**: Express middleware for JSON parsing, URL encoding, and request logging
- **Error Handling**: Centralized error handling middleware
- **Development**: Hot module replacement with Vite integration in development mode

### Data Layer
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database queries
- **Schema Management**: Drizzle Kit for database migrations
- **Validation**: Zod schemas for runtime type validation
- **Storage Pattern**: Repository pattern with in-memory fallback for development

### Data Models
- **Recipes**: Contains title, description, category, ingredients (JSON array), directions, position, and optional stack association
- **Stacks**: Recipe collections with name, description, and position for ordering
- **Users**: Basic user model with username and password (authentication not fully implemented)

### Key Features
- **Drag and Drop**: Grid-based interface for organizing recipes and stacks
- **Stack Management**: Group recipes into collections with expand/collapse functionality
- **Modal Interactions**: Full-screen modals for recipe viewing and editing
- **Real-time Updates**: Optimistic updates with React Query for smooth UX
- **Responsive Design**: Mobile-first design with adaptive layouts

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting
- **Environment Variables**: DATABASE_URL for database connection

### UI & Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Framer Motion**: Animation library for drag-and-drop interactions

### Development Tools
- **Replit Integration**: Development environment with runtime error overlay and cartographer plugin
- **TypeScript**: Static type checking across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds

### Form & Validation
- **React Hook Form**: Performant form library with validation
- **Zod**: TypeScript-first schema validation library
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### HTTP & API
- **TanStack Query**: Data fetching and caching library
- **Fetch API**: Native browser API for HTTP requests
- **Express Session**: Session management (configured but not actively used)