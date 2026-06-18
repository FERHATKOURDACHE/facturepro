
"use server";

import { revalidatePath } from "next/cache";
import { UrssafActivity, VatRegime } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";

function optionalString(value: FormDataEntryValue | null) {
  const stringValue = typeof value === "string" ? value.trim() : "";
  return stringValue.length > 0 ? stringValue : null;
}

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Le champ ${ key } est obligatoire.`);
  }

  return value.trim();
}

function numberFromForm(formData: FormData, key: string, defaultValue: number) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    return defaultValue;
  }

  const normalized = value.replace(",", ".");
  const numberValue = Number(normalized);

  if (Number.isNaN(numberValue)) {
    throw new Error(`Le champ ${ key } doit être un nombre.`);
  }

  return numberValue;
}

export async function updateSettingsAction(formData: FormData) {
  const organization = await getCurrentOrganization();

  const profileId = optionalString(formData.get("profileId"));

  const legalName = requiredString(formData, "legalName");
  const addressLine1 = requiredString(formData, "addressLine1");
  const postalCode = requiredString(formData, "postalCode");
  const city = requiredString(formData, "city");

  const currency = optionalString(formData.get("currency")) ?? "EUR";
  const country = optionalString(formData.get("country")) ?? "FR";

  const vatRegime =
    (optionalString(formData.get("vatRegime")) as VatRegime | null) ??
    VatRegime.FRANCHISE_BASE;

  const urssafActivity =
    (optionalString(formData.get("urssafActivity")) as UrssafActivity | null) ??
    UrssafActivity.SERVICE_BNC;

  const defaultHourlyRate = numberFromForm(formData, "defaultHourlyRate", 13);
  const urssafRate = numberFromForm(formData, "urssafRate", 0.256);

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
  });

  revalidatePath("/parametres");
  revalidatePath("/factures");
  revalidatePath("/dashboard");
}

