# Mettre le projet sur GitHub

## Déjà fait dans le projet
- Dépôt Git initialisé
- Premier commit créé (branche `main`)
- Fichiers sensibles exclus via `.gitignore` (`.env`, `node_modules`, `.next`, etc.)

## Étapes pour publier sur GitHub

### 1. Créer le dépôt sur GitHub
1. Va sur **https://github.com/new**
2. **Repository name** : par ex. `aurion-supervision` ou `supervision-serveur-maisons-alfort`
3. **Description** (optionnel) : "Application de supervision serveurs - Ville de Maisons-Alfort"
4. Choisis **Public**
5. **Ne coche pas** "Add a README" (le projet en a déjà un)
6. Clique sur **Create repository**

### 2. Lier le projet et pousser le code
Dans un terminal, à la racine du projet :

```powershell
cd "c:\Users\pcray\OneDrive\Documents\Projets Cursor\supervision serveur"

# Remplace TON-USERNAME et NOM-DU-REPO par tes valeurs GitHub
git remote add origin https://github.com/TON-USERNAME/NOM-DU-REPO.git

git push -u origin main
```

**Exemple** si ton compte GitHub est `rayan-dev` et le repo `aurion-supervision` :
```powershell
git remote add origin https://github.com/rayan-dev/aurion-supervision.git
git push -u origin main
```

### 3. Authentification GitHub
- Si GitHub te demande de te connecter : utilise ton **nom d’utilisateur** et un **Personal Access Token** (mot de passe) au lieu du mot de passe du compte.
- Créer un token : GitHub → Settings → Developer settings → Personal access tokens → Generate new token (avec au moins la permission `repo`).

---

Après le premier `git push`, ton projet sera en ligne sur GitHub.
