# Hotfix 2 — Layout Next.js + base PostgreSQL

## Corrections

1. Suppression du composant `<Script>` dans `app/layout.tsx`.
   - Next.js/Turbopack affichait : `Encountered a script tag while rendering React component`.
   - Le script servait seulement à nettoyer des attributs injectés par certaines extensions Chrome.
   - Il est supprimé pour stabiliser le rendu.

2. Rappel obligatoire : après création/modification du `.env`, il faut pousser le schéma Prisma.

```powershell
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Erreur corrigée

```txt
The table `public.Organization` does not exist in the current database.
```

Cause : PostgreSQL tourne, mais les tables n'ont pas encore été créées.

Solution : `npm run db:push`.
