# Environment Variables Setup

## Backend (.env)
Create a `.env` file in the `backend/` directory with the following variables:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True

# Stripe Payment Keys
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# OpenRouter AI API
OPENROUTER_API_KEY=your-openrouter-api-key

# Database (optional, defaults to SQLite)
# DATABASE_URL=your-database-url
```

## Frontend (.env.local)
Create a `.env.local` file in the `frontend/sweet-dessert/` directory:

```env
# Stripe Public Key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# API Base URL (optional, defaults to http://localhost:8000)
VITE_API_BASE_URL=http://localhost:8000
```

## Important Notes
- **Never commit** `.env` or `.env.local` files to version control
- These files are already included in `.gitignore`
- Share the template above with team members, not the actual keys
- For production, use environment variables or secrets management services
