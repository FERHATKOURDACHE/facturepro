import OpenAI from "openai";
import {
  ExtractedTimesheetSchema,
  fallbackTimesheetExtraction,
} from "@/lib/ai/timesheet-parser";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.text !== "string" || body.text.trim().length < 5) {
    return Response.json(
      { error: "Texte insuffisant pour l'extraction." },
      { status: 400 }
    );
  }

  const text = body.text.trim();

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({
      mode: "local_fallback",
      data: fallbackTimesheetExtraction(text),
    });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5.5-mini",
      input: [
        {
          role: "system",
          content:
            "Tu extrais des missions de travail pour une application de facturation française. Réponds uniquement en JSON valide conforme au schéma demandé. Les dates doivent être au format YYYY-MM-DD, les heures au format HH:mm.",
        },
        {
          role: "user",
          content: `Extrait les missions, horaires, lieux, taux et frais du texte suivant. Réponds avec ce JSON: {"clientName": string|null, "period": string|null, "missions": [{"date":"YYYY-MM-DD","startTime":"HH:mm","endTime":"HH:mm","locationName": string|null,"hourlyRate": number|null,"fuelAmount": number|null,"notes": string|null}], "summary": {"totalEstimatedHours": number, "warnings": string[]}}. Texte: ${text}`,
        },
      ],
    });

    const raw = response.output_text ?? "{}";
    const parsed = JSON.parse(raw);
    const validated = ExtractedTimesheetSchema.parse(parsed);

    return Response.json({
      mode: "openai",
      data: validated,
    });
  } catch (error) {
    return Response.json({
      mode: "local_fallback_after_ai_error",
      warning: error instanceof Error ? error.message : "Erreur IA inconnue",
      data: fallbackTimesheetExtraction(text),
    });
  }
}
