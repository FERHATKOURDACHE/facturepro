"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileText,
  Loader2,
  Timer,
  UploadCloud,
} from "lucide-react";

import { importAiMissionsAction } from "@/app/ai/actions";

type ClientOption = {
  id: string;
  legalName: string;
};

type ExtractedMission = {
  date: string;
  startTime: string;
  endTime: string;
  locationName: string | null;
  hourlyRate: number | null;
  fuelAmount: number | null;
  notes: string | null;
};

type AiResult = {
  mode: string;
  warning?: string;
  data: {
    clientName: string | null;
    period: string | null;
    missions: ExtractedMission[];
    summary: {
      totalEstimatedHours: number;
      warnings: string[];
    };
  };
};

const EXAMPLE_TEXT =
  "samedi 2 mai 2026 de 6:30 jusque à 12:30 Carrefour Market Boulogne puis de 13:30 jusque 20:00 Carrefour Market Ivry-sur-Seine. Taux 13€/h.";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatMode(mode: string) {
  if (mode === "openai") return "Extraction IA";
  if (mode.includes("fallback")) return "Extraction locale sécurisée";
  return "Extraction";
}

function getModeDescription(mode: string) {
  if (mode === "openai") {
    return "Les missions ont été structurées avec l’assistant IA.";
  }

  return "L’extraction locale a été utilisée pour garantir un résultat même si l’IA en ligne est indisponible.";
}

function getDurationHours(startTime: string, endTime: string) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  const duration = end >= start ? end - start : end + 24 * 60 - start;

  return Math.round((duration / 60) * 100) / 100;
}

export function AiTimesheetExtractor({
  clients,
}: {
  clients: ClientOption[];
}) {
  const [text, setText] = useState(EXAMPLE_TEXT);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const missionsJson = useMemo(() => {
    return JSON.stringify(result?.data.missions ?? []);
  }, [result]);

  const totalAmount = useMemo(() => {
    if (!result) return 0;

    return result.data.missions.reduce((sum, mission) => {
      const hours = getDurationHours(mission.startTime, mission.endTime);
      const rate = mission.hourlyRate ?? 0;
      const fuel = mission.fuelAmount ?? 0;

      return sum + hours * rate + fuel;
    }, 0);
  }, [result]);

  async function extract() {
    const trimmedText = text.trim();

    if (trimmedText.length < 5) {
      setError("Ajoute un texte avec au moins une date, un horaire ou un lieu.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ai/extract-timesheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmedText }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Impossible d’extraire les heures.");
      }

      setResult(json);
    } catch {
      setError(
        "L’extraction n’a pas pu être réalisée. Vérifie ton texte puis réessaie."
      );
    } finally {
      setLoading(false);
    }
  }

  const canImport =
    Boolean(result?.data.missions.length) &&
    Boolean(selectedClientId) &&
    clients.length > 0;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="card rounded-[2rem] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[var(--primary)]">
            <Bot size={24} />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--primary)]">
              Assistant IA
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Extraire des heures depuis un texte
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Colle un message brut contenant des dates, horaires, lieux, taux
              ou frais. FacturePro le transforme en feuille de temps structurée.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          Exemple : “lundi 3 juin de 9h à 17h chez Client A, taux 13€/h,
          frais essence 20€”.
        </div>

        <textarea
          className="input mt-5 min-h-64 resize-y"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Colle ici ton texte brut..."
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={extract}
            disabled={loading || text.trim().length < 5}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-4 font-bold text-white shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Extraction en cours...
              </>
            ) : (
              <>
                <Timer size={18} />
                Extraire les heures
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setText("");
              setResult(null);
              setError(null);
            }}
            className="rounded-full border border-slate-200 bg-white px-6 py-4 font-bold text-slate-700"
          >
            Effacer
          </button>
        </div>

        {error && (
          <div className="mt-4 flex gap-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertTriangle size={18} />
            <p>{error}</p>
          </div>
        )}
      </section>

      <section className="card rounded-[2rem] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[var(--primary)]">
            <FileText size={24} />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--primary)]">
              Résultat
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Prévisualisation structurée
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Vérifie les lignes extraites avant de les importer dans tes
              missions.
            </p>
          </div>
        </div>

        {!result ? (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
            <p className="text-lg font-black text-slate-950">
              Aucun résultat pour le moment
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Lance une extraction pour obtenir les dates, horaires, lieux, taux
              et frais détectés.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-emerald-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  Mode
                </p>
                <p className="mt-2 font-black text-emerald-900">
                  {formatMode(result.mode)}
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Heures
                </p>
                <p className="mt-2 font-black text-slate-950">
                  {result.data.summary.totalEstimatedHours}h
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Estimation
                </p>
                <p className="mt-2 font-black text-slate-950">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <p>{getModeDescription(result.mode)}</p>
            </div>

            {result.warning && (
              <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <p>{result.warning}</p>
              </div>
            )}

            {result.data.summary.warnings.length > 0 && (
              <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                {result.data.summary.warnings.map((warning) => (
                  <p key={warning}>• {warning}</p>
                ))}
              </div>
            )}

            {result.data.missions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600">
                Aucune mission détectée. Ajoute une date et une plage horaire
                dans le texte.
              </div>
            ) : (
              <>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Horaires</th>
                        <th>Durée</th>
                        <th>Lieu</th>
                        <th>Taux</th>
                        <th>Frais</th>
                      </tr>
                    </thead>

                    <tbody>
                      {result.data.missions.map((mission, index) => {
                        const duration = getDurationHours(
                          mission.startTime,
                          mission.endTime
                        );

                        return (
                          <tr key={`${mission.date}-${mission.startTime}-${index}`}>
                            <td>{mission.date}</td>
                            <td>
                              {mission.startTime} - {mission.endTime}
                            </td>
                            <td>{duration}h</td>
                            <td>{mission.locationName ?? "-"}</td>
                            <td>
                              {mission.hourlyRate !== null
                                ? `${mission.hourlyRate} €/h`
                                : "-"}
                            </td>
                            <td>
                              {mission.fuelAmount !== null
                                ? formatCurrency(mission.fuelAmount)
                                : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <form action={importAiMissionsAction} className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                  <input type="hidden" name="missionsJson" value={missionsJson} />

                  <label className="block text-sm font-black text-emerald-900">
                    Client à rattacher aux missions
                  </label>

                  {clients.length === 0 ? (
                    <div className="mt-3 rounded-2xl bg-white p-4 text-sm font-semibold text-amber-800">
                      Ajoute d’abord un client dans la page Clients avant
                      d’importer des missions.
                    </div>
                  ) : (
                    <select
                      name="clientId"
                      value={selectedClientId}
                      onChange={(event) => setSelectedClientId(event.target.value)}
                      className="input mt-3 bg-white"
                      required
                    >
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.legalName}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    type="submit"
                    disabled={!canImport}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-4 font-bold text-white shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <UploadCloud size={18} />
                    Importer les missions
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
