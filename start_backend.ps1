# Setup and run Django backend for Sweet Dessert app

# Navigate to backend directory
Set-Location "D:\UNI\FYP\PROJECT\backend"

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Green
& "D:\UNI\FYP\PROJECT\myenv\Scripts\Activate.ps1"

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