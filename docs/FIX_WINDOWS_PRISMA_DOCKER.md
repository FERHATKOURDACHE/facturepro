# Correctif Windows — Prisma + Docker

## Problèmes corrigés

### 1. Docker non démarré

Erreur typique :

```txt
unable to get image 'postgres:16-alpine': failed to connect to the docker API
```

Solution :

1. Ouvrir Docker Desktop.
2. Attendre que Docker indique `Engine running`.
3. Relancer :

```powershell
docker compose up -d
```

### 2. Prisma 7 installé automatiquement

Erreur typique :

```txt
The datasource property `url` is no longer supported in schema files
```

Cause :

Le projet utilisait `"latest"` dans `package.json`, donc npm a installé Prisma 7.
Le schéma actuel est écrit pour Prisma 6.

Correction appliquée :

```json
"@prisma/client": "6.19.2",
"prisma": "6.19.2"
```

### 3. Prisma Client absent

Erreur typique :

```txt
Cannot find module '.prisma/client/default'
```

Cause :

`prisma generate` a échoué avant de générer le client.

Solution complète :

```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules, .next, package-lock.json -ErrorAction SilentlyContinue

npm install
docker compose up -d
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Commande complète recommandée

```powershell
cp .env.example .env
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules, .next, package-lock.json -ErrorAction SilentlyContinue
npm install
docker compose up -d
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Vérification

Ouvrir :

```txt
http://localhost:3000/api/health
```

Résultat attendu :

```json
{
  "status": "ok",
  "database": "connected"
}
```
