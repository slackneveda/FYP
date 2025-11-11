# Sweet Dessert App - AI Coding Agent Instructions

## Architecture Overview

This is a **full-stack dessert e-commerce application** with Django REST backend and React frontend:
- **Backend**: Django + DRF (`backend/`) with SQLite database
- **Frontend**: React + Vite (`frontend/sweet-dessert/`) with Tailwind CSS
- **Payment**: Stripe integration for order processing
- **AI Chat**: ChromaDB + OpenRouter (Mistral-7B) for semantic search & conversational ordering
- **Environment**: Windows PowerShell, Python virtual environment (`myenv/`)

## Key Development Workflows

### Starting the Application
```powershell
# Backend (use provided script)
.\start_backend.ps1  # Handles venv activation, migrations, and runserver

# Frontend (separate terminal)
cd frontend\sweet-dessert
npm run dev  # Starts on localhost:5173
```

### Virtual Environment Pattern
- **Always use**: `D:\UNI\FYP\PROJECT\myenv\Scripts\Activate.ps1`
- Backend requires activated venv for all Python operations
- Script `start_backend.ps1` handles this automatically

### Data Management Commands
- **Custom management commands** in `backend/sweetapp/management/commands/`:
  - `populate_all_data.py` - Complete database population with sample data
  - `populate_desserts.py`, `populate_cms_data.py` - Specific data sets
  - `update_prices.py`, `update_product_descriptions.py` - Bulk updates
  - `create_initial_faq.py` - FAQ page seeding
- **Usage**: `python manage.py populate_all_data` (requires activated venv)

### AI Chat Assistant Workflow
- **Vector DB**: ChromaDB stores product embeddings from PDF training data at `chroma_db/`
- **Initialization**: Run `python generate_comprehensive_training_pdf.py` to create training data, then load into ChromaDB via `vector_db.py`
- **API**: OpenRouter integration requires `OPENROUTER_API_KEY` in `backend/.env`
- **Endpoints**: `/api/chat/stream/` (SSE), `/api/chat/add-to-cart/`, `/api/chat/analytics/`

## Critical Project Patterns

### Django Backend (`backend/sweetapp/`)
- **Models**: Rich dessert e-commerce models with UUID orders, JSON fields for customizations
  - Order model auto-generates order numbers: `DL-YYYYMMDD-XXX` (delivery) or `TA-YYYYMMDD-XXX` (takeaway)
  - Supports both `online` (Stripe) and `store` (pay at pickup) payment methods
  - CMS models for About, Story, FAQ pages with inline editing relationships
- **API Structure**: DRF ViewSets for CRUD + function-based views for payments/chat
- **URL Pattern**: All API endpoints under `/api/` (see `sweetapp/urls.py`)
  - RESTful ViewSets: `/api/categories/`, `/api/desserts/`, `/api/cms/*`
  - Function views: `/api/create-payment-intent/`, `/api/chat/stream/`
- **CORS**: Configured for Vite dev server (localhost:5173) with credentials support
- **Authentication**: Django sessions (NOT JWT) - requires `credentials: 'include'` in fetch calls
- **AI Chat (`chat_views.py`)**: 
  - Streaming responses via Server-Sent Events (SSE)
  - Order intent detection from natural language
  - Session-based cart management (not database-backed)
  - ChromaDB semantic search for product context

### Frontend Architecture (`frontend/sweet-dessert/src/`)
- **Routing**: React Router v7 with lazy loading for all pages except HomePage
- **State**: Context providers for Cart, Auth, Theme (wrapping order matters in App.jsx)
- **Styling**: Tailwind + shadcn/ui components in `components/ui/` with custom dessert theme colors
- **API**: Centralized service class (`services/api.js`) - always use this, not direct fetch
- **Assets**: Local images organized by category (`src/assets/images/categories/`) + external Unsplash URLs in data
- **Data**: Mock data in `src/data/desserts.js` for development, replaced by API calls in production

### Key Frontend Patterns
- **Import Aliases**: Uses `@/` path aliases configured in `vite.config.js` (`@/components`, `@/pages`, etc.)
- **Cart System**: Uses `useReducer` with localStorage persistence, supports customizations and cartId tracking
- **Component Organization**: `ui/` for reusable shadcn components, `features/` for business logic, `layout/` for structure
- **Environment Variables**: Stripe keys in `.env.local` with `VITE_` prefix for client-side access
- **Animations**: Custom Tailwind animations (shimmer, aurora, fade-in) for dessert-themed interactions
- **Admin Panel**: Comprehensive admin interface with lazy-loaded components in `components/admin/`
- **API Communication**: MUST use `credentials: 'include'` for all fetch calls to maintain Django sessions
- **Lazy Loading**: All pages except HomePage use `React.lazy()` with Suspense boundaries in `App.jsx`

### Payment Flow Integration
- **Frontend**: Stripe Elements → creates PaymentIntent → confirms payment
- **Backend**: Creates PaymentIntent → saves Order with auto-generated number (ORD-YYYYMMDD-XXX)
- **Models**: Order has UUID primary key, OrderItem tracks cart items with customizations
- **Cart**: Supports item customizations stored as JSON, uses cartId for unique identification

