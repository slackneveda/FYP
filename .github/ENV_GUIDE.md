# 🔐 Environment Variables - Developer Guide

## 🎯 How It Works

### For New Developers Cloning the Repo

```text
┌─────────────────────────────────────────────────────────┐
│  1. Clone Repository                                    │
│     git clone https://github.com/slackneveda/FYP.git   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  2. Run Setup Script                                    │
│     .\setup_env.ps1                                     │
│                                                         │
│  ✓ Creates backend/.env from .env.example              │
│  ✓ Creates frontend/.env.local from .env.example       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  3. Edit Your Local .env Files                         │
│     Add your personal API keys                          │
│     (never commit these files!)                         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  4. Start Development                                   │
│     .\start_backend.ps1                                │
│     npm run dev                                         │
└─────────────────────────────────────────────────────────┘
```

## 📂 File Structure

```text
FYP/
├── .gitignore                    ← Protects ALL .env files
├── setup_env.ps1                 ← Auto-creates .env files
├── SETUP.md                      ← Full setup instructions
│
├── backend/
│   ├── .env.example             ✅ COMMITTED (template)
│   ├── .env                     ❌ IGNORED (your keys)
│   └── .gitignore               ← Ignores .env
│
└── frontend/sweet-dessert/
    ├── .env.example             ✅ COMMITTED (template)
    ├── .env.local               ❌ IGNORED (your keys)
    └── .gitignore               ← Ignores *.local
```

## 🔒 What Gets Committed vs Ignored

| File | Status | Contents |
|------|--------|----------|
| `.env.example` | ✅ Committed | Template with placeholder values |
| `.env` | ❌ Ignored | Your actual API keys (SECRET!) |
| `.env.local` | ❌ Ignored | Your actual API keys (SECRET!) |

## 🚨 Security Rules

### ✅ DO

- ✅ Use `.\setup_env.ps1` to create `.env` files
- ✅ Add your API keys to `.env` and `.env.local`
- ✅ Update `.env.example` if you add new variables
- ✅ Commit `.env.example` to help other developers

### ❌ DON'T

- ❌ Never commit `.env` or `.env.local`
- ❌ Never hardcode API keys in source code
- ❌ Never share your `.env` files publicly
- ❌ Never push actual keys to GitHub

## 🔄 Workflow for Adding New Environment Variables

### Step 1: Add to `.env.example`

```env
# backend/.env.example
NEW_API_KEY=your_new_api_key_here
```

### Step 2: Add to Your Local `.env`

```env
# backend/.env (not committed)
NEW_API_KEY=actual_secret_key_xyz123
```

### Step 3: Commit Only the Example

```powershell
git add backend/.env.example
git commit -m "Add NEW_API_KEY to environment template"
git push
```

### Step 4: Team Members Update Locally

Other developers run:

```powershell
git pull
# Then manually add NEW_API_KEY to their local .env file
```

## 🛡️ GitHub Push Protection

GitHub will **automatically block** pushes containing secrets such as:

- Stripe API keys (`sk_test_*`, `pk_test_*`)
- AWS credentials
- Database passwords
- OAuth tokens

If blocked:

1. ✅ `.gitignore` is working correctly!
2. Remove the secret from your code
3. Use environment variables instead
4. Amend your commit: `git commit --amend`
5. Force push: `git push --force`

## 🔧 Troubleshooting

### STRIPE_SECRET_KEY is not set

```powershell
# Run setup script
.\setup_env.ps1

# Edit backend/.env with actual keys
code backend/.env
```

### I accidentally committed my .env file

```powershell
# Remove from git tracking
git rm --cached backend/.env

# Commit the removal
git commit -m "Remove .env from tracking"

# Verify .gitignore is working
git check-ignore backend/.env
# Should output: backend/.gitignore:11:.env    backend/.env

# Push changes
git push
```

### Someone else added a new env variable

```powershell
# Pull latest changes
git pull

# Check .env.example for new variables
code backend/.env.example

# Add them to your local .env
code backend/.env
```

## 🎓 Best Practices

1. **Never Trust, Always Verify**

   ```powershell
   # Before committing, check what's staged
   git status
   
   # Verify .env files are ignored
   git check-ignore backend/.env frontend/sweet-dessert/.env.local
   ```

2. **Use Strong Keys**

   - Generate Django secret key: Use built-in function
   - Rotate keys regularly in production
   - Use different keys for dev/staging/prod

3. **Document Everything**

   - Update `.env.example` when adding variables
   - Add comments explaining what each key is for
   - Link to where developers can get the keys

4. **Separate Environments**

   ```text
   .env            → Development (local)
   .env.staging    → Staging server
   .env.production → Production server
   ```

## 📚 Related Documentation

- [SETUP.md](./SETUP.md) - Complete setup guide
- [ENV_SETUP.md](./ENV_SETUP.md) - Detailed environment variable reference
- [README.md](./README.md) - Project overview

---

**Remember:** Your `.env` files are for YOUR eyes only! 🔐
