# Prochaines étapes techniques

## Étape 3 — Backend MVP

### Base de données
Tables à créer :

- User
- CompanyProfile
- Client
- Mission
- Invoice
- InvoiceLine
- Expense
- Payment
- Document

### API / Server Actions

- createClient
- updateClient
- createMission
- updateMission
- createInvoiceFromMissions
- generateInvoicePdf
- generateTimesheetPdf
- markInvoiceAsSent
- markInvoiceAsPaid

### Documents PDF

- Facture officielle
- Feuille de temps
- Récapitulatif par semaine
- Récapitulatif par lieu
- Export ZIP

## Priorité

Commencer par Prisma + PostgreSQL, puis brancher la page Clients.
