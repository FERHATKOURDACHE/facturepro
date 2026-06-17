export type Client = {
  id: string;
  name: string;
  address: string;
  siret: string;
  ape?: string;
  email?: string;
  status: "Actif" | "À vérifier";
};

export type Mission = {
  id: string;
  date: string;
  day: string;
  start: string;
  end: string;
  location: string;
  client: string;
  hours: number;
  rate: number;
  note?: string;
  fuel?: number;
};

export type Invoice = {
  id: string;
  client: string;
  period: string;
  totalHours: number;
  paidHoursDeduction: number;
  billableHours: number;
  fuel: number;
  total: number;
  status: "Brouillon" | "À envoyer" | "Envoyée" | "Payée";
};

export const issuer = {
  name: "Ferhat KOURDACHE",
  address: "34 Rue Victor Basch, 91300 Massy",
  siret: "982 123 101 00015",
  email: "kourdacheferhat1@gmail.com",
  phone: "06 25 65 97 53",
  iban: "FR76 3000 4027 5100 0008 0342 980",
};

export const clients: Client[] = [
  {
    id: "cli_001",
    name: "TALENT PRO SOLUTION intérim",
    address: "11 Rue Tronchet, 75008 Paris-8e-Arrondissement",
    siret: "928 425 933 00019",
    ape: "7820Z",
    email: "recap.talents@gmail.com",
    status: "Actif",
  },
  {
    id: "cli_002",
    name: "Carrefour Market Boulogne",
    address: "Adresse à compléter",
    siret: "À compléter",
    status: "À vérifier",
  },
  {
    id: "cli_003",
    name: "Carrefour Market Étampes",
    address: "91150 Étampes",
    siret: "À compléter",
    status: "À vérifier",
  },
];

export const missions: Mission[] = [
  { id: "m_001", date: "2026-05-02", day: "Samedi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_002", date: "2026-05-02", day: "Samedi", start: "13:30", end: "20:00", location: "Carrefour Market Ivry-sur-Seine", client: "Talent Pro Solution", hours: 6.5, rate: 13 },
  { id: "m_003", date: "2026-05-03", day: "Dimanche", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_004", date: "2026-05-04", day: "Lundi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_005", date: "2026-05-05", day: "Mardi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_006", date: "2026-05-06", day: "Mercredi", start: "07:00", end: "13:00", location: "Carrefour Étampes 91150", client: "Talent Pro Solution", hours: 6, rate: 13, fuel: 50 },
  { id: "m_007", date: "2026-05-07", day: "Jeudi", start: "07:00", end: "13:00", location: "Carrefour Étampes 91150", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_008", date: "2026-05-08", day: "Vendredi", start: "07:00", end: "13:00", location: "Carrefour Étampes 91150", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_009", date: "2026-05-09", day: "Samedi", start: "07:00", end: "13:00", location: "Carrefour Étampes 91150", client: "Talent Pro Solution", hours: 6, rate: 13 },

  { id: "m_010", date: "2026-05-11", day: "Lundi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_011", date: "2026-05-12", day: "Mardi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_012", date: "2026-05-13", day: "Mercredi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_013", date: "2026-05-14", day: "Jeudi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_014", date: "2026-05-15", day: "Vendredi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_015", date: "2026-05-16", day: "Samedi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_016", date: "2026-05-17", day: "Dimanche", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },

  { id: "m_017", date: "2026-05-23", day: "Samedi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },

  { id: "m_018", date: "2026-05-25", day: "Lundi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_019", date: "2026-05-26", day: "Mardi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_020", date: "2026-05-27", day: "Mercredi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 16, note: "Taux exceptionnel" },
  { id: "m_021", date: "2026-05-28", day: "Jeudi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_022", date: "2026-05-29", day: "Vendredi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },
  { id: "m_023", date: "2026-05-29", day: "Vendredi", start: "13:30", end: "18:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 5, rate: 13, note: "Ajout manuel" },
  { id: "m_024", date: "2026-05-30", day: "Samedi", start: "06:30", end: "12:30", location: "Carrefour Market Boulogne", client: "Talent Pro Solution", hours: 6, rate: 13 },
];

export const invoices: Invoice[] = [
  {
    id: "FAC-2026-005",
    client: "TALENT PRO SOLUTION intérim",
    period: "Mai 2026",
    totalHours: 143.5,
    paidHoursDeduction: 65,
    billableHours: 78.5,
    fuel: 50,
    total: 1088.5,
    status: "À envoyer",
  },
  {
    id: "FAC-2026-004",
    client: "TALENT PRO SOLUTION intérim",
    period: "Avril 2026",
    totalHours: 121.5,
    paidHoursDeduction: 65,
    billableHours: 56.5,
    fuel: 0,
    total: 734.5,
    status: "Payée",
  },
];

export const weeklyTotals = [
  { week: "Semaine 18 : 01 au 03 mai", hours: 18.5 },
  { week: "Semaine 19 : 04 au 10 mai", hours: 36 },
  { week: "Semaine 20 : 11 au 17 mai", hours: 42 },
  { week: "Semaine 21 : 18 au 24 mai", hours: 6 },
  { week: "Semaine 22 : 25 au 30 mai", hours: 41 },
];

export const locationTotals = [
  { location: "Carrefour Market Boulogne", hours: 107 },
  { location: "Carrefour Étampes 91150", hours: 24 },
  { location: "Carrefour Market Ivry-sur-Seine", hours: 6.5 },
  { location: "Frais essence Étampes", hours: 0, amount: 50 },
];
