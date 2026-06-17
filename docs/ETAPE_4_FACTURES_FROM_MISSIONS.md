# Étape 4 — Générer une facture depuis les missions validées

## Objectif

Créer une vraie facture en base PostgreSQL à partir des missions validées.

## Ce qui est fait

- Page `/factures` connectée à PostgreSQL ;
- génération de facture depuis les missions validées non facturées ;
- filtrage par client et période ;
- numérotation automatique `FAC-YYYY-XXX` ;
- regroupement des prestations par taux horaire ;
- ajout automatique des frais liés aux missions ;
- déduction d'heures déjà payées ;
- création des lignes de facture ;
- rattachement des missions à la facture ;
- statut des missions passé à `INVOICED` ;
- annulation d'une facture non payée avec libération des missions ;
- changement de statut : envoyée, en retard ;
- enregistrement d'un paiement ;
- audit log de création.

## Exemple métier mai 2026

Avec les missions de mai importées à l'étape 3 :

- total missions : 143h30 ;
- déduction : 65h déjà payées ;
- taux standard : 13 €/h ;
- 27 mai : 6h à 16 €/h ;
- frais essence Étampes : 50 € ;
- total attendu : 1 088,50 €.

## Utilisation

1. Ouvrir `/missions`
2. Importer les missions de mai 2026
3. Vérifier que les missions sont validées
4. Ouvrir `/factures`
5. Sélectionner le client
6. Choisir la période `01/05/2026` au `31/05/2026`
7. Garder la déduction à `65h` au taux `13`
8. Cliquer sur `Générer la facture`

## Fichiers ajoutés / modifiés

- `app/factures/page.tsx`
- `app/factures/actions.ts`
- `lib/invoice-queries.ts`
- `lib/invoice-calculations.ts`
- `lib/invoice-number.ts`

## Limites volontaires

Cette étape crée la facture en base, mais ne génère pas encore les fichiers PDF ou Excel.

Prochaine étape : Étape 5 — génération des exports PDF et Excel.
