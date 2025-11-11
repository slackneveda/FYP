# 🚀 Project Setup Guide

## Quick Start (First Time Setup)

### 1. Clone the Repository
```powershell
git clone https://github.com/slackneveda/FYP.git
cd FYP
```

### 2. Run Environment Setup Script
```powershell
.\setup_env.ps1
```

This will automatically create:
- `backend/.env` from `backend/.env.example`
- `frontend/sweet-dessert/.env.local` from `frontend/sweet-dessert/.env.example`

### 3. Configure Environment Variables

#### Backend (`backend/.env`)
Edit the file and add your actual keys:

```env
# Generate a new Django secret key
SECRET_KEY=your-django-secret-key-here
DEBUG=True

# Get from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here

# Get from https://openrouter.ai/keys
OPENROUTER_API_KEY=your_actual_key_here
```

**Generate Django SECRET_KEY:**
```powershell
cd backend
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### Frontend (`frontend/sweet-dessert/.env.local`)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Install Dependencies

#### Backend
```powershell
# Activate virtual environment
.\myenv\Scripts\Activate.ps1

# Install Python packages
cd backend
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Populate sample data
python manage.py populate_all_data
```

#### Frontend
```powershell
cd frontend\sweet-dessert
npm install
```

### 5. Run the Application

Use the provided scripts:

```powershell
# Backend (from root)
.\start_backend.ps1

# Frontend (in new terminal)
cd frontend\sweet-dessert
npm run dev
```

## 📁 Important Files (DO NOT COMMIT)

The following files are automatically ignored by `.gitignore`:
- ✅ `backend/.env` - Contains secret keys
- ✅ `frontend/sweet-dessert/.env.local` - Contains API keys
- ✅ `myenv/` - Virtual environment folder
- ✅ `db.sqlite3` - Local database
- ✅ `chroma_db/` - AI vector database
- ✅ `node_modules/` - Node dependencies

## 🔑 Where to Get API Keys

### Stripe Keys (Payment Processing)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up/Login
3. Navigate to **Developers → API Keys**
4. Copy:
   - **Secret key** → `STRIPE_SECRET_KEY` (backend)
   - **Publishable key** → `STRIPE_PUBLISHABLE_KEY` (backend) and `VITE_STRIPE_PUBLISHABLE_KEY` (frontend)

### OpenRouter API Key (AI Chat)
1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up/Login
3. Navigate to **Keys** section
4. Generate a new API key
5. Copy to `OPENROUTER_API_KEY` (backend)

## 🛠️ Troubleshooting

### "Module not found" errors
```powershell
# Activate virtual environment first
.\myenv\Scripts\Activate.ps1
cd backend
pip install -r requirements.txt
```

### "STRIPE_SECRET_KEY is not set"
Run `.\setup_env.ps1` and edit the `.env` files with actual keys.

### Frontend won't start
```powershell
cd frontend\sweet-dessert
npm install
npm run dev
```

## 📝 Development Workflow

1. **Always activate virtual environment** before working with backend:
   ```powershell
   .\myenv\Scripts\Activate.ps1
   ```

2. **Use provided startup scripts**:
   - `.\start_backend.ps1` - Starts Django server
   - `cd frontend\sweet-dessert && npm run dev` - Starts React app

3. **Never commit sensitive files** - They're already in `.gitignore`

## 🔄 Pulling Latest Changes

When you pull new changes from GitHub:
```powershell
git pull origin main

# Backend - check for new dependencies/migrations
.\myenv\Scripts\Activate.ps1
cd backend
pip install -r requirements.txt
python manage.py migrate

# Frontend - check for new packages
cd ..\frontend\sweet-dessert
npm install
```

Your `.env` files will remain untouched! ✅
