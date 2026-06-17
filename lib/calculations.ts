import { missions } from "@/lib/data";

export function formatHours(value: number) {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${String(minutes).padStart(2, "0")}`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function getTotalHours() {
  return missions.reduce((sum, mission) => sum + mission.hours, 0);
}

export function getFuelTotal() {
  return missions.reduce((sum, mission) => sum + (mission.fuel ?? 0), 0);
}

export function getInvoiceTotalAfterDeduction(paidHours: number) {
  const totalHours = getTotalHours();
  const billableHours = totalHours - paidHours;

  // Hypothèse métier actuelle :
  // les 65h déjà payées sont déduites au taux standard de 13€/h.
  // Le 27 mai garde son taux spécial : +3€/h sur 6h.
  const standardRate = 13;
  const specialRateDifference = 3;
  const specialHours = 6;

  const services = billableHours * standardRate + specialHours * specialRateDifference;
  return {
    totalHours,
    billableHours,
    services,
    fuel: getFuelTotal(),
    total: services + getFuelTotal(),
  };
}
