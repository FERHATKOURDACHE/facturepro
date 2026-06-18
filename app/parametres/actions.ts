"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UrssafActivity, VatRegime } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";

const SAFE_REDIRECTS = new Set(["/dashboard", "/parametres"]);
const VAT_REGIMES = new Set<string>(Object.values(VatRegime));
const URSSAF_ACTIVITIES = new Set<string>(Object.values(UrssafActivity));

function optionalString(value: FormDataEntryValue | null) {
  const stringValue = typeof value === "string" ? value.trim() : "";
  return stringValue.length > 0 ? stringValue : null;
}

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Le champ ${key} est obligatoire.`);
  }

  return value.trim();
}

function numberFromForm(
  formData: FormData,
  key: string,
  defaultValue: number,
  options: { min?: number; max?: number } = {}
) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    return defaultValue;
  }

  const normalized = value.replace(",", ".");
  const numberValue = Number(normalized);

  if (Number.isNaN(numberValue)) {
    throw new Error(`Le champ ${key} doit être un nombre.`);
  }

  if (options.min !== undefined && numberValue < options.min) {
    throw new Error(`Le champ ${key} est trop faible.`);
  }

  if (options.max !== undefined && numberValue > options.max) {
    throw new Error(`Le champ ${key} est trop élevé.`);
  }

  return numberValue;
}

function vatRegimeFromForm(formData: FormData) {
  const value =
    optionalString(formData.get("vatRegime")) ?? VatRegime.FRANCHISE_BASE;

  if (!VAT_REGIMES.has(value)) {
    throw new Error("Régime TVA invalide.");
  }

  return value as VatRegime;
}

function urssafActivityFromForm(formData: FormData) {
  const value =
    optionalString(formData.get("urssafActivity")) ?? UrssafActivity.SERVICE_BNC;

  if (!URSSAF_ACTIVITIES.has(value)) {
    throw new Error("Activité URSSAF invalide.");
  }

  return value as UrssafActivity;
}

function normalizeCurrency(value: string) {
  const currency = value.trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error("Devise invalide.");
  }

  return currency;
}

function normalizeCountry(value: string) {
  const country = value.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(country)) {
    throw new Error("Pays invalide.");
  }

  return country;
}

export async function updateSettingsAction(formData: FormData) {
  const organization = await getCurrentOrganization();
  const redirectTo = optionalString(formData.get("redirectTo"));

  const profileId = optionalString(formData.get("profileId"));

  const legalName = requiredString(formData, "legalName");
  const addressLine1 = requiredString(formData, "addressLine1");
  const postalCode = requiredString(formData, "postalCode");
  const city = requiredString(formData, "city");

  const currency = normalizeCurrency(
    optionalString(formData.get("currency")) ?? "EUR"
  );

  const country = normalizeCountry(
    optionalString(formData.get("country")) ?? "FR"
  );

  const vatRegime = vatRegimeFromForm(formData);
  const urssafActivity = urssafActivityFromForm(formData);

  const defaultHourlyRate = numberFromForm(
    formData,
    "defaultHourlyRate",
    13,
    { min: 0, max: 10000 }
  );

  const urssafRate = numberFromForm(
    formData,
    "urssafRate",
    0.256,
    { min: 0, max: 1 }
  );

  await prisma.$transaction(async (tx) => {
    await tx.organization.update({
      where: {
        id: organization.id,
      },
      data: {
        name: legalName,
        currency,
        country,
      },
    });

    const data = {
      legalName,
      tradeName: optionalString(formData.get("tradeName")),
      addressLine1,
      addressLine2: optionalString(formData.get("addressLine2")),
      postalCode,
      city,
      country,
      siren: optionalString(formData.get("siren")),
      siret: optionalString(formData.get("siret")),
      ape: optionalString(formData.get("ape")),
      vatNumber: optionalString(formData.get("vatNumber")),
      email: optionalString(formData.get("email")),
      phone: optionalString(formData.get("phone")),
      iban: optionalString(formData.get("iban")),
      bic: optionalString(formData.get("bic")),
      vatRegime,
      invoiceLegalNotice:
        optionalString(formData.get("invoiceLegalNotice")) ??
        "TVA non applicable - article 293 B du CGI",
      defaultHourlyRate,
      urssafActivity,
      urssafRate,
      isDefault: true,
    };

    if (profileId) {
      await tx.companyProfile.update({
        where: {
          id: profileId,
          organizationId: organization.id,
        },
        data,
      });
    } else {
      await tx.companyProfile.create({
        data: {
          organizationId: organization.id,
          ...data,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        organizationId: organization.id,
        action: "settings.updated",
        entityType: "CompanyProfile",
        entityId: profileId,
        metadata: {
          legalName,
          currency,
          country,
          vatRegime,
          urssafActivity,
          urssafRate,
        },
      },
    });
  });

  revalidatePath("/parametres");
  revalidatePath("/factures");
  revalidatePath("/dashboard");
  revalidatePath("/urssaf");

  if (redirectTo && SAFE_REDIRECTS.has(redirectTo)) {
    redirect(redirectTo);
  }

  redirect("/parametres?saved=1");
}