### AI Chat System Architecture
- **Vector Database (`vector_db.py`)**: ChromaDB with sentence-transformers/all-MiniLM-L6-v2 embeddings
- **PDF Training Data**: `generate_comprehensive_training_pdf.py` extracts all product data to PDF
- **Semantic Search**: Chunks product descriptions and stores in `chroma_db/` for context retrieval
- **Streaming Chat (`chat_views.py`)**: 
  - OpenRouter API with Mistral-7B model for conversational AI
  - Server-Sent Events (SSE) for real-time streaming responses
  - Intent detection: recognizes order requests, product lists, checkout commands
  - Session cart: stores cart in Django sessions, not database (ephemeral)
- **Integration Points**: 
  - `/api/chat/stream/` - Main chat endpoint with streaming
  - `/api/chat/add-to-cart/` - Manual cart addition
  - `/api/chat/analytics/` - Admin analytics dashboard
  - Frontend FloatingChatWidget triggers SSE connection

## File Organization Conventions

### Backend Structure
```
backend/
├── manage.py              # Django management
├── backend/settings.py    # CORS, Stripe config with decouple
├── sweetapp/
│   ├── models.py          # Rich e-commerce models (Order, DessertItem, etc.)
│   ├── views.py           # DRF ViewSets + payment endpoints
│   └── urls.py            # API routing (all under /api/)
```

### Frontend Structure  
```
frontend/sweet-dessert/src/
├── App.jsx               # Route definitions with Suspense
├── contexts/             # Cart, Auth, Theme providers
├── components/
│   ├── ui/               # shadcn/ui reusable components
│   ├── layout/           # Header, Footer, Layout
│   └── features/         # Feature-specific components
├── pages/                # Page components (most lazy-loaded)
└── services/api.js       # Centralized API service class
```

## Environment & Dependencies

### Backend Environment
- Python packages via `requirements.txt` (Django, DRF, Stripe, CORS, decouple)
- Environment variables in `backend/.env` (Stripe keys, Django settings)
- Database: SQLite with UUID fields, JSON fields for modern Django patterns
- **Required `.env` keys**:
  - `SECRET_KEY` - Django secret
  - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` - Payment processing
  - `OPENROUTER_API_KEY` - AI chat assistant API
  - `DEBUG` - Development mode (True/False)

### Frontend Dependencies  
- **UI**: React 19 + Tailwind + shadcn/ui components with custom dessert theme
- **Routing**: React Router v7 with lazy loading pattern and Suspense boundaries
- **Forms**: React Hook Form + Zod validation for type-safe forms
- **Payments**: Stripe React.js SDK (`@stripe/react-stripe-js`)
- **Animation**: Framer Motion + custom Tailwind animations (shimmer, aurora)
- **State**: Context API with useReducer (no Redux/Zustand)
- **Build**: Vite with path aliases and React plugin
- **Notifications**: Sonner for toast notifications

## Development Guidelines

1. **API Communication**: Always use `api.js` service class, never direct fetch calls
2. **Component Loading**: New pages should be lazy-loaded in `App.jsx` with Suspense fallback
3. **State Management**: Use existing contexts (Cart, Auth, Theme) - no Redux/Zustand needed
4. **Styling**: Follow Tailwind + shadcn/ui patterns, use custom dessert theme colors from config
5. **Assets**: Use local images from `src/assets/images/categories/` or external Unsplash URLs
6. **Import Paths**: Use `@/` aliases defined in `vite.config.js` for cleaner imports
7. **Backend Changes**: Run migrations after model changes, test via Django admin
8. **CORS**: Frontend dev server must run on localhost:5173 for backend communication
9. **Session Auth**: ALWAYS include `credentials: 'include'` in fetch calls for Django session cookies
10. **AI Chat**: Initialize ChromaDB before using chat - run PDF generation script first

## Integration Points

- **Payment Processing**: Frontend Stripe Elements → Django PaymentIntent creation → Order saving
- **Authentication**: Django sessions with CORS credentials for React integration  
- **Media**: Static files served from `backend/media/` (videos, images)
- **API Endpoints**: RESTful with DRF ViewSets for CRUD, function views for complex operations
- **AI Chat**: ChromaDB vector search → OpenRouter Mistral-7B → SSE streaming to frontend
- **CMS Pages**: Dynamic content editing via admin panel for About, Story, FAQ pages

## Common Tasks

- **Add new page**: Create in `pages/`, add lazy import to `App.jsx` with Suspense wrapper
- **New API endpoint**: Add to `sweetapp/views.py` + `urls.py`, update `api.js` service class
- **Database changes**: Modify `models.py` → `makemigrations` → `migrate` → test in admin
- **Frontend styling**: Use existing Tailwind classes + dessert theme colors, extend in config
- **Add components**: Use shadcn/ui in `ui/` folder, business logic in `features/`
- **Cart modifications**: Update CartProvider reducer, supports customizations + persistence
- **Data population**: Use management commands to populate test data after model changes
- **AI Chat changes**: 
  - Update system prompt in `chat_views.py::build_system_prompt()`
  - Modify intent detection in `chat_views.py::detect_order_intent()`
  - Regenerate embeddings if product data changes: `python generate_comprehensive_training_pdf.py`
- **CMS updates**: Edit via admin panel or modify ViewSets in `views.py` for CMS models