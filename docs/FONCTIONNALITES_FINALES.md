# FacturePro V1 complète - Fonctionnalités

## Gestion
- Multi-organisation dans le modèle de données.
- Clients.
- Missions et horaires.
- Frais.
- Factures.
- Paiements.
- Dashboard.
- Estimation URSSAF.

## Automatisation
- Calcul automatique des heures.
- Groupement par taux horaire.
- Déduction des heures déjà payées.
- Ajout automatique des frais.
- Numérotation des factures.
- Statuts de facture.
- Libération des missions si facture annulée.

## Exports
- PDF facture + feuille de temps.
- Excel avec 3 feuilles :
  - Facture
  - Feuille de temps
  - Paiements

## IA
- Extraction d'heures depuis un texte libre.
- Mode OpenAI si `OPENAI_API_KEY` est configurée.
- Fallback local si la clé API n'est pas configurée.
- Résultat JSON exploitable pour importer ensuite les missions.
