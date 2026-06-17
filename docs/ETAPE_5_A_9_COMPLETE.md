# Étapes 5 à 9 - Version complète

## Étape 5 - Exports PDF
Ajout des routes :
- `/api/invoices/[id]/pdf`

Le PDF inclut :
- facture ;
- émetteur ;
- destinataire ;
- lignes ;
- totaux ;
- feuille de temps rattachée ;
- IBAN ;
- mention légale.

## Étape 6 - Exports Excel
Ajout des routes :
- `/api/invoices/[id]/excel`

Le fichier Excel inclut :
- onglet Facture ;
- onglet Feuille de temps ;
- onglet Paiements.

## Étape 7 - Estimation URSSAF
Ajout de `/urssaf`.

La page calcule :
- CA de la période ;
- cotisations estimées ;
- CFP optionnelle ;
- net estimé avant impôt sur le revenu.

## Étape 8 - Assistant IA
Ajout de `/ai` et de l'API :
- `/api/ai/extract-timesheet`

L'IA extrait les heures depuis un texte libre.

## Étape 9 - Production
Ajout de la documentation de déploiement :
- `docs/DEPLOIEMENT_PRODUCTION.md`
- `docs/FONCTIONNALITES_FINALES.md`

## Prochaine vraie étape produit
Pour lancer publiquement :
1. ajouter authentification complète ;
2. brancher un stockage externe pour les documents ;
3. ajouter les emails ;
4. ajouter les abonnements SaaS ;
5. vérifier juridiquement les modèles.
