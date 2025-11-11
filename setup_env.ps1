#!/usr/bin/env pwsh
# Setup Environment Variables Script
# This script creates .env files from .env.example templates if they don't exist

Write-Host "🔧 Setting up environment variables..." -ForegroundColor Cyan
Write-Host ""

# Backend .env setup
$backendEnvExample = "backend\.env.example"
$backendEnv = "backend\.env"

if (Test-Path $backendEnv) {
    Write-Host "✓ Backend .env already exists" -ForegroundColor Green
} elseif (Test-Path $backendEnvExample) {
    Copy-Item $backendEnvExample $backendEnv
    Write-Host "✓ Created backend/.env from template" -ForegroundColor Green
    Write-Host "  ⚠️  Please edit backend/.env and add your actual keys" -ForegroundColor Yellow
} else {
    Write-Host "✗ backend/.env.example not found!" -ForegroundColor Red
}

Write-Host ""

# Frontend .env setup
$frontendEnvExample = "frontend\sweet-dessert\.env.example"
$frontendEnvLocal = "frontend\sweet-dessert\.env.local"

if (Test-Path $frontendEnvLocal) {
    Write-Host "✓ Frontend .env.local already exists" -ForegroundColor Green
} elseif (Test-Path $frontendEnvExample) {
    Copy-Item $frontendEnvExample $frontendEnvLocal
    Write-Host "✓ Created frontend/sweet-dessert/.env.local from template" -ForegroundColor Green
    Write-Host "  ⚠️  Please edit frontend/sweet-dessert/.env.local and add your actual keys" -ForegroundColor Yellow
} else {
    Write-Host "✗ frontend/sweet-dessert/.env.example not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Backend: Edit backend/.env with your actual keys" -ForegroundColor White
Write-Host "   - Django SECRET_KEY (generate one)" -ForegroundColor Gray
Write-Host "   - Stripe keys from https://dashboard.stripe.com/test/apikeys" -ForegroundColor Gray
Write-Host "   - OpenRouter API key from https://openrouter.ai/keys" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Frontend: Edit frontend/sweet-dessert/.env.local" -ForegroundColor White
Write-Host "   - VITE_STRIPE_PUBLISHABLE_KEY (same as backend)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Generate Django SECRET_KEY (run in backend folder):" -ForegroundColor White
Write-Host "   python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'" -ForegroundColor DarkYellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "✅ Setup complete! Don't forget to fill in your keys." -ForegroundColor Green
