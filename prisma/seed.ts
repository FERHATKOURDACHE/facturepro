import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "kourdacheferhat1@gmail.com" },
    update: {
      name: "Ferhat KOURDACHE",
    },
    create: {
      email: "kourdacheferhat1@gmail.com",
      name: "Ferhat KOURDACHE",
    },
  });

  const organization = await prisma.organization.upsert({
    where: { slug: "ferhat-kourdache" },
    update: {
      name: "Ferhat KOURDACHE",
      country: "FR",
      currency: "EUR",
    },
    create: {
      name: "Ferhat KOURDACHE",
      slug: "ferhat-kourdache",
      country: "FR",
      currency: "EUR",
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: organization.id,
      },
    },
    update: {
      role: "OWNER",
    },
    create: {
      userId: user.id,
      organizationId: organization.id,
      role: "OWNER",
    },
  });

  const existingProfiles = await prisma.companyProfile.findMany({
    where: { organizationId: organization.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  const profile = existingProfiles[0]
    ? await prisma.companyProfile.update({
        where: { id: existingProfiles[0].id },
        data: {
          legalName: "Ferhat KOURDACHE",
          addressLine1: "34 Rue Victor Basch",
          postalCode: "91300",
          city: "Massy",
          country: "FR",
          siren: "982123101",
          siret: "982 123 101 00015",
          ape: "7820Z",
          email: "kourdacheferhat1@gmail.com",
          phone: "06 25 65 97 53",
          iban: "FR76 3000 4027 5100 0008 0342 980",
          vatRegime: "FRANCHISE_BASE",
          invoiceLegalNotice: "TVA non applicable - article 293 B du CGI",
          defaultHourlyRate: new Prisma.Decimal("13.00"),
          urssafActivity: "SERVICE_BNC",
          urssafRate: new Prisma.Decimal("0.2560"),
          isDefault: true,
        },
      })
    : await prisma.companyProfile.create({
        data: {
          organizationId: organization.id,
          legalName: "Ferhat KOURDACHE",
          addressLine1: "34 Rue Victor Basch",
          postalCode: "91300",
          city: "Massy",
          country: "FR",
          siren: "982123101",
          siret: "982 123 101 00015",
          ape: "7820Z",
          email: "kourdacheferhat1@gmail.com",
          phone: "06 25 65 97 53",
          iban: "FR76 3000 4027 5100 0008 0342 980",
          vatRegime: "FRANCHISE_BASE",
          invoiceLegalNotice: "TVA non applicable - article 293 B du CGI",
          defaultHourlyRate: new Prisma.Decimal("13.00"),
          urssafActivity: "SERVICE_BNC",
          urssafRate: new Prisma.Decimal("0.2560"),
          isDefault: true,
        },
      });

  const existingClient = await prisma.client.findFirst({
    where: {
      organizationId: organization.id,
      siret: "928 425 933 00019",
    },
  });

  const client = existingClient
    ? await prisma.client.update({
        where: { id: existingClient.id },
        data: {
          legalName: "TALENT PRO SOLUTION intérim",
          addressLine1: "11 Rue Tronchet",
          postalCode: "75008",
          city: "Paris-8e-Arrondissement",
          country: "FR",
          siret: "928 425 933 00019",
          ape: "7820Z",
          email: "recap.talents@gmail.com",
          paymentTermsDays: 30,
        },
      })
    : await prisma.client.create({
        data: {
          organizationId: organization.id,
          legalName: "TALENT PRO SOLUTION intérim",
          addressLine1: "11 Rue Tronchet",
          postalCode: "75008",
          city: "Paris-8e-Arrondissement",
          country: "FR",
          siret: "928 425 933 00019",
          ape: "7820Z",
          email: "recap.talents@gmail.com",
          paymentTermsDays: 30,
        },
      });

  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      organizationId: organization.id,
      number: "FAC-2026-005",
    },
  });

  if (existingInvoice) {
    await prisma.payment.deleteMany({ where: { invoiceId: existingInvoice.id } });
    await prisma.documentExport.deleteMany({ where: { invoiceId: existingInvoice.id } });
    await prisma.invoiceLine.deleteMany({ where: { invoiceId: existingInvoice.id } });
    await prisma.mission.updateMany({
      where: { invoiceId: existingInvoice.id },
      data: { invoiceId: null, status: "VALIDATED" },
    });
    await prisma.expense.updateMany({
      where: { invoiceId: existingInvoice.id },
      data: { invoiceId: null },
    });
    await prisma.invoice.delete({ where: { id: existingInvoice.id } });
  }

  const invoice = await prisma.invoice.create({
    data: {
      organizationId: organization.id,
      profileId: profile.id,
      clientId: client.id,
      number: "FAC-2026-005",
      issueDate: new Date("2026-05-31T12:00:00.000Z"),
      periodStart: new Date("2026-05-01T00:00:00.000Z"),
      periodEnd: new Date("2026-05-31T23:59:59.000Z"),
      status: "READY",
      currency: "EUR",
      subtotal: new Prisma.Decimal("1088.50"),
      vatRate: new Prisma.Decimal("0.0000"),
      vatAmount: new Prisma.Decimal("0.00"),
      total: new Prisma.Decimal("1088.50"),
      paidHoursDeduction: new Prisma.Decimal("65.00"),
      paidAmountDeduction: new Prisma.Decimal("845.00"),
      legalNotice: "TVA non applicable - article 293 B du CGI",
      notes: "Facture générée depuis les heures de mai 2026. 27 mai au taux exceptionnel de 16 €/h. Frais essence Étampes inclus.",
      lines: {
        create: [
          {
            label: "Prestations restantes après déduction des 65h déjà réglées",
            quantity: new Prisma.Decimal("78.50"),
            unit: "HOUR",
            unitPrice: new Prisma.Decimal("13.00"),
            vatRate: new Prisma.Decimal("0.0000"),
            total: new Prisma.Decimal("1020.50"),
            lineOrder: 1,
          },
          {
            label: "Majoration taux exceptionnel du 27 mai",
            description: "Différence de 3 €/h sur 6 heures",
            quantity: new Prisma.Decimal("6.00"),
            unit: "HOUR",
            unitPrice: new Prisma.Decimal("3.00"),
            vatRate: new Prisma.Decimal("0.0000"),
            total: new Prisma.Decimal("18.00"),
            lineOrder: 2,
          },
          {
            label: "Frais essence Étampes",
            quantity: new Prisma.Decimal("1.00"),
            unit: "FIXED_PRICE",
            unitPrice: new Prisma.Decimal("50.00"),
            vatRate: new Prisma.Decimal("0.0000"),
            total: new Prisma.Decimal("50.00"),
            lineOrder: 3,
          },
        ],
      },
    },
  });

  await prisma.urssafDeclaration.deleteMany({
    where: {
      organizationId: organization.id,
      year: 2026,
      month: 5,
    },
  });

  await prisma.urssafDeclaration.create({
    data: {
      organizationId: organization.id,
      year: 2026,
      month: 5,
      periodStart: new Date("2026-05-01T00:00:00.000Z"),
      periodEnd: new Date("2026-05-31T23:59:59.000Z"),
      activity: "SERVICE_BNC",
      turnover: new Prisma.Decimal("1088.50"),
      contributionRate: new Prisma.Decimal("0.2560"),
      contributionAmount: new Prisma.Decimal("278.66"),
      cfpRate: new Prisma.Decimal("0.0020"),
      cfpAmount: new Prisma.Decimal("2.18"),
      sourceLabel: "autoentrepreneur.urssaf.fr - taux 2026",
      notes: "Estimation indicative à vérifier avant déclaration officielle.",
    },
  });

  console.log({
    user: user.email,
    organization: organization.name,
    invoice: invoice.number,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
