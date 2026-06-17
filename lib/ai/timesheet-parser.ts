import { z } from "zod";

export const ExtractedTimesheetSchema = z.object({
  clientName: z.string().nullable(),
  period: z.string().nullable(),
  missions: z.array(
    z.object({
      date: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      locationName: z.string().nullable(),
      hourlyRate: z.number().nullable(),
      fuelAmount: z.number().nullable(),
      notes: z.string().nullable(),
    })
  ),
  summary: z.object({
    totalEstimatedHours: z.number(),
    warnings: z.array(z.string()),
  }),
});

export type ExtractedTimesheet = z.infer<typeof ExtractedTimesheetSchema>;

export function fallbackTimesheetExtraction(text: string): ExtractedTimesheet {
  const lines = text
    .split(/\n|\r|;/)
    .map((line) => line.trim())
    .filter(Boolean);

  const missions: ExtractedTimesheet["missions"] = [];

  const dateRegex = /(\d{1,2})[\/\-\.\s](\d{1,2})(?:[\/\-\.\s](\d{2,4}))?/;
  const timeRegex = /(\d{1,2})[:hH\.]?(\d{2})?\s*(?:jusqu[e'àa]*|a|à|-)\s*(\d{1,2})[:hH\.]?(\d{2})?/i;
  const rateRegex = /(\d+(?:[\.,]\d+)?)\s*(?:€|eur|euros)\s*(?:\/h|par heure|l'heure)?/i;
  const fuelRegex = /(essence|carburant|frais).*?(\d+(?:[\.,]\d+)?)\s*(?:€|eur|euros)?/i;

  for (const line of lines) {
    const dateMatch = line.match(dateRegex);
    const timeMatch = line.match(timeRegex);

    if (!dateMatch || !timeMatch) continue;

    const day = dateMatch[1].padStart(2, "0");
    const month = dateMatch[2].padStart(2, "0");
    const year = dateMatch[3] ? normalizeYear(dateMatch[3]) : new Date().getUTCFullYear().toString();

    const startHour = timeMatch[1].padStart(2, "0");
    const startMinute = (timeMatch[2] ?? "00").padStart(2, "0");
    const endHour = timeMatch[3].padStart(2, "0");
    const endMinute = (timeMatch[4] ?? "00").padStart(2, "0");

    const rateMatch = line.match(rateRegex);
    const fuelMatch = line.match(fuelRegex);

    missions.push({
      date: `${year}-${month}-${day}`,
      startTime: `${startHour}:${startMinute}`,
      endTime: `${endHour}:${endMinute}`,
      locationName: cleanLocation(line),
      hourlyRate: rateMatch ? Number(rateMatch[1].replace(",", ".")) : null,
      fuelAmount: fuelMatch ? Number(fuelMatch[2].replace(",", ".")) : null,
      notes: "Extraction automatique locale - à vérifier",
    });
  }

  const totalEstimatedHours = missions.reduce((sum, mission) => {
    const start = timeToMinutes(mission.startTime);
    const end = timeToMinutes(mission.endTime);
    return sum + Math.max(0, end - start) / 60;
  }, 0);

  return {
    clientName: null,
    period: null,
    missions,
    summary: {
      totalEstimatedHours: Math.round(totalEstimatedHours * 100) / 100,
      warnings: [
        "Extraction locale utilisée. Vérifie les dates, lieux, taux et frais avant import définitif.",
      ],
    },
  };
}

function normalizeYear(year: string) {
  if (year.length === 2) return `20${year}`;
  return year;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function cleanLocation(line: string) {
  const keywords = [
    "carrefour",
    "mcdonald",
    "mcdo",
    "market",
    "intermarché",
    "intermarche",
    "auchan",
    "leclerc",
    "monoprix",
    "franprix",
    "casino",
    "aldi",
    "lidl",
  ];

  let cleaned = line
    // Supprime les dates : 02/05/2026, 02-05-2026, etc.
    .replace(/\b\d{1,2}[\/\-\.\s]\d{1,2}(?:[\/\-\.\s]\d{2,4})?\b/g, " ")

    // Supprime les horaires : de 09h00 à 17h00, 09h00-17h00, 09:00 à 17:00
    .replace(/\bde\s+\d{1,2}[:hH\.]?\d{0,2}\s*(?:jusqu[e'àa]*|a|à|-)\s*\d{1,2}[:hH\.]?\d{0,2}\b/gi, " ")
    .replace(/\b\d{1,2}[:hH\.]?\d{0,2}\s*(?:jusqu[e'àa]*|a|à|-)\s*\d{1,2}[:hH\.]?\d{0,2}\b/gi, " ")

    // Supprime les mots inutiles
    .replace(/\b(le|la|du|des|mission|travail|intervention|prestation|chez|à|a)\b/gi, " ")

    // Supprime les taux horaires et frais éventuels
    .replace(/\d+(?:[\.,]\d+)?\s*(?:€|eur|euros)\s*(?:\/h|par heure|l'heure)?/gi, " ")
    .replace(/\b(essence|carburant|frais)\b.*?\d+(?:[\.,]\d+)?\s*(?:€|eur|euros)?/gi, " ")

    // Nettoyage final
    .replace(/[,:;.\-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const lower = cleaned.toLowerCase();
  const keyword = keywords.find((item) => lower.includes(item));

  if (!keyword) return cleaned.length > 2 ? cleaned : null;

  const index = lower.indexOf(keyword);
  const location = cleaned.slice(index).replace(/\s+/g, " ").trim();

  return location.length > 2 ? location : null;
}
