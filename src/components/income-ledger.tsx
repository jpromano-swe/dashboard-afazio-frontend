"use client";

import { useMemo, useState } from "react";
import { ActionButton, MobileTableHint, SectionFrame, StatusBadge } from "@/components/editorial";
import type { IncomeRow } from "@/lib/data";

type IncomeLedgerProps = {
  rows: IncomeRow[];
  subtotal: string;
  backendNotice?: string;
};

const PAGE_SIZE = 20;

function getIncomeStatusTone(status: string) {
  if (status === "confirmado") {
    return "confirmed" as const;
  }

  if (status === "pendiente") {
    return "pending" as const;
  }

  if (status === "facturable") {
    return "billable" as const;
  }

  return "muted" as const;
}

function getIncomeStatusLabel(status: string) {
  if (status === "confirmado") {
    return "Confirmado";
  }

  if (status === "pendiente") {
    return "Pendiente";
  }

  if (status === "facturable") {
    return "Facturable";
  }

  return status;
}

export function IncomeLedger({
  rows,
  subtotal,
  backendNotice,
}: IncomeLedgerProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleRows = useMemo(() => rows.slice(0, visibleCount), [rows, visibleCount]);
  const hasMore = visibleCount < rows.length;

  return (
    <section className="mt-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-headline text-4xl font-bold text-primary">
            Libro facturable
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Detalle de sesiones y honorarios por consultora.
          </p>
        </div>
      </div>

      <SectionFrame className="mt-6 bg-surface-container-lowest p-0">
        <MobileTableHint />
        <div className="max-h-[62vh] overflow-auto">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-surface-container-high text-left shadow-[0_1px_0_rgba(6,27,14,0.08)]">
              <tr>
                {[
                  "Fecha",
                  "Clase / descripción",
                  "Entidad",
                  "Consultora",
                  "Horas",
                  "Estado",
                  "Importe",
                ].map((label) => (
                  <th
                    key={label}
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {visibleRows.length > 0 ? (
                visibleRows.map((row) => (
                  <tr key={`${row.date}-${row.title}-${row.code}`} className="hover:bg-surface-container-low/60">
                    <td className="px-6 py-5 font-headline text-lg text-primary">
                      {row.date}
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-primary">{row.title}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-on-surface-variant">
                        {row.code}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">{row.entity}</td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">
                      {row.consultant}
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">{row.hours}</td>
                    <td className="px-6 py-5">
                      <StatusBadge tone={getIncomeStatusTone(row.status)}>
                        {getIncomeStatusLabel(row.status)}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-5 text-right font-headline text-2xl font-bold text-primary">
                      {row.amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-sm leading-6 text-on-surface-variant"
                  >
                    {backendNotice
                      ? "No se pudieron mostrar ingresos para este rango. Revisá el aviso superior."
                      : "No hay clases facturables para este rango todavía."}
                  </td>
                </tr>
              )}
            </tbody>
            {rows.length > 0 ? (
              <tfoot className="bg-surface-container-low/65">
                <tr className="border-t-2 border-outline-variant/20">
                  <td colSpan={5} className="px-6 py-5" />
                  <td className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                    Total de la vista
                  </td>
                  <td className="px-6 py-5 text-right font-headline text-3xl font-bold text-primary">
                    {subtotal}
                  </td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>

        {hasMore ? (
          <div className="flex justify-center border-t border-outline-variant/15 px-6 py-5">
            <ActionButton variant="outline" onClick={() => setVisibleCount((value) => value + PAGE_SIZE)}>
              Cargar más
            </ActionButton>
          </div>
        ) : null}
      </SectionFrame>
    </section>
  );
}
