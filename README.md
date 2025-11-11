# Sweet Dessert

A full-stack e-commerce platform for ordering premium desserts online, featuring AI-powered chat assistance, real-time order processing, and comprehensive admin management. Built with React + Vite on the frontend and Django REST Framework on the backend, Sweet Dessert offers both delivery and store pickup options with integrated Stripe payment processing.

---

## 🚀 Quick Start

**First time setting up?** See [SETUP.md](./SETUP.md) for step-by-step instructions.

```powershell
# 1. Clone and setup environment
git clone https://github.com/slackneveda/FYP.git
cd FYP
.\setup_env.ps1

# 2. Edit .env files with your API keys (see SETUP.md)
# 3. Run the application
.\start_backend.ps1  # Terminal 1
cd frontend\sweet-dessert && npm run dev  # Terminal 2
```

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [AI & Machine Learning](#ai--machine-learning)
  - [Payment & Infrastructure](#payment--infrastructure)
- [Prerequisites](#prerequisites)
- [Project Architecture](#project-architecture)
- [Installation](#installation)
  - [Backend Setup (Django)](#backend-setup-django)
  - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
  - [AI Chat Assistant Setup](#ai-chat-assistant-setup)
- [Configuration](#configuration)
  - [Backend Environment Variables](#backend-environment-variables)
  - [Frontend Environment Variables](#frontend-environment-variables)
- [Running the Application](#running-the-application)
- [Workflow Steps](#workflow-steps)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)
- [Credits](#credits)
- [License](#license)

---

## Overview

**Sweet Dessert** is a modern e-commerce platform designed to revolutionize how customers order premium desserts. The application provides:

- **🛒 Full E-Commerce Experience**: Browse categories (cakes, brownies, cookies, cupcakes, donuts, ice cream), view detailed product information, and manage shopping cart with customizations
- **🤖 AI Chat Assistant**: Conversational ordering powered by ChromaDB vector search and OpenRouter's Mistral-7B model with natural language understanding
- **💳 Dual Payment Options**: Pay online via Stripe or pay at store for pickup orders
- **📦 Flexible Fulfillment**: Choose between home delivery or store pickup with preferred time slots
- **👨‍💼 Admin Dashboard**: Comprehensive management interface for products, orders, customers, CMS content, and chat analytics
- **📱 Responsive Design**: Mobile-first approach with custom Tailwind animations and shadcn/ui components
- **🎨 Dynamic CMS**: Editable About Us, Our Story, and FAQ pages through admin panel

**Target Audience**: Dessert lovers, event planners, and businesses looking for premium desserts with convenient ordering options.

**Motivation**: To create a seamless, delightful ordering experience that combines traditional e-commerce with AI assistance, making it easier for customers to discover and order the perfect desserts for any occasion.

---

## Technology Stack

### Frontend

- **React** 19.0.0 - UI library for building interactive interfaces
- **Vite** 6.0.11 - Fast build tool and development server
- **React Router** 7.1.3 - Client-side routing with lazy loading
- **Tailwind CSS** 3.4.17 - Utility-first styling framework
- **shadcn/ui** - Pre-built accessible component library
- **Framer Motion** 11.15.0 - Animation library for smooth transitions
- **React Hook Form** 7.54.2 + Zod 3.24.1 - Form validation
- **Stripe React.js** 2.10.0 - Payment processing UI components
- **Sonner** 1.7.3 - Toast notifications
- **Lucide React** 0.469.0 - Icon library

### Backend

- **Django** 5.2.6 - Python web framework
- **Django REST Framework** 3.15.2 - RESTful API development
- **Python** 3.13+ - Programming language
- **SQLite** - Development database (PostgreSQL recommended for production)
- **django-cors-headers** 4.6.0 - Cross-Origin Resource Sharing
- **python-decouple** 3.8 - Environment variable management
- **Stripe Python** 11.7.0 - Payment processing backend
- **PyJWT** 2.10.1 - JSON Web Token handling

### AI & Machine Learning

- **ChromaDB** 0.5.23 - Vector database for semantic search
- **Sentence Transformers** 3.3.1 - Text embedding generation
- **OpenRouter API** - LLM gateway (Mistral-7B model)
- **PyPDF2** 3.0.1 - PDF processing for training data
- **Requests** 2.32.3 - HTTP library for API calls

### Payment & Infrastructure

- **Stripe** - Payment processing for online orders
- **ReportLab** 4.2.5 - PDF generation for training datasets
- **Pillow** 11.1.0 - Image processing

---

## Prerequisites

Ensure you have the following installed on your system:

- **Python** 3.13 or higher ([Download Python](https://www.python.org/downloads/))
- **Node.js** 18.x or higher ([Download Node.js](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** ([Download Git](https://git-scm.com/downloads))
- **PowerShell** (for Windows users, built-in)
- **OpenRouter API Key** ([Get API Key](https://openrouter.ai/))
- **Stripe Account** ([Sign up for Stripe](https://stripe.com/))

**Recommended:**

- **Visual Studio Code** with Python and ESLint extensions
- **Postman** or **Thunder Client** for API testing
- **PostgreSQL** for production deployment

---

## Project Architecture

```text
D:\UNI\FYP\PROJECT\
│
├── backend/                          # Django backend
│   ├── backend/                      # Project configuration
│   │   ├── __init__.py
│   │   ├── settings.py              # Django settings (CORS, Stripe, DB)
│   │   ├── urls.py                  # Root URL configuration
│   │   ├── wsgi.py                  # WSGI application
│   │   ├── asgi.py                  # ASGI application
│   │   └── middleware.py            # Custom CSRF middleware
│   │
│   ├── sweetapp/                     # Main Django app
│   │   ├── models.py                # Database models (Order, DessertItem, CMS)
│   │   ├── views.py                 # DRF ViewSets for CRUD operations
│   │   ├── serializers.py           # DRF serializers
│   │   ├── urls.py                  # App-level URL routing
│   │   ├── admin.py                 # Django admin configuration
│   │   ├── admin_views.py           # Admin API endpoints
│   │   ├── auth_views.py            # Authentication endpoints
│   │   ├── chat_views.py            # AI chat assistant endpoints (SSE)
│   │   ├── vector_db.py             # ChromaDB integration
│   │   │
│   │   └── management/commands/     # Custom Django commands
│   │       ├── populate_all_data.py     # Full database seeding
│   │       ├── populate_desserts.py     # Product population
│   │       ├── populate_cms_data.py     # CMS content seeding
│   │       ├── update_prices.py         # Bulk price updates
│   │       └── create_initial_faq.py    # FAQ initialization
│   │
│   ├── media/                        # User-uploaded files
│   │   └── videos/                   # Hero videos
│   │
│   ├── db.sqlite3                    # SQLite database (dev)
│   ├── manage.py                     # Django management script
│   ├── requirements.txt              # Python dependencies
│   └── .env                          # Environment variables (not in repo)
│
├── frontend/sweet-dessert/           # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── layout/               # Header, Footer, Layout
│   │   │   ├── features/             # FloatingChatWidget, etc.
│   │   │   ├── admin/                # Admin panel components
│   │   │   ├── checkout/             # Checkout form components
│   │   │   └── menu/                 # Category grid components
│   │   │
│   │   ├── pages/                    # Route components (lazy-loaded)
│   │   │   ├── HomePage.jsx
│   │   │   ├── MenuPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── ChatAssistantPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   │
│   │   ├── contexts/                 # React Context providers
│   │   │   ├── CartProvider.jsx      # Shopping cart state
│   │   │   ├── AuthContext.jsx       # Authentication state
│   │   │   └── ThemeProvider.jsx     # Theme management
│   │   │
│   │   ├── services/
│   │   │   ├── api.js                # Centralized API service
│   │   │   └── adminApi.js           # Admin-specific APIs
│   │   │
│   │   ├── assets/images/categories/ # Product images by category
│   │   ├── App.jsx                   # Main app component with routes
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Global styles
│   │
│   ├── public/                       # Static assets
│   ├── .env.local                    # Frontend environment variables
│   ├── package.json                  # npm dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   └── components.json               # shadcn/ui configuration
│
├── chroma_db/                        # ChromaDB vector database
│   ├── chroma.sqlite3                # ChromaDB persistence
│   └── [collection-id]/              # Vector embeddings
│
├── myenv/                            # Python virtual environment
│   ├── Scripts/Activate.ps1          # venv activation (Windows)
│   └── Lib/site-packages/            # Installed Python packages
│
├── generate_comprehensive_training_pdf.py  # PDF training data generator
├── start_backend.ps1                 # Backend startup script
├── setup_chat_assistant_clean.ps1    # AI chat setup automation
├── test_chat_setup.py                # AI chat verification script
├── sweet_dessert_updated_descriptions_training_data.pdf  # Training data
│
├── .github/
│   └── copilot-instructions.md       # AI coding agent instructions
│
└── README.md                         # This file
```

---

## Installation

### Backend Setup (Django)

1. **Clone the repository:**

   ```powershell
   git clone https://github.com/your-username/sweet-dessert.git
   cd sweet-dessert
   ```

2. **Create Python virtual environment:**

   ```powershell
   python -m venv myenv
   ```

3. **Activate virtual environment:**

   ```powershell
   # Windows PowerShell
   .\myenv\Scripts\Activate.ps1
   
   # Linux/macOS
   source myenv/bin/activate
   ```

4. **Navigate to backend directory:**

   ```powershell
   cd backend
   ```

5. **Install Python dependencies:**

   ```powershell
   pip install -r requirements.txt
   ```

   This will install:

   - Django 5.2.6
   - djangorestframework 3.15.2
   - django-cors-headers 4.6.0
   - stripe 11.7.0
   - chromadb 0.5.23
   - sentence-transformers 3.3.1
   - And all other required packages

6. **Run database migrations:**

   ```powershell
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create Django superuser:**

   ```powershell
   python manage.py createsuperuser
   ```

   Follow prompts to set username, email, and password for admin access.

8. **Populate database with sample data:**

   ```powershell
   python manage.py populate_all_data
   ```

   This command will:

   - Create product categories
   - Add dessert items with descriptions and pricing
   - Generate customer testimonials
   - Add chef recommendations
   - Populate CMS pages (About, Story, FAQ)

9. **Verify installation:**

   ```powershell
   python manage.py runserver
   ```

   Visit `http://127.0.0.1:8000/admin` to access Django admin panel.

### Frontend Setup (React + Vite)

1. **Navigate to frontend directory:**

   ```powershell
   cd ..\frontend\sweet-dessert
   ```

2. **Install npm dependencies:**

   ```powershell
   npm install
   ```

   This will install:

   - React 19.0.0
   - Vite 6.0.11
   - React Router 7.1.3
   - Tailwind CSS 3.4.17
   - shadcn/ui components
   - Stripe React.js SDK
   - All other required packages

3. **Verify installation:**

   ```powershell
   npm run dev
   ```

   Visit `http://localhost:5173` to see the application.

### AI Chat Assistant Setup

1. **Generate PDF training data:**

   ```powershell
   # From project root
   cd D:\UNI\FYP\PROJECT
   python generate_comprehensive_training_pdf.py
   ```

   This creates `sweet_dessert_updated_descriptions_training_data.pdf` with product information.

2. **Run automated setup script:**

   ```powershell
   .\setup_chat_assistant_clean.ps1
   ```

   This script will:

   - Verify virtual environment
   - Check for required files
   - Install Python dependencies
   - Run database migrations
   - Verify OpenRouter API key configuration

3. **Test AI chat system:**

   ```powershell
   python test_chat_setup.py
   ```

   This runs comprehensive tests for:

   - PDF training data availability
   - Django imports
   - ChromaDB initialization
   - Vector search functionality
   - OpenRouter API configuration

4. **Initialize ChromaDB (automatic on first run):**

   When you start the Django server for the first time, ChromaDB will automatically:

   - Create the `chroma_db` directory
   - Load product embeddings from the PDF
   - Build the vector index for semantic search

---

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Django Configuration
SECRET_KEY=your-django-secret-key-here-generate-with-django-secret-key-generator
DEBUG=True

# Database Configuration (SQLite for development)
# For production, use PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/sweetdessert

# Stripe Payment Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# OpenRouter AI Configuration
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key-here

# CORS Settings (for development)
ALLOWED_HOSTS=localhost,127.0.0.1

# Security Settings (set to False in production with HTTPS)
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
```

**How to get API keys:**

1. **Django SECRET_KEY**: Generate using:

   ```python
   from django.core.management.utils import get_random_secret_key
   print(get_random_secret_key())
   ```

2. **Stripe Keys**:

   - Sign up at [https://stripe.com](https://stripe.com)
   - Navigate to Developers → API Keys
   - Copy "Publishable key" and "Secret key" from test mode

3. **OpenRouter API Key**:

   - Sign up at [https://openrouter.ai](https://openrouter.ai)
   - Go to Keys section
   - Create new API key
   - Copy the key starting with `sk-or-v1-`

### Frontend Environment Variables

Create a `.env.local` file in the `frontend/sweet-dessert/` directory:

```env
# API Configuration
VITE_API_URL=http://127.0.0.1:8000/api

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Application Configuration
VITE_APP_NAME=Sweet Dessert
VITE_APP_URL=http://localhost:5173
```

**Important Notes:**

- All frontend environment variables MUST be prefixed with `VITE_`
- Changes to `.env.local` require restarting the Vite dev server
- Never commit `.env` or `.env.local` files to version control

---

## Running the Application

### Using Automated Scripts (Recommended)

**Backend:**

```powershell
.\start_backend.ps1
```

This script will:

- Activate Python virtual environment
- Install/update dependencies
- Run database migrations
- Start Django development server on `http://127.0.0.1:8000`

**Frontend:**

```powershell
cd frontend\sweet-dessert
npm run dev
```

This starts Vite development server on `http://localhost:5173`

### Manual Startup

**Backend:**

```powershell
# 1. Activate virtual environment
.\myenv\Scripts\Activate.ps1

# 2. Navigate to backend
cd backend

# 3. Run migrations (if needed)
python manage.py migrate

# 4. Start server
python manage.py runserver
```

**Frontend:**

```powershell
# 1. Navigate to frontend
cd frontend\sweet-dessert

# 2. Start development server
npm run dev
```

### Access Points

After starting both servers:

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
- **Django Admin**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)
- **API Documentation**: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/) (DRF browsable API)

### Development Workflow

1. **Start Backend** (Terminal 1):

   ```powershell
   .\start_backend.ps1
   ```

2. **Start Frontend** (Terminal 2):

   ```powershell
   cd frontend\sweet-dessert
   npm run dev
   ```

3. **Watch Logs**: Keep both terminals visible to monitor requests and errors

4. **Hot Reload**:

   - Frontend: Vite automatically reloads on file changes
   - Backend: Django auto-reloads on Python file changes (except models)

---

## Workflow Steps

### User Journey: Browse to Checkout

1. **Landing Page**: User visits `http://localhost:5173`
   - React Router loads `HomePage.jsx` (not lazy-loaded)
   - Hero section displays with video background from `backend/media/videos/`
   - Featured desserts fetched via `GET /api/desserts/?featured=true`

2. **Browse Products**: User navigates to Menu
   - `MenuPage.jsx` lazy-loads via React.Suspense
   - Categories fetched: `GET /api/categories/`
   - Response cached in React state (no Redux/Zustand)

3. **View Category**: User clicks "Cakes"
   - Route: `/menu/cakes`
   - `CategoryProductsPage.jsx` loads
   - Products fetched: `GET /api/desserts/?category=cakes`
   - Images loaded from `frontend/src/assets/images/categories/cakes/`

4. **Add to Cart**: User clicks "Add to Cart"
   - CartProvider's `useReducer` dispatch: `ADD_TO_CART`
   - Cart state stored in `localStorage` for persistence
   - Toast notification via Sonner library
   - Cart count badge updates in Header

5. **Proceed to Checkout**: User clicks cart icon
   - Route: `/cart`
   - `CartPage.jsx` displays items from CartContext
   - User selects order type: Delivery or Pickup
   - Route: `/order-type-selection`

6. **Payment**: User chooses payment method
   - **Online Payment** (Stripe):
     1. Route: `/checkout`
     2. `CheckoutPage.jsx` loads Stripe Elements
     3. Frontend: `POST /api/create-payment-intent/` with order data
     4. Backend `views.py::create_payment_intent()`:
        - Validates cart items
        - Calculates total with delivery fee
        - Creates Stripe PaymentIntent
        - Returns `client_secret`
     5. User enters card details
     6. Frontend confirms payment via Stripe SDK
     7. On success: `POST /api/orders/` to save order
     8. Backend generates order number: `DL-20251027-001`
     9. Redirect to `/payment-success`

   - **Pay at Store**:
     1. Route: `/takeaway-info`
     2. User selects pickup time
     3. Frontend: `POST /api/takeaway/create-order/`
     4. Backend creates Order with `payment_method='store'`
     5. Order number: `TA-20251027-001`
     6. Redirect to `/order-confirmation`

### AI Chat Assistant Workflow

1. **User Opens Chat**: Clicks floating chat widget
   - `FloatingChatWidget.jsx` in `components/features/`
   - Component manages WebSocket-like SSE connection

2. **User Types Query**: "Show me chocolate cakes"
   - Frontend: `POST /api/chat/stream/` with `{ message: "..." }`
   - Request includes `credentials: 'include'` for session auth

3. **Backend Processing** (`chat_views.py::chat_stream()`):

   ```text
   ┌─────────────────────────────────────────┐
   │ 1. Receive message                      │
   │ 2. Check user authentication            │
   │ 3. Query ChromaDB for context           │
   │    - vector_db.search(query, n=5)       │
   │    - Returns similar product chunks     │
   │ 4. Detect intent                        │
   │    - detect_order_intent(message)       │
   │    - Checks for: order, list, checkout  │
   │ 5. Build system prompt                  │
   │    - build_system_prompt(chunks, auth)  │
   │    - Includes product context           │
   │ 6. Call OpenRouter API                  │
   │    - Model: mistralai/mistral-7b        │
   │    - Stream: True (SSE)                 │
   │ 7. Stream response to frontend          │
   │    - Server-Sent Events format          │
   │    - data: {"content": "..."}           │
   │ 8. If order intent detected:            │
   │    - Add products to session cart       │
   │    - Send cart_update event             │
   └─────────────────────────────────────────┘
   ```

4. **Frontend Receives Response**:
   - SSE event stream parsed
   - Text chunks appended to chat message
   - If `cart_update` event: update CartContext
   - Display confirmation with product details

5. **Session Management**:
   - Chat cart stored in Django session (ephemeral)
   - Session cookie sent with `credentials: 'include'`
   - NOT persisted to database until checkout

### Admin Dashboard Workflow

1. **Login**: Admin navigates to `/admin`
   - Django admin authentication
   - Session cookie created

2. **Access Admin Panel**: Navigate to `/dashboard`
   - `DashboardPage.jsx` checks `AuthContext.isStaff`
   - If not staff: redirect to home
   - `ProtectedRoute` wrapper enforces access

3. **View Analytics**: `AdminDashboard.jsx` loads
   - Fetches: `GET /api/admin/dashboard/`
   - Backend aggregates:
     - Total orders, revenue
     - Recent orders
     - Popular products
     - Chat assistant analytics: `GET /api/chat/analytics/`

4. **Manage Products**: Click "Products" in sidebar
   - `AdminProducts.jsx` lazy-loads
   - Fetches: `GET /api/admin/products/`
   - CRUD operations:
     - Create: `POST /api/admin/products/create/`
     - Update: `PUT /api/admin/products/{id}/`
     - Delete: `DELETE /api/admin/products/{id}/delete/`

5. **Edit CMS Content**: Click "About Us"
   - `AdminAboutUs.jsx` loads
   - Fetches: `GET /api/cms/about-us/`
   - Inline editing of:
     - Hero section text
     - Values (with icons)
     - Team members
   - Save: `PUT /api/cms/about-us/{id}/`

---

## Testing

### Backend Testing (Django)

1. **Run all tests:**

   ```powershell
   cd backend
   python manage.py test
   ```

2. **Run specific app tests:**

   ```powershell
   python manage.py test sweetapp
   ```

3. **Run with verbose output:**

   ```powershell
   python manage.py test --verbosity=2
   ```

4. **Example test file** (`sweetapp/tests.py`):

   ```python
   from django.test import TestCase
   from rest_framework.test import APIClient
   from .models import DessertItem, Category
   
   class DessertItemAPITest(TestCase):
       def setUp(self):
           self.client = APIClient()
           self.category = Category.objects.create(
               name="Cakes",
               slug="cakes"
           )
           self.dessert = DessertItem.objects.create(
               name="Chocolate Cake",
               slug="chocolate-cake",
               description="Rich chocolate cake",
               price=2500.00,
               category=self.category,
               image="/images/cakes/chocolate.jpg",
               preparation_time=30
           )
       
       def test_get_desserts_list(self):
           response = self.client.get('/api/desserts/')
           self.assertEqual(response.status_code, 200)
           self.assertEqual(len(response.data), 1)
       
       def test_get_dessert_detail(self):
           response = self.client.get(f'/api/desserts/{self.dessert.id}/')
           self.assertEqual(response.status_code, 200)
           self.assertEqual(response.data['name'], 'Chocolate Cake')
   ```

5. **Test AI Chat Setup:**

   ```powershell
   python test_chat_setup.py
   ```

   This verifies:

   - ChromaDB initialization
   - Vector search functionality
   - OpenRouter API configuration
   - PDF training data availability

### Frontend Testing (React)

1. **Run Jest tests:**

   ```powershell
   cd frontend\sweet-dessert
   npm test
   ```

2. **Run tests in watch mode:**

   ```powershell
   npm test -- --watch
   ```

3. **Generate coverage report:**

   ```powershell
   npm test -- --coverage
   ```

4. **Example test file** (`src/components/__tests__/CartProvider.test.jsx`):

   ```jsx
   import { render, screen, waitFor } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import { CartProvider, useCart } from '@/contexts/CartProvider';
   
   const TestComponent = () => {
     const { cart, addToCart } = useCart();
     
     return (
       <div>
         <p>Items: {cart.length}</p>
         <button onClick={() => addToCart({
           id: 1,
           name: 'Test Cake',
           price: 2500
         })}>
           Add Item
         </button>
       </div>
     );
   };
   
   describe('CartProvider', () => {
     it('adds item to cart', async () => {
       const user = userEvent.setup();
       
       render(
         <CartProvider>
           <TestComponent />
         </CartProvider>
       );
       
       expect(screen.getByText('Items: 0')).toBeInTheDocument();
       
       await user.click(screen.getByText('Add Item'));
       
       await waitFor(() => {
         expect(screen.getByText('Items: 1')).toBeInTheDocument();
       });
     });
   });
   ```

5. **E2E Testing with Playwright** (optional):

   ```powershell
   npm install -D @playwright/test
   npx playwright test
   ```

### Manual Testing Checklist

- [ ] Homepage loads with hero video
- [ ] Browse categories and view products
- [ ] Add items to cart and verify count badge
- [ ] Cart persists after page refresh (localStorage)
- [ ] Checkout flow completes with Stripe test card
- [ ] Takeaway orders create with store payment
- [ ] AI chat responds to queries
- [ ] AI chat adds products to cart when requested
- [ ] Admin login and dashboard access
- [ ] Admin CRUD operations for products
- [ ] CMS content editing and preview
- [ ] Mobile responsive design

**Stripe Test Cards:**

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

---

## Deployment

### Backend Deployment (Django + Gunicorn + Nginx)

1. **Update settings for production** (`backend/backend/settings.py`):

   ```python
   DEBUG = False
   ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com']
   
   # Use PostgreSQL
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'sweetdessert_db',
           'USER': 'your_db_user',
           'PASSWORD': 'your_db_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   
   # Security settings
   SECURE_SSL_REDIRECT = True
   SESSION_COOKIE_SECURE = True
   CSRF_COOKIE_SECURE = True
   SECURE_BROWSER_XSS_FILTER = True
   SECURE_CONTENT_TYPE_NOSNIFF = True
   ```

2. **Install Gunicorn:**

   ```bash
   pip install gunicorn
   ```

3. **Create Gunicorn service** (`/etc/systemd/system/sweetdessert.service`):

   ```ini
   [Unit]
   Description=Sweet Dessert Gunicorn daemon
   After=network.target
   
   [Service]
   User=your_user
   Group=www-data
   WorkingDirectory=/path/to/sweet-dessert/backend
   ExecStart=/path/to/myenv/bin/gunicorn \
             --workers 3 \
             --bind unix:/path/to/sweet-dessert/backend/sweetdessert.sock \
             backend.wsgi:application
   
   [Install]
   WantedBy=multi-user.target
   ```

4. **Configure Nginx** (`/etc/nginx/sites-available/sweetdessert`):

   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       location = /favicon.ico { access_log off; log_not_found off; }
       
       location /static/ {
           alias /path/to/sweet-dessert/backend/staticfiles/;
       }
       
       location /media/ {
           alias /path/to/sweet-dessert/backend/media/;
       }
       
       location / {
           include proxy_params;
           proxy_pass http://unix:/path/to/sweet-dessert/backend/sweetdessert.sock;
       }
   }
   ```

5. **Collect static files:**

   ```bash
   python manage.py collectstatic --no-input
   ```

6. **Run migrations on production database:**

   ```bash
   python manage.py migrate
   ```

7. **Start Gunicorn service:**

   ```bash
   sudo systemctl start sweetdessert
   sudo systemctl enable sweetdessert
   ```

### Frontend Deployment (Vite Build)

1. **Update API URL** (`.env.production`):

   ```env
   VITE_API_URL=https://api.your-domain.com/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_key
   ```

2. **Build production bundle:**

   ```bash
   npm run build
   ```

   This creates optimized static files in `dist/` directory.

3. **Serve with Nginx** (add to same config):

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       root /path/to/sweet-dessert/frontend/sweet-dessert/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **Enable SSL with Certbot:**

   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

### Docker Deployment (Alternative)

1. **Backend Dockerfile** (`backend/Dockerfile`):

   ```dockerfile
   FROM python:3.13
   
   WORKDIR /app
   
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   
   COPY . .
   
   CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
   ```

2. **Frontend Dockerfile** (`frontend/sweet-dessert/Dockerfile`):

   ```dockerfile
   FROM node:18 AS build
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci
   
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   ```

3. **Docker Compose** (`docker-compose.yml`):

   ```yaml
   version: '3.8'
   
   services:
     db:
       image: postgres:15
       environment:
         POSTGRES_DB: sweetdessert_db
         POSTGRES_USER: your_user
         POSTGRES_PASSWORD: your_password
       volumes:
         - postgres_data:/var/lib/postgresql/data
     
     backend:
       build: ./backend
       command: gunicorn backend.wsgi:application --bind 0.0.0.0:8000
       volumes:
         - ./backend:/app
       ports:
         - "8000:8000"
       depends_on:
         - db
       environment:
         - DATABASE_URL=postgresql://your_user:your_password@db:5432/sweetdessert_db
     
     frontend:
       build: ./frontend/sweet-dessert
       ports:
         - "80:80"
       depends_on:
         - backend
   
   volumes:
     postgres_data:
   ```

4. **Deploy with Docker:**

   ```bash
   docker-compose up -d --build
   ```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. CORS Errors in Browser Console

**Error:**

```text
Access to fetch at 'http://127.0.0.1:8000/api/desserts/' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution:**

- Verify `backend/backend/settings.py` has correct CORS configuration:

  ```python
  CORS_ALLOWED_ORIGINS = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
  ]
  CORS_ALLOW_CREDENTIALS = True
  ```

- Ensure frontend uses `credentials: 'include'` in fetch calls
- Check `django-cors-headers` is installed: `pip show django-cors-headers`

#### 2. Database Connection Errors

**Error:**

```text
django.db.utils.OperationalError: unable to open database file
```

**Solution:**

- Ensure `db.sqlite3` exists in `backend/` directory
- Run migrations: `python manage.py migrate`
- Check file permissions: `chmod 664 db.sqlite3` (Linux/Mac)
- For PostgreSQL: verify connection string in `.env`

#### 3. Port Already in Use

**Error:**

```text
Error: listen EADDRINUSE: address already in use :::5173
```

**Solution:**

```powershell
# Find process using port
netstat -ano | findstr :5173

# Kill process (replace PID)
taskkill /PID <process_id> /F

# Or use different port
npm run dev -- --port 3000
```

#### 4. Stripe Payment Fails

**Error:**

```text
Invalid API Key provided
```

**Solution:**

- Verify `.env` has correct Stripe keys
- Check key format: `sk_test_...` for backend, `pk_test_...` for frontend
- Ensure frontend `.env.local` has `VITE_` prefix
- Test with Stripe test card: `4242 4242 4242 4242`

#### 5. AI Chat Not Responding

**Error:**

```text
ChromaDB collection not found
```

**Solution:**

1. Generate PDF training data:

   ```powershell
   python generate_comprehensive_training_pdf.py
   ```

2. Verify `chroma_db/` directory exists in project root

3. Run chat setup test:

   ```powershell
   python test_chat_setup.py
   ```

4. Check OpenRouter API key in `backend/.env`:

   ```env
   OPENROUTER_API_KEY=sk-or-v1-...
   ```

5. Restart Django server to reinitialize ChromaDB

#### 6. Static Files Not Loading

**Error:**

```text
GET http://localhost:5173/src/assets/images/cakes/chocolate.jpg 404 (Not Found)
```

**Solution:**

- Verify image paths use `@/assets/` alias
- Check `vite.config.js` has correct path resolution:

  ```javascript
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
  ```

- Ensure images exist in `frontend/sweet-dessert/src/assets/images/`

#### 7. Session Cookie Not Set

**Error:**

```text
User authentication fails after login
```

**Solution:**

- Verify `settings.py` session configuration:

  ```python
  SESSION_COOKIE_SAMESITE = 'Lax'
  SESSION_COOKIE_HTTPONLY = False  # For dev
  SESSION_COOKIE_SECURE = False    # For dev
  ```

- Check frontend API calls use `credentials: 'include'`:

  ```javascript
  fetch(url, {
    credentials: 'include',
    // ...
  })
  ```

- Clear browser cookies and try again

#### 8. Module Import Errors

**Error:**

```text
ModuleNotFoundError: No module named 'chromadb'
```

**Solution:**

```powershell
# Activate virtual environment
.\myenv\Scripts\Activate.ps1

# Reinstall requirements
pip install -r backend\requirements.txt

# Verify installation
pip list | findstr chromadb
```

#### 9. React Router 404 on Refresh

**Error:**
Refreshing `/menu/cakes` returns 404

**Solution:**

- For Vite dev server: Already configured with SPA fallback
- For production Nginx: Add to config:

  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```

#### 10. Slow AI Chat Responses

**Issue:**
Chat takes 10+ seconds to respond

**Solution:**

- Check internet connection (OpenRouter API is remote)
- Reduce `max_tokens` in `chat_views.py::generate_chat_stream()`:

  ```python
  payload = {
      "max_tokens": 300,  # Reduce from 600
      # ...
  }
  ```

- Consider caching frequent queries in Redis (future improvement)

---

## Future Improvements

### Planned Features

1. **Enhanced AI Capabilities**
   - Multi-language support for chat assistant
   - Image recognition for custom cake designs
   - Voice input/output for hands-free ordering
   - Personalized product recommendations based on order history

2. **Advanced Order Management**
   - Real-time order tracking with SMS/email notifications
   - Subscription service for weekly dessert deliveries
   - Loyalty points and rewards program
   - Gift cards and promotional codes

3. **Improved User Experience**
   - Progressive Web App (PWA) with offline support
   - Dark mode theme toggle
   - Accessibility improvements (WCAG 2.1 AAA compliance)
   - Multi-currency support for international orders

4. **Business Analytics**
   - Advanced sales analytics dashboard
   - Customer behavior tracking with heatmaps
   - Inventory management automation
   - Predictive ordering based on seasonal trends

5. **Technical Enhancements**
   - GraphQL API alongside REST
   - Server-side rendering (SSR) with Next.js migration
   - Redis caching for frequently accessed data
   - Elasticsearch for advanced product search
   - WebSocket for real-time order updates
   - Microservices architecture for scalability

6. **Marketing & SEO**
   - Blog/recipe section with rich content
   - Social media integration for sharing
   - SEO optimization with meta tags and structured data
   - Email marketing automation

7. **Mobile Application**
   - React Native mobile app for iOS/Android
   - Push notifications for order updates
   - Camera integration for AR cake previews

8. **Security Enhancements**
   - Two-factor authentication (2FA)
   - Rate limiting for API endpoints
   - CAPTCHA for form submissions
   - Enhanced password policies

---

## Credits

### Development Team

- **Project Lead & Full-Stack Developer**: [Your Name]
- **Frontend Development**: React + Vite architecture, shadcn/ui integration
- **Backend Development**: Django REST Framework, AI chat integration
- **AI/ML Implementation**: ChromaDB vector search, OpenRouter integration
- **UI/UX Design**: Tailwind CSS custom theme, dessert-inspired animations

### Technologies & Libraries

- **Frontend**: React, Vite, React Router, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Django, Django REST Framework, ChromaDB, Sentence Transformers
- **Payment**: Stripe
- **AI**: OpenRouter (Mistral-7B), Hugging Face Transformers
- **Icons**: Lucide React
- **Fonts**: Google Fonts
- **Hosting**: [Your hosting provider]

### Open Source Dependencies

This project relies on numerous open-source libraries. See `package.json` and `requirements.txt` for complete lists.

### Acknowledgments

- **Django Community** for excellent documentation and ecosystem
- **Vite Team** for blazing-fast build tooling
- **shadcn** for beautiful, accessible UI components
- **OpenRouter** for LLM API gateway service
- **ChromaDB** for vector database capabilities
- **Stripe** for payment processing infrastructure

### Special Thanks

- Stack Overflow community for troubleshooting assistance
- GitHub Copilot for code suggestions and documentation help
- Sweet Dessert customers for valuable feedback

---

## License

```text
MIT License

Copyright (c) 2025 Sweet Dessert

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Contact & Support

For questions, issues, or contributions:

- **Email**: <support@sweetdessert.com>
- **GitHub Issues**: [https://github.com/your-username/sweet-dessert/issues](https://github.com/your-username/sweet-dessert/issues)
- **Documentation**: [https://docs.sweetdessert.com](https://docs.sweetdessert.com)
- **Discord Community**: [https://discord.gg/sweetdessert](https://discord.gg/sweetdessert)

---

Made with ❤️ and 🍰 by the Sweet Dessert Team

Last Updated: October 27, 2025
