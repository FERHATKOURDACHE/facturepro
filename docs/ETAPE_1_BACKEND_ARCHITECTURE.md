# Étape 1 — Architecture SaaS + base de données

## Objectif

Transformer FacturePro d'un site statique en vraie application professionnelle multi-utilisateurs.

Cette étape ajoute :

- PostgreSQL via Docker ;
- Prisma ORM ;
- modèle SaaS multi-organisation ;
- clients ;
- missions / heures ;
- frais ;
- factures ;
- lignes de facture ;
- paiements ;
- exports PDF / Excel ;
- estimation URSSAF ;
- historique IA ;
- audit log.

## Commandes

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run db:studio
```

Adminer :

```bash
http://localhost:8080
```

Prisma Studio :

```bash
http://localhost:5555
```

## Connexion Adminer

- Système : PostgreSQL
- Serveur : postgres
- Utilisateur : facturepro
- Mot de passe : facturepro_password
- Base : facturepro

## Ce qui est volontairement laissé pour l'étape suivante

Les pages Next.js ne sont pas encore branchées en lecture/écriture directe sur Prisma.

Prochaine étape recommandée : brancher `/clients` avec de vraies Server Actions pour créer, modifier et lister les clients depuis PostgreSQL.
