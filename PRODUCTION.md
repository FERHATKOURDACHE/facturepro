# FacturePro — Documentation Production

## Version stable actuelle

Version : v1.1.1

## Site en ligne

https://facturepro-6hnv.vercel.app/

## Services utilisés

- Frontend / Backend Next.js : Vercel
- Base de données PostgreSQL : Neon
- ORM : Prisma
- Exports : PDF et Excel
- IA : OpenAI optionnel + fallback local

## Variables d'environnement Vercel obligatoires

DATABASE_URL
NEXT_PUBLIC_APP_URL
OPENAI_API_KEY
OPENAI_MODEL

Important :
- DATABASE_URL doit être la connection string Neon.
- OPENAI_API_KEY peut rester vide ou être remplacée par une vraie clé OpenAI.
- Si OPENAI_API_KEY vaut none, l'application utilise l'extraction locale.

## Commandes locales utiles

Installer les dépendances :

npm install

Générer Prisma :

npm run db:generate

Pousser le schéma Prisma :

npm run db:push

Remplir la base avec les données de départ :

npm run db:seed

Lancer en local :

npm run dev

Compiler le projet :

npm run build

## Branches Git

main : version stable déployée
dev-v1.1 : branche de développement

## Tags importants

v1.0.0 : première V1 stable locale
v1.1.0 : amélioration IA locale
v1.1.1 : version déployée Vercel + Neon stable

## Fonctionnalités validées

- Dashboard
- Clients
- Missions
- Factures
- Export PDF
- Export Excel
- Estimation URSSAF
- Assistant IA local
- Paramètres entreprise
- Déploiement Vercel
- Base Neon

## Procédure de redéploiement

1. Modifier le code localement
2. Tester avec npm run build
3. Commit Git
4. Push sur main
5. Vercel redéploie automatiquement

## Procédure de sécurité

Ne jamais pousser :
- .env
- .env.local
- .env.local.backup
- node_modules
- .next

