# Déploiement production - FacturePro

## Architecture recommandée

- Frontend / backend Next.js : Vercel
- Base PostgreSQL : Neon, Supabase, Railway ou Render
- Stockage documents : S3 compatible ou Supabase Storage
- Emails transactionnels : Resend, Brevo ou Postmark
- Monitoring : Sentry
- Analytics : Plausible ou PostHog

## Variables d'environnement

```bash
DATABASE_URL=""
NEXT_PUBLIC_APP_URL=""
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.5-mini"
PDF_BRAND_NAME="FacturePro"
```

## Étapes Vercel

1. Pousser le projet sur GitHub.
2. Importer le repository dans Vercel.
3. Ajouter les variables d'environnement.
4. Créer la base PostgreSQL externe.
5. Lancer les migrations.

```bash
npm install
npm run db:generate
npm run db:migrate
npm run build
```

## Points à finaliser avant vrai lancement public

- Authentification réelle.
- Rôles et permissions.
- Conditions générales.
- Politique de confidentialité.
- Sauvegardes base de données.
- Journal d'audit conservé.
- Stockage externe des PDF / Excel.
- Vérification juridique des mentions obligatoires.
- Tests de charge.
- Tests de sécurité.
