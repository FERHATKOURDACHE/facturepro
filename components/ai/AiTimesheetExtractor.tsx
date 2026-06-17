"use client";

import { useState } from "react";

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

export function AiTimesheetExtractor() {
  const [text, setText] = useState(
    "samedi 2 mai 2026 de 6:30 jusque a 12:30 carrefour market Boulogne et de 13:30 jusque 20:00 carrefour market ivry sur seine"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function extract() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/extract-timesheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Erreur extraction IA");
      }

      setResult(json);
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="card rounded-[2rem] p-6">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
          Assistant IA
        </p>
        <h2 className="mt-2 text-2xl font-black">Extraire des heures depuis un texte</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Colle un message brut avec dates, horaires et lieux. L'IA prépare une feuille de temps structurée.
        </p>

        <textarea
          className="input mt-6 min-h-72"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />

        <button
          onClick={extract}
          disabled={loading}
          className="mt-4 rounded-full bg-[var(--primary)] px-6 py-4 font-bold text-white shadow-xl disabled:opacity-60"
        >
          {loading ? "Extraction en cours..." : "Extraire avec l'IA"}
        </button>

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}
      </section>

      <section className="card rounded-[2rem] p-6">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
          Résultat
        </p>
        <h2 className="mt-2 text-2xl font-black">Prévisualisation structurée</h2>

        {!result ? (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600">
            Lance une extraction pour voir le résultat.
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="font-black text-emerald-800">Mode : {result.mode}</p>
              <p className="mt-1 text-sm text-emerald-700">
                Total estimé : {result.data.summary.totalEstimatedHours}h
              </p>
              {result.warning && <p className="mt-2 text-sm text-amber-700">{result.warning}</p>}
            </div>

            {result.data.summary.warnings.length > 0 && (
              <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
                {result.data.summary.warnings.map((warning) => (
                  <p key={warning}>• {warning}</p>
                ))}
              </div>
            )}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Horaires</th>
                    <th>Lieu</th>
                    <th>Taux</th>
                    <th>Frais</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.missions.map((mission, index) => (
                    <tr key={`${mission.date}-${mission.startTime}-${index}`}>
                      <td>{mission.date}</td>
                      <td>{mission.startTime} - {mission.endTime}</td>
                      <td>{mission.locationName ?? "-"}</td>
                      <td>{mission.hourlyRate ? `${mission.hourlyRate} €/h` : "-"}</td>
                      <td>{mission.fuelAmount ? `${mission.fuelAmount} €` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            
          </div>
        )}
      </section>
    </div>
  );
}
