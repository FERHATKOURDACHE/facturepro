# Étape 2 — Page Clients connectée à PostgreSQL

## Objectif

Brancher la page `/clients` sur la base PostgreSQL avec Prisma.

## Ce qui est fait

- Lecture réelle des clients depuis PostgreSQL ;
- création d'un client via Server Action ;
- modification d'un client via Server Action ;
- suppression sécurisée si aucun document lié ;
- statistiques clients / missions / factures ;
- route de contrôle `/api/health` pour vérifier la connexion DB.

## Fichiers ajoutés / modifiés

- `lib/current-organization.ts`
- `lib/client-queries.ts`
- `app/clients/actions.ts`
- `app/clients/page.tsx`
- `app/api/health/route.ts`

## Lancer

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Vérifier la base

Ouvrir :

```bash
http://localhost:3000/api/health
```

Résultat attendu :

```json
{
  "status": "ok",
  "database": "connected"
}
```

## Tester

1. Ouvrir `/clients`
2. Ajouter un client
3. Modifier le client
4. Vérifier dans Prisma Studio

```bash
npm run db:studio
```

## Limite volontaire

Il n'y a pas encore d'authentification.
La fonction `getCurrentOrganization()` utilise l'organisation de démonstration `ferhat-kourdache`.

Prochaine étape : brancher les missions et créer les vraies lignes de travail depuis PostgreSQL.
