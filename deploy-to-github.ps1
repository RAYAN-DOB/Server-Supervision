# Script de déploiement automatique vers GitHub
# Dépôt: RAYAN-DOB/server-Supervision

Write-Host "🚀 Démarrage du déploiement vers GitHub..." -ForegroundColor Cyan

# Trouver Git
$gitPath = $null
$possiblePaths = @(
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe",
    "C:\Users\$env:USERNAME\AppData\Local\Programs\Git\cmd\git.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $gitPath = $path
        Write-Host "✅ Git trouvé: $gitPath" -ForegroundColor Green
        break
    }
}

if (-not $gitPath) {
    Write-Host "❌ Git n'est pas trouvé. Veuillez installer Git depuis https://git-scm.com/" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Voici les fichiers modifiés à mettre à jour manuellement sur GitHub:" -ForegroundColor Yellow
    Write-Host "   1. middleware.ts"
    Write-Host "   2. app/globals.css"
    Write-Host "   3. CORRECTIONS_EFFECTUEES.md (nouveau)"
    Write-Host ""
    Write-Host "Vous pouvez les mettre à jour via l'interface web de GitHub." -ForegroundColor Yellow
    exit 1
}

# Vérifier si c'est un dépôt Git
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initialisation du dépôt Git..." -ForegroundColor Yellow
    & $gitPath init
}

# Configurer Git (si pas déjà fait)
Write-Host "⚙️  Configuration de Git..." -ForegroundColor Yellow
& $gitPath config user.name "RAYAN-DOB" 2>$null
& $gitPath config user.email "rayan@maisons-alfort.local" 2>$null

# Vérifier/Ajouter le remote
Write-Host "🔗 Configuration du remote GitHub..." -ForegroundColor Yellow
$remoteExists = & $gitPath remote get-url origin 2>$null
if (-not $remoteExists) {
    & $gitPath remote add origin https://github.com/RAYAN-DOB/server-Supervision.git
    Write-Host "✅ Remote ajouté" -ForegroundColor Green
} else {
    & $gitPath remote set-url origin https://github.com/RAYAN-DOB/server-Supervision.git
    Write-Host "✅ Remote mis à jour" -ForegroundColor Green
}

# Ajouter tous les fichiers
Write-Host "📝 Ajout des fichiers modifiés..." -ForegroundColor Yellow
& $gitPath add .

# Créer le commit
Write-Host "💾 Création du commit..." -ForegroundColor Yellow
$commitMessage = @"
🔧 Corrections: Bugs corrigés et améliorations

✅ Corrections effectuées:
- Middleware: Correction de la redirection de la page d'accueil
- CSS: Ajout des classes manquantes (glass-card, card-glow)
- Documentation: Ajout de CORRECTIONS_EFFECTUEES.md

📋 Composants vérifiés:
- Tous les composants UI présents et fonctionnels
- Toutes les pages testées et opérationnelles
- Configuration TypeScript, Tailwind et Next.js validée

🎉 Application prête à être lancée sans erreurs!
"@

& $gitPath commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit créé avec succès!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Aucun changement à committer (peut-être déjà fait)" -ForegroundColor Yellow
}

# Pousser vers GitHub
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Yellow
Write-Host "⚠️  Vous devrez peut-être entrer vos identifiants GitHub" -ForegroundColor Yellow

# Essayer main puis master
& $gitPath push -u origin main 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tentative avec la branche master..." -ForegroundColor Yellow
    & $gitPath push -u origin master
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 ================================" -ForegroundColor Green
    Write-Host "🎉  DÉPLOIEMENT RÉUSSI!" -ForegroundColor Green
    Write-Host "🎉 ================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Vos modifications sont maintenant sur GitHub!" -ForegroundColor Green
    Write-Host "🔗 Dépôt: https://github.com/RAYAN-DOB/server-Supervision" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "⚠️  Le push a échoué. Raisons possibles:" -ForegroundColor Yellow
    Write-Host "   1. Authentification requise (utilisez un token GitHub)" -ForegroundColor Yellow
    Write-Host "   2. Le dépôt distant a des changements" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Solution: Utilisez GitHub Desktop ou l'interface web" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
