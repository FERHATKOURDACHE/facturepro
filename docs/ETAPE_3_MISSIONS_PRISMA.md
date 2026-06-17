# Étape 3 — Missions / heures connectées à PostgreSQL

## Objectif

Transformer la page `/missions` en vraie feuille de temps dynamique.

## Ce qui est fait

- Création de mission en base PostgreSQL ;
- calcul automatique des heures à partir de :
  - date ;
  - heure de début ;
  - heure de fin ;
  - pause en minutes ;
- taux horaire par mission ;
- ajout possible de frais essence ;
- modification d'une mission ;
- suppression d'une mission non facturée ;
- validation / retour en brouillon ;
- import des missions de mai 2026 ;
- totaux dynamiques :
  - total heures ;
  - total prestations ;
  - total frais ;
  - total prestations + frais ;
  - total par semaine ;
  - total par lieu ;
- dashboard connecté aux missions PostgreSQL.

## Fichiers ajoutés / modifiés

- `app/missions/page.tsx`
- `app/missions/actions.ts`
- `lib/mission-calculations.ts`
- `lib/mission-queries.ts`
- `lib/dashboard-queries.ts`
- `app/dashboard/page.tsx`

## Commandes

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Test

1. Ouvrir `/missions`
2. Cliquer sur `Importer les missions de mai 2026`
3. Vérifier les totaux
4. Ajouter une nouvelle mission
5. Modifier une mission
6. Valider / remettre en brouillon
7. Ouvrir `/dashboard`

## Remarques métier

Le calcul de durée est fait en minutes :

```txt
durée = heure fin - heure début - pause
```

La valeur est convertie en heures décimales pour la facturation.

Exemple :

```txt
13:30 à 18:30 = 5h
06:30 à 12:30 = 6h
13:30 à 20:00 = 6h30 = 6,5h
```

## Prochaine étape

Étape 4 — Générer une facture depuis les missions validées :

- sélectionner période ;
- sélectionner client ;
- déduire les heures déjà payées ;
- appliquer taux spécial ;
- ajouter frais ;
- créer facture + lignes ;
- préparer export PDF / Excel.
