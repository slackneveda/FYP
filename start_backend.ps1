# Setup and run Django backend for Sweet Dessert app

# Get the script's directory (project root)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir "backend"
$VenvDir = Join-Path $ScriptDir "myenv"

# Navigate to backend directory
Write-Host "Navigating to backend directory: $BackendDir" -ForegroundColor Cyan
Set-Location $BackendDir

# Check if virtual environment exists, create if not
if (-Not (Test-Path $VenvDir)) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv $VenvDir
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Green
$ActivateScript = Join-Path $VenvDir "Scripts\Activate.ps1"
if (Test-Path $ActivateScript) {
    & $ActivateScript
} else {
    Write-Host "Warning: Virtual environment activation script not found at $ActivateScript" -ForegroundColor Yellow
    Write-Host "Continuing without virtual environment..." -ForegroundColor Yellow
}

# Install required packages
Write-Host "Installing required packages..." -ForegroundColor Green
pip install -r requirements.txt

# Run database migrations
Write-Host "Running database migrations..." -ForegroundColor Green
python manage.py makemigrations sweetapp
python manage.py migrate

# Create superuser (optional)
Write-Host "To create a superuser for Django admin, run: python manage.py createsuperuser" -ForegroundColor Yellow

# Start Django development server
Write-Host "Starting Django development server on http://localhost:8000..." -ForegroundColor Green
python manage.py runserver