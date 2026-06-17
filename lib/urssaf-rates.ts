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

/**
 * Taux indicatifs 2026 pour le calcul prévisionnel.
 * À garder configurable en base de données car les taux peuvent changer.
 */
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

export function estimateUrssaf(params: {
  turnover: number;
  activity: UrssafActivityCode;
  includeCfp?: boolean;
  customSocialRate?: number;
  customCfpRate?: number;
}) {
  const rate =
    params.activity === "CUSTOM"
      ? {
          socialContributionRate: params.customSocialRate ?? 0,
          defaultCfpRate: params.customCfpRate ?? 0,
        }
      : URSSAF_RATES_2026.find((item) => item.code === params.activity);

  if (!rate) {
    throw new Error("Activité URSSAF inconnue");
  }

  const social = roundMoney(params.turnover * rate.socialContributionRate);
  const cfpRate = params.customCfpRate ?? rate.defaultCfpRate ?? 0;
  const cfp = params.includeCfp ? roundMoney(params.turnover * cfpRate) : 0;

  return {
    turnover: roundMoney(params.turnover),
    socialContributionRate: rate.socialContributionRate,
    socialContributionAmount: social,
    cfpRate: params.includeCfp ? cfpRate : 0,
    cfpAmount: cfp,
    totalEstimatedAmount: roundMoney(social + cfp),
    netBeforeIncomeTax: roundMoney(params.turnover - social - cfp),
  };
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
