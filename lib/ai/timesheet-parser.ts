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

const MONTHS: Record<string, string> = {
  janvier: "01",
  fevrier: "02",
  février: "02",
  mars: "03",
  avril: "04",
  mai: "05",
  juin: "06",
  juillet: "07",
  aout: "08",
  août: "08",
  septembre: "09",
  octobre: "10",
  novembre: "11",
  decembre: "12",
  décembre: "12",
};

const WEEKDAYS = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

type ParsedDate = {
  isoDate: string;
  raw: string;
};

type ParsedTimeRange = {
  startTime: string;
  endTime: string;
  raw: string;
  index: number;
};

export function fallbackTimesheetExtraction(text: string): ExtractedTimesheet {
  const normalizedText = normalizeText(text);

  const lines = normalizedText
    .split(/\n|\r|;/)
    .map((line) => line.trim())
    .filter(Boolean);

  const missions: ExtractedTimesheet["missions"] = [];

  for (const line of lines) {
    const parsedDate = extractDate(line);
    if (!parsedDate) continue;

    const timeRanges = extractTimeRanges(line);
    if (timeRanges.length === 0) continue;

    for (let index = 0; index < timeRanges.length; index += 1) {
      const currentRange = timeRanges[index];
      const nextRange = timeRanges[index + 1];

      const locationSegment = line.slice(
        currentRange.index + currentRange.raw.length,
        nextRange?.index ?? line.length
      );

      missions.push({
        date: parsedDate.isoDate,
        startTime: currentRange.startTime,
        endTime: currentRange.endTime,
        locationName: cleanLocation(locationSegment),
        hourlyRate: extractHourlyRate(line),
        fuelAmount: extractFuelAmount(line),
        notes: "Extraction automatique locale - à vérifier",
      });
    }
  }

  const totalEstimatedHours = missions.reduce((sum, mission) => {
    const start = timeToMinutes(mission.startTime);
    const end = timeToMinutes(mission.endTime);
    const duration = end >= start ? end - start : end + 24 * 60 - start;

    return sum + duration / 60;
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

function normalizeText(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\u202f/g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDate(line: string): ParsedDate | null {
  const numericDate = line.match(
    /\b(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?\b/i
  );

  if (numericDate) {
    const day = numericDate[1].padStart(2, "0");
    const month = numericDate[2].padStart(2, "0");
    const year = numericDate[3]
      ? normalizeYear(numericDate[3])
      : new Date().getUTCFullYear().toString();

    return {
      isoDate: `${year}-${month}-${day}`,
      raw: numericDate[0],
    };
  }

  const weekdayPattern = WEEKDAYS.join("|");
  const monthPattern = Object.keys(MONTHS).join("|");

  const frenchDate = line.match(
    new RegExp(
      `\\b(?:${weekdayPattern})?\\s*(\\d{1,2})\\s+(${monthPattern})\\s+(\\d{2,4})\\b`,
      "i"
    )
  );

  if (!frenchDate) return null;

  const day = frenchDate[1].padStart(2, "0");
  const month = MONTHS[frenchDate[2].toLowerCase()] ?? "01";
  const year = normalizeYear(frenchDate[3]);

  return {
    isoDate: `${year}-${month}-${day}`,
    raw: frenchDate[0],
  };
}

function extractTimeRanges(line: string): ParsedTimeRange[] {
  const ranges: ParsedTimeRange[] = [];

  const regex =
    /(?:\bde\s*)?(\d{1,2})(?:[:hH.](\d{2}))?\s*(?:jusqu(?:e|')?\s*(?:à|a)?|jusqua|jusqu a|à|a|-)\s*(\d{1,2})(?:[:hH.](\d{2}))?/gi;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    const startHour = match[1].padStart(2, "0");
    const startMinute = (match[2] ?? "00").padStart(2, "0");
    const endHour = match[3].padStart(2, "0");
    const endMinute = (match[4] ?? "00").padStart(2, "0");

    ranges.push({
      startTime: `${startHour}:${startMinute}`,
      endTime: `${endHour}:${endMinute}`,
      raw: match[0],
      index: match.index,
    });
  }

  return ranges;
}

function cleanLocation(segment: string) {
  const cleaned = segment
    .replace(
      /\b(?:taux|tarif|prix)\s*(?:horaire)?\s*:?\s*\d+(?:[\.,]\d+)?\s*(?:€|eur|euros)?\s*(?:\/h|par heure|l'heure)?\b/gi,
      " "
    )
    .replace(
      /\b\d+(?:[\.,]\d+)?\s*(?:€|eur|euros)\s*(?:\/h|par heure|l'heure)?\b/gi,
      " "
    )
    .replace(
      /\b(?:essence|carburant|frais)\b.*?\d+(?:[\.,]\d+)?\s*(?:€|eur|euros)?/gi,
      " "
    )
    .replace(
      /\b(?:puis|ensuite|après|avant|et|de|à|a|chez|mission|travail|prestation|intervention|taux|tarif|prix|horaire|heures?)\b/gi,
      " "
    )
    .replace(/[,:;.]+/g, " ")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length < 3) return null;

  return toSmartTitle(cleaned);
}

function extractHourlyRate(line: string) {
  const match = line.match(
    /(?:taux|tarif|prix)?\s*(\d+(?:[\.,]\d+)?)\s*(?:€|eur|euros)\s*(?:\/h|par heure|l'heure)/i
  );

  return match ? toNumber(match[1]) : null;
}

function extractFuelAmount(line: string) {
  const match = line.match(
    /\b(?:essence|carburant|frais)\b.*?(\d+(?:[\.,]\d+)?)\s*(?:€|eur|euros)?/i
  );

  return match ? toNumber(match[1]) : null;
}

function toSmartTitle(value: string) {
  const lowerWords = new Set([
    "sur",
    "sous",
    "de",
    "du",
    "des",
    "la",
    "le",
    "les",
    "et",
    "aux",
    "au",
  ]);

  return value
    .split(" ")
    .map((word, wordIndex) =>
      word
        .split("-")
        .map((part, partIndex) => {
          const lower = part.toLowerCase();

          if (lower === "mcdo") return "McDo";
          if (lower === "mcdonald" || lower === "mcdonalds") {
            return "McDonald";
          }

          if (wordIndex > 0 && partIndex > 0 && lowerWords.has(lower)) {
            return lower;
          }

          if (wordIndex > 0 && lowerWords.has(lower)) {
            return lower;
          }

          return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join("-")
    )
    .join(" ");
}

function normalizeYear(year: string) {
  return year.length === 2 ? `20${year}` : year;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toNumber(value: string) {
  return Number(value.replace(",", "."));
}
