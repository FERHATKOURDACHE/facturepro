# Modèle de données FacturePro

## Organisation SaaS

Un utilisateur peut appartenir à plusieurs organisations.
Une organisation contient ses clients, missions, factures et documents.

## Chaîne métier

Client → Mission → Facture → Paiement → Export PDF / Excel → Déclaration prévisionnelle URSSAF

## IA

La table `AiGeneration` permet de garder la trace des actions IA :

- extraction d'heures depuis un texte ;
- brouillon de facture ;
- classification de frais ;
- génération de mail ;
- explication URSSAF ;
- relecture de document.

## URSSAF

Les taux sont stockés dans le profil entreprise et dans les déclarations générées.
L'objectif est de permettre une estimation rapide, tout en gardant la possibilité de mettre à jour les taux sans casser les anciennes factures.
