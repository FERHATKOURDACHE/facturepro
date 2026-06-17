# Hotfix 3 — PDF sans PDFKit

## Problème

Sous Next.js 16/Turbopack sur Windows, PDFKit peut chercher ses fichiers internes ici :

```txt
C:\ROOT\node_modules\pdfkit\js\data\Helvetica.afm
```

Puis échouer avec :

```txt
ENOENT: no such file or directory, open '...Helvetica.afm'
```

## Correction

Cette version remplace `pdfkit` par `pdf-lib`.

Avantages :

- pas de fichier `.afm` externe ;
- génération PDF compatible route handler Next.js ;
- fonctionnement plus stable sous Windows/Turbopack ;
- conservation de l'export Excel.

## Commandes après mise à jour

```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules, .next, package-lock.json -ErrorAction SilentlyContinue
npm install
npm run db:generate
npm run dev
```
