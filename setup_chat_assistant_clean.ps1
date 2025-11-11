# cSpell:ignore venv myenv OPENROUTER LASTEXITCODE runserver
# Sweet Dessert AI Chat Assistant - Quick Start Script
# This script helps you set up the AI chat assistant

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Sweet Dessert AI Chat Assistant - Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
$venvPath = "D:\UNI\FYP\PROJECT\myenv\Scripts\Activate.ps1"
if (-not (Test-Path $venvPath)) {
    Write-Host "Error: Virtual environment not found at: $venvPath" -ForegroundColor Red
    Write-Host "Please create a virtual environment first." -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Virtual environment found" -ForegroundColor Green

# Check if we're in the correct directory
$projectRoot = "D:\UNI\FYP\PROJECT"
if (-not (Test-Path $projectRoot)) {
    Write-Host "Error: Project root not found: $projectRoot" -ForegroundColor Red
    exit 1
}

Set-Location $projectRoot
Write-Host "[OK] Project root verified" -ForegroundColor Green

# Activate virtual environment
Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& $venvPath
Write-Host "[OK] Virtual environment activated" -ForegroundColor Green

# Check for .env file
$envFile = Join-Path $projectRoot "backend\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env file not found at: $envFile" -ForegroundColor Red
    Write-Host "Please create .env file with required variables." -ForegroundColor Yellow
    Write-Host "Expected location: D:\UNI\FYP\PROJECT\backend\.env" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Environment file found" -ForegroundColor Green

# Check for OPENROUTER_API_KEY
$envContent = Get-Content $envFile -Raw
if ($envContent -notmatch "OPENROUTER_API_KEY=sk-or-v1-") {
    Write-Host "Warning: OPENROUTER_API_KEY might not be set correctly" -ForegroundColor Yellow
    Write-Host "         Make sure you have added your OpenRouter API key to .env" -ForegroundColor Yellow
} else {
    Write-Host "[OK] OpenRouter API key configured" -ForegroundColor Green
}

# Check for PDF training data
$pdfFile = "$projectRoot\sweet_dessert_updated_descriptions_training_data.pdf"
if (-not (Test-Path $pdfFile)) {
    Write-Host "Error: PDF training data not found at: $pdfFile" -ForegroundColor Red
    Write-Host "Please ensure the PDF file exists in the project root." -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] PDF training data found" -ForegroundColor Green

# Install Python dependencies
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Installing Python Dependencies" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This may take a few minutes, especially for PyTorch..." -ForegroundColor Yellow
Write-Host ""

Set-Location "$projectRoot\backend"

Write-Host "Running: pip install -r requirements.txt" -ForegroundColor Gray
$installOutput = pip install -r requirements.txt 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Python dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "Error installing Python dependencies" -ForegroundColor Red
    Write-Host $installOutput -ForegroundColor Red
    exit 1
}

# Run migrations
Write-Host ""
Write-Host "Running database migrations..." -ForegroundColor Yellow

$migrateOutput = python manage.py migrate --no-input 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Database migrations completed" -ForegroundColor Green
} else {
    Write-Host "Error running migrations" -ForegroundColor Red
    Write-Host $migrateOutput -ForegroundColor Red
    exit 1
}

# Display next steps
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start the backend server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   python manage.py runserver" -ForegroundColor Gray
Write-Host ""
Write-Host "   OR use the provided script:" -ForegroundColor White
Write-Host "   .\start_backend.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "2. In a new terminal, start the frontend:" -ForegroundColor White
Write-Host "   cd frontend\sweet-dessert" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open browser to: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "4. Navigate to 'Chat Assistant' page and test!" -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Test Queries:" -ForegroundColor Yellow
Write-Host "  - What chocolate cakes do you have?" -ForegroundColor Gray
Write-Host "  - Tell me about your brownies" -ForegroundColor Gray
Write-Host "  - I want to order a red velvet cake" -ForegroundColor Gray
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed documentation, see: CHAT_AI_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to start backend now
$startNow = Read-Host "Do you want to start the backend server now? (y/n)"

if ($startNow -eq 'y' -or $startNow -eq 'Y') {
    Write-Host ""
    Write-Host "Starting backend server..." -ForegroundColor Green
    Write-Host "Watch for ChromaDB initialization messages..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server when done testing." -ForegroundColor Yellow
    Write-Host ""
    python manage.py runserver
} else {
    Write-Host ""
    Write-Host "Setup complete! Start the server when ready." -ForegroundColor Green
    Write-Host ""
}
