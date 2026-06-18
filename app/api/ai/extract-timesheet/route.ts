import OpenAI from "openai";
import {
  ExtractedTimesheetSchema,
  fallbackTimesheetExtraction,
} from "@/lib/ai/timesheet-parser";

export const runtime = "nodejs";

const DEFAULT_OPENAI_MODEL = "gpt-5.5-mini";

function isInvalidEnvValue(value: string | undefined) {
  if (!value) return true;

  const normalized = value.trim().toLowerCase();

  return (
    normalized.length === 0 ||
    normalized === "none" ||
    normalized === "null" ||
    normalized === "undefined" ||
    normalized === "false"
  );
}

function getOpenAiApiKey() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (isInvalidEnvValue(apiKey)) {
    return null;
  }

  if (!apiKey?.startsWith("sk-")) {
    return null;
  }

  return apiKey;
}

function getOpenAiModel() {
  const model = process.env.OPENAI_MODEL?.trim();

  if (isInvalidEnvValue(model)) {
    return DEFAULT_OPENAI_MODEL;
  }

  return model;
}

function runLocalFallback(
  text: string,
  mode = "local_fallback",
  warning?: string
) {
  return Response.json({
    mode,
    ...(warning ? { warning } : {}),
    data: fallbackTimesheetExtraction(text),
  });
}

function cleanJsonOutput(raw: string) {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.text !== "string" || body.text.trim().length < 5) {
    return Response.json(
      { error: "Texte insuffisant pour l’extraction." },
      { status: 400 }
    );
  }

  const text = body.text.trim();
  const apiKey = getOpenAiApiKey();

  if (!apiKey) {
    return runLocalFallback(
      text,
      "local_fallback",
      "L’assistant IA en ligne n’est pas configuré. Une extraction locale a été utilisée."
    );
  }

  try {
    const openai = new OpenAI({
      apiKey,
    });

    const response = await openai.responses.create({
      model: getOpenAiModel(),
      input: [
        {
          role: "system",
          content:
            "Tu extrais des missions de travail pour une application française de facturation. Réponds uniquement avec un JSON valide, sans markdown. Les dates doivent être au format YYYY-MM-DD. Les heures doivent être au format HH:mm. Le champ locationName doit contenir uniquement le lieu, sans date, sans horaires, sans taux et sans frais.",
        },
        {
          role: "user",
          content: `
Extrait les missions, horaires, lieux, taux horaires et frais depuis le texte suivant.

Le JSON retourné doit respecter strictement cette structure :

{
  "clientName": string | null,
  "period": string | null,
  "missions": [
    {
      "date": "YYYY-MM-DD",
      "startTime": "HH:mm",
      "endTime": "HH:mm",
      "locationName": string | null,
      "hourlyRate": number | null,
      "fuelAmount": number | null,
      "notes": string | null
    }
  ],
  "summary": {
    "totalEstimatedHours": number,
    "warnings": string[]
  }
}

Texte à analyser :
${text}
          `.trim(),
        },
      ],
    });

    const raw = response.output_text?.trim();

    if (!raw) {
      return runLocalFallback(
        text,
        "local_fallback",
        "L’assistant IA n’a pas retourné de réponse exploitable. Une extraction locale a été utilisée."
      );
    }

    const parsed = JSON.parse(cleanJsonOutput(raw));
    const validated = ExtractedTimesheetSchema.parse(parsed);

    return Response.json({
      mode: "openai",
      data: validated,
    });
  } catch (error) {
    console.error("[AI_TIMESHEET_EXTRACTION_ERROR]", error);

    return runLocalFallback(
      text,
      "local_fallback",
      "L’assistant IA en ligne est momentanément indisponible. Une extraction locale a été utilisée."
    );
  }
}

