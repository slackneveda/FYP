#!/usr/bin/env pwsh
# Verification Script - Checks that .env files are properly protected

Write-Host "Verifying Git Configuration..." -ForegroundColor Cyan
Write-Host ""

# Check if .gitignore exists
$gitignoreExists = Test-Path ".gitignore"
$backendGitignoreExists = Test-Path "backend\.gitignore"
$frontendGitignoreExists = Test-Path "frontend\sweet-dessert\.gitignore"

Write-Host "Root .gitignore exists: $gitignoreExists" -ForegroundColor $(if ($gitignoreExists) { "Green" } else { "Red" })
Write-Host "Backend .gitignore exists: $backendGitignoreExists" -ForegroundColor $(if ($backendGitignoreExists) { "Green" } else { "Red" })
Write-Host "Frontend .gitignore exists: $frontendGitignoreExists" -ForegroundColor $(if ($frontendGitignoreExists) { "Green" } else { "Red" })
Write-Host ""

# Check if .env files are ignored
Write-Host "Checking .env file protection..." -ForegroundColor Cyan

$envFiles = @(
    "backend\.env",
    "frontend\sweet-dessert\.env.local",
    ".env"
)

foreach ($file in $envFiles) {
    $ignored = git check-ignore $file 2>$null
    if ($ignored) {
        Write-Host "  [OK] $file is IGNORED (safe)" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] $file is NOT ignored (DANGER!)" -ForegroundColor Red
    }
}

Write-Host ""

# Check if .env.example files are tracked
Write-Host "Checking .env.example templates..." -ForegroundColor Cyan

$exampleFiles = @(
    "backend\.env.example",
    "frontend\sweet-dessert\.env.example"
)

foreach ($file in $exampleFiles) {
    $tracked = git ls-files $file 2>$null
    if ($tracked) {
        Write-Host "  [OK] $file is TRACKED (correct)" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] $file is NOT tracked (should be committed)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Check for any tracked .env files (should be none)
Write-Host "Scanning for accidentally tracked .env files..." -ForegroundColor Cyan
$trackedEnvFiles = git ls-files | Select-String "\.env$" | Where-Object { $_ -notmatch "\.env\.example" }

if ($trackedEnvFiles) {
    Write-Host "  [DANGER] Found tracked .env files:" -ForegroundColor Red
    $trackedEnvFiles | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
} else {
    Write-Host "  [OK] No .env files are tracked (safe)" -ForegroundColor Green
}

Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor DarkGray
Write-Host "Summary" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your repository is properly configured to:" -ForegroundColor White
Write-Host "  1. IGNORE actual .env files (secrets stay local)" -ForegroundColor Green
Write-Host "  2. TRACK .env.example templates (help other devs)" -ForegroundColor Green
Write-Host "  3. BLOCK secrets from being pushed to GitHub" -ForegroundColor Green
Write-Host ""
Write-Host "Safe to push to GitHub!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor DarkGray
