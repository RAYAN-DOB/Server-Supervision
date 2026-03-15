# Script de déploiement GitHub - Version simplifiée
Write-Host "Deploiement vers GitHub..." -ForegroundColor Cyan

# Chemins possibles pour Git
$gitPaths = @(
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
)

$git = $null
foreach ($path in $gitPaths) {
    if (Test-Path $path) {
        $git = $path
        Write-Host "Git trouve: $path" -ForegroundColor Green
        break
    }
}

if (-not $git) {
    Write-Host "Git non trouve. Installation requise." -ForegroundColor Red
    Write-Host "Telechargez Git: https://git-scm.com/" -ForegroundColor Yellow
    pause
    exit
}

# Init si nécessaire
if (-not (Test-Path ".git")) {
    Write-Host "Initialisation du depot..." -ForegroundColor Yellow
    & $git init
}

# Config
& $git config user.name "RAYAN-DOB"
& $git config user.email "rayan@local"

# Remote
$hasRemote = & $git remote 2>$null
if (-not $hasRemote) {
    & $git remote add origin https://github.com/RAYAN-DOB/server-Supervision.git
} else {
    & $git remote set-url origin https://github.com/RAYAN-DOB/server-Supervision.git
}

# Add & Commit
Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
& $git add .

Write-Host "Creation du commit..." -ForegroundColor Yellow
& $git commit -m "Corrections: bugs corriges et ameliorations"

# Push
Write-Host "Push vers GitHub..." -ForegroundColor Yellow
& $git push -u origin main
if ($LASTEXITCODE -ne 0) {
    & $git push -u origin master
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCES! Modifications poussees vers GitHub!" -ForegroundColor Green
} else {
    Write-Host "Erreur lors du push. Utilisez GitHub Desktop." -ForegroundColor Yellow
}

pause
