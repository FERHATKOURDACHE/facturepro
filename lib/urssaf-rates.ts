export type UrssafActivityCode =
  | "SALE_BIC"
  | "SERVICE_BIC"
  | "SERVICE_BNC"
  | "CIPAV"
  | "CUSTOM";

export type UrssafRate = {
  code: UrssafActivityCode;
  label: string;
  socialContributionRate: number;
  defaultCfpRate?: number;
  source: string;
  validFrom: string;
};

export type UrssafPaymentAmount = {
  amount: number;
  paidAt: Date;
};

export const URSSAF_OFFICIAL_PORTAL_URL =
  "https://www.autoentrepreneur.urssaf.fr/portail/accueil.html";

export const URSSAF_RATES_2026: UrssafRate[] = [
  {
    code: "SALE_BIC",
    label: "Achat / revente de marchandises",
    socialContributionRate: 0.123,
    defaultCfpRate: 0.001,
    source: "autoentrepreneur.urssaf.fr",
    validFrom: "2026-01-01",
  },
  {
    code: "SERVICE_BIC",
    label: "Prestations de services commerciales ou artisanales BIC",
    socialContributionRate: 0.212,
    defaultCfpRate: 0.003,
    source: "autoentrepreneur.urssaf.fr",
    validFrom: "2026-01-01",
  },
  {
    code: "SERVICE_BNC",
    label: "Autres prestations de services BNC",
    socialContributionRate: 0.256,
    defaultCfpRate: 0.002,
    source: "autoentrepreneur.urssaf.fr",
    validFrom: "2026-01-01",
  },
  {
    code: "CIPAV",
    label: "Professions libérales réglementées CIPAV",
    socialContributionRate: 0.232,
    defaultCfpRate: 0.002,
    source: "autoentrepreneur.urssaf.fr",
    validFrom: "2026-01-01",
  },
];

const ACRE_2026_CHANGE_DATE = new Date("2026-07-01T00:00:00.000Z");

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function resolveRate(params: {
  activity: UrssafActivityCode;
  customSocialRate?: number;
  customCfpRate?: number;
}) {
  if (params.activity === "CUSTOM") {
    return {
      socialContributionRate: params.customSocialRate ?? 0,
      defaultCfpRate: params.customCfpRate ?? 0,
      label: "Taux personnalisé",
    };
  }

  const rate = URSSAF_RATES_2026.find((item) => item.code === params.activity);

  if (!rate) {
    throw new Error("Activité URSSAF inconnue");
  }

  return rate;
}

export function getAcreRateMultiplier(paymentDate: Date) {
  return paymentDate >= ACRE_2026_CHANGE_DATE ? 0.75 : 0.5;
}

export function isDateInAcrePeriod(params: {
  paidAt: Date;
  includeAcre?: boolean;
  acreStart?: Date | null;
  acreEnd?: Date | null;
}) {
  if (!params.includeAcre || !params.acreStart || !params.acreEnd) {
    return false;
  }

  return params.paidAt >= params.acreStart && params.paidAt <= params.acreEnd;
}

export function estimateUrssafPro(params: {
  payments: UrssafPaymentAmount[];
  activity: UrssafActivityCode;
  includeCfp?: boolean;
  includeAcre?: boolean;
  acreStart?: Date | null;
  acreEnd?: Date | null;
  customSocialRate?: number;
  customCfpRate?: number;
}) {
  const rate = resolveRate(params);

  let turnover = 0;
  let standardTurnover = 0;
  let acreTurnover = 0;
  let socialContributionAmount = 0;

  for (const payment of params.payments) {
    const amount = roundMoney(payment.amount);
    turnover = roundMoney(turnover + amount);

    const isAcre = isDateInAcrePeriod({
      paidAt: payment.paidAt,
      includeAcre: params.includeAcre,
      acreStart: params.acreStart,
      acreEnd: params.acreEnd,
    });

    if (isAcre) {
      acreTurnover = roundMoney(acreTurnover + amount);
      const acreMultiplier = getAcreRateMultiplier(payment.paidAt);
      socialContributionAmount = roundMoney(
        socialContributionAmount +
          amount * rate.socialContributionRate * acreMultiplier
      );
    } else {
      standardTurnover = roundMoney(standardTurnover + amount);
      socialContributionAmount = roundMoney(
        socialContributionAmount + amount * rate.socialContributionRate
      );
    }
  }

  const cfpRate = params.customCfpRate ?? rate.defaultCfpRate ?? 0;
  const cfpAmount = params.includeCfp ? roundMoney(turnover * cfpRate) : 0;
  const totalEstimatedAmount = roundMoney(
    socialContributionAmount + cfpAmount
  );

  return {
    turnover: roundMoney(turnover),
    standardTurnover,
    acreTurnover,
    socialContributionRate: rate.socialContributionRate,
    acreRateBeforeJuly2026: roundMoney(rate.socialContributionRate * 0.5),
    acreRateFromJuly2026: roundMoney(rate.socialContributionRate * 0.75),
    socialContributionAmount: roundMoney(socialContributionAmount),
    cfpRate: params.includeCfp ? cfpRate : 0,
    cfpAmount,
    totalEstimatedAmount,
    netBeforeIncomeTax: roundMoney(turnover - totalEstimatedAmount),
    activityLabel: rate.label,
    acreEnabled: Boolean(params.includeAcre),
  };
}

export function estimateUrssaf(params: {
  turnover: number;
  activity: UrssafActivityCode;
  includeCfp?: boolean;
  customSocialRate?: number;
  customCfpRate?: number;
}) {
  return estimateUrssafPro({
    payments: [{ amount: params.turnover, paidAt: new Date() }],
    activity: params.activity,
    includeCfp: params.includeCfp,
    customSocialRate: params.customSocialRate,
    customCfpRate: params.customCfpRate,
  });
}
