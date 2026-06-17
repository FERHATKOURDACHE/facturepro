# FacturePro MVP V2

Version 2 du site FacturePro : landing page + pages internes d'application.

## Pages incluses

- `/` : site vitrine premium
- `/dashboard` : vue d'ensemble
- `/clients` : gestion clients
- `/missions` : saisie et récapitulatif des heures
- `/factures` : préparation facture + aperçu
- `/parametres` : profil émetteur, IBAN, taux et mentions

## Installation

```bash
npm install
npm run dev
```

Puis ouvrir :

```bash
http://localhost:3000
```

## Ce qui est déjà fait

- Design SaaS premium
- Structure Next.js App Router
- Données de démonstration réelles pour mai 2026
- Calculs de base :
  - 143h30 totales
  - 65h déjà payées
  - 78h30 à facturer
  - 27 mai à 16 €/h
  - 50 € carburant
  - total à payer 1 088,50 €
- Pages prêtes à brancher avec une base de données

## Prochaine étape

Transformer les formulaires statiques en vraie application :

1. Ajouter Prisma + PostgreSQL
2. Créer le schéma database
3. Sauvegarder clients / missions / factures
4. Ajouter génération PDF côté serveur
5. Ajouter export et suivi de paiement

## Correction hydration mismatch

Cette version ajoute une protection dans `app/layout.tsx` contre certains attributs injectés par des extensions navigateur, notamment les `id` commençant par `cd_`.

Si l'erreur persiste :
1. ouvrir le site en navigation privée ;
2. désactiver les extensions Chrome une par une ;
3. supprimer le dossier `.next` ;
4. relancer `npm run dev`.

---

# Étape 1 ajoutée — Backend architecture

Cette version ajoute la fondation technique pour transformer le site en application SaaS :

- PostgreSQL avec Docker ;
- Prisma ORM ;
- schéma complet pour utilisateurs, organisations, clients, missions, factures, paiements, exports, URSSAF et IA ;
- seed de démonstration avec les données Ferhat Kourdache / Talent Pro Solution ;
- module d'estimation URSSAF configurable.

## Lancer la base

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run db:studio
```

## Après cette étape

Passer à l'étape 2 : connecter la page Clients à la base PostgreSQL avec Prisma.

---

# Étape 2 ajoutée — Clients connectés à PostgreSQL

La page `/clients` n'est plus statique.

Elle permet maintenant :

- d'afficher les clients depuis PostgreSQL ;
- d'ajouter un client ;
- de modifier un client ;
- de supprimer un client non lié à une facture ou mission ;
- de vérifier la connexion DB via `/api/health`.

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

Puis ouvrir :

```bash
http://localhost:3000/clients
```

---

# Étape 3 ajoutée — Missions et heures connectées à PostgreSQL

La page `/missions` est maintenant dynamique.

Elle permet :

- d'ajouter des missions ;
- de calculer automatiquement les heures ;
- d'ajouter des frais essence ;
- de modifier les missions ;
- de valider / remettre en brouillon ;
- de supprimer les missions non facturées ;
- d'importer les missions de mai 2026 ;
- de calculer les totaux par semaine et par lieu.

Le dashboard lit aussi les données depuis PostgreSQL.

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

Puis ouvrir :

```bash
http://localhost:3000/missions
```

---

# Étape 4 ajoutée — Factures générées depuis les missions

La page `/factures` permet maintenant de créer une vraie facture depuis les missions validées.

## Fonctionnement

1. Les missions doivent être `VALIDATED`.
2. La facture récupère uniquement les missions non facturées.
3. Les prestations sont groupées par taux horaire.
4. Les frais sont ajoutés automatiquement.
5. Les heures déjà payées peuvent être déduites.
6. Les missions sont rattachées à la facture et passent en statut `INVOICED`.

## Tester

```bash
npm run dev
```

Puis :

```bash
http://localhost:3000/missions
```

Importer les missions de mai, puis :

```bash
http://localhost:3000/factures
```

Générer la facture.

---

# Version V1 complète ajoutée - IA + PDF + Excel + URSSAF

Cette version finalise les grandes briques produit :

- génération PDF depuis une facture ;
- génération Excel depuis une facture ;
- estimation URSSAF ;
- assistant IA pour extraire des heures depuis un texte ;
- documentation de déploiement production.

## Pages ajoutées

```bash
/ai
/urssaf
```

## Routes ajoutées

```bash
/api/invoices/[id]/pdf
/api/invoices/[id]/excel
/api/ai/extract-timesheet
```

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

## Test complet

1. Aller sur `/clients`
2. Vérifier le client Talent Pro
3. Aller sur `/missions`
4. Importer les missions de mai 2026
5. Aller sur `/factures`
6. Générer la facture
7. Télécharger le PDF
8. Télécharger l'Excel
9. Aller sur `/urssaf`
10. Tester `/ai`

## IA

Sans clé `OPENAI_API_KEY`, l'application utilise une extraction locale simplifiée.
Avec clé API, elle utilise l'API OpenAI.

---

# Hotfix Windows / Prisma

Cette version corrige les erreurs constatées sous Windows :

- Docker Desktop non démarré ;
- Prisma 7 installé automatiquement via `"latest"` ;
- client Prisma non généré ;
- seed plus robuste ;
- `allowedDevOrigins` ajouté pour l'IP de dev observée.

Voir :

```txt
docs/FIX_WINDOWS_PRISMA_DOCKER.md
```

---

# Hotfix 2 — Layout Next.js + DB Push

Cette version supprime le composant `<Script>` du layout pour éviter le warning Next.js/Turbopack :

```txt
Encountered a script tag while rendering React component
```

Elle ajoute aussi un script Windows :

```powershell
.\scripts\setup-windows.ps1
```

Ce script recrée `.env`, force PostgreSQL sur le port `5433`, lance Docker, puis exécute :

```powershell
npm run db:generate
npm run db:push
npm run db:seed
```

---

# Hotfix 3 — Export PDF stabilisé

Cette version remplace `pdfkit` par `pdf-lib` pour corriger l'erreur Windows/Turbopack :

```txt
ENOENT: no such file or directory, open 'C:\ROOT\node_modules\pdfkit\js\data\Helvetica.afm'
```

Route conservée :

```txt
/api/invoices/[id]/pdf
```
