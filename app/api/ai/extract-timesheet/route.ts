import OpenAI from "openai";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  ExtractedTimesheetSchema,
  fallbackTimesheetExtraction,
  type ExtractedTimesheet,
} from "@/lib/ai/timesheet-parser";

export const runtime = "nodejs";

const DEFAULT_OPENAI_MODEL = "gpt-5.5-mini";
const MAX_TEXT_LENGTH = 12000;
const MAX_EXTRACTED_MISSIONS = 50;

type ApiContext = {
  organizationId: string;
  userId: string;
};

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

  return model ?? DEFAULT_OPENAI_MODEL;
}

async function getApiContext(): Promise<ApiContext | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
    },
    select: {
      organizationId: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!membership) {
    return null;
  }

  return {
    organizationId: membership.organizationId,
    userId: session.user.id,
  };
}

function cleanJsonOutput(raw: string) {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function calculateEstimatedHours(missions: ExtractedTimesheet["missions"]) {
  const total = missions.reduce((sum, mission) => {
    const start = timeToMinutes(mission.startTime);
    const end = timeToMinutes(mission.endTime);
    const duration = end >= start ? end - start : end + 24 * 60 - start;

    return sum + Math.max(0, duration) / 60;
  }, 0);

  return Math.round(total * 100) / 100;
}

function limitExtractedTimesheet(data: ExtractedTimesheet): ExtractedTimesheet {
  if (data.missions.length <= MAX_EXTRACTED_MISSIONS) {
    return data;
  }

  const missions = data.missions.slice(0, MAX_EXTRACTED_MISSIONS);

  return {
    ...data,
    missions,
    summary: {
      totalEstimatedHours: calculateEstimatedHours(missions),
      warnings: [
        ...data.summary.warnings,
        `Extraction limitée à ${MAX_EXTRACTED_MISSIONS} missions pour protéger l'application.`,
      ],
    },
  };
}

async function logAiExtraction(
  context: ApiContext,
  params: {
    mode: string;
    model: string | null;
    textLength: number;
    missionCount: number;
    warning?: string;
  }
) {
  await prisma.aiGeneration
    .create({
      data: {
        organizationId: context.organizationId,
        userId: context.userId,
        type: "TIMESHEET_EXTRACTION",
        prompt: "Extraction sécurisée de feuille de temps",
        response: params.warning ?? null,
        inputJson: {
          mode: params.mode,
          textLength: params.textLength,
        },
        outputJson: {
          missionCount: params.missionCount,
          warning: params.warning ?? null,
        },
        model: params.model,
      },
    })
    .catch((error) => {
      console.error("[AI_GENERATION_LOG_ERROR]", error);
    });
}

async function runLocalFallback(
  text: string,
  context: ApiContext,
  mode = "local_fallback",
  warning?: string
) {
  const data = limitExtractedTimesheet(fallbackTimesheetExtraction(text));

  await logAiExtraction(context, {
    mode,
    model: null,
    textLength: text.length,
    missionCount: data.missions.length,
    warning,
  });

  return Response.json({
    mode,
    ...(warning ? { warning } : {}),
    data,
  });
}

export async function POST(request: Request) {
  const context = await getApiContext();

  if (!context) {
    return Response.json(
      { error: "Authentification requise pour utiliser l'assistant IA." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body.text !== "string" || body.text.trim().length < 5) {
    return Response.json(
      { error: "Texte insuffisant pour l'extraction." },
      { status: 400 }
    );
  }

  const text = body.text.trim();

  if (text.length > MAX_TEXT_LENGTH) {
    return Response.json(
      {
        error: `Texte trop long. Limite autorisée : ${MAX_TEXT_LENGTH} caractères.`,
      },
      { status: 413 }
    );
  }

  const apiKey = getOpenAiApiKey();

  if (!apiKey) {
    return runLocalFallback(
      text,
      context,
      "local_fallback",
      "L'assistant IA en ligne n'est pas configuré. Une extraction locale a été utilisée."
    );
  }

  const model = getOpenAiModel();

  try {
    const openai = new OpenAI({
      apiKey,
    });

    const response = await openai.responses.create({
      model,
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
        context,
        "local_fallback",
        "L'assistant IA n'a pas retourné de réponse exploitable. Une extraction locale a été utilisée."
      );
    }

    const parsed = JSON.parse(cleanJsonOutput(raw));
    const validated = limitExtractedTimesheet(
      ExtractedTimesheetSchema.parse(parsed)
    );

    await logAiExtraction(context, {
      mode: "openai",
      model,
      textLength: text.length,
      missionCount: validated.missions.length,
    });

    return Response.json({
      mode: "openai",
      data: validated,
    });
  } catch (error) {
    console.error("[AI_TIMESHEET_EXTRACTION_ERROR]", error);

    return runLocalFallback(
      text,
      context,
      "local_fallback",
      "L'assistant IA en ligne est momentanément indisponible. Une extraction locale a été utilisée."
    );
  }
}
