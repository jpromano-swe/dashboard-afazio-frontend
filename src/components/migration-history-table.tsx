"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SectionFrame } from "@/components/editorial";
import { MigrationClassRow } from "@/components/migration-class-row";
import type { ClaseDelDiaResponse, ConsultoraResponse } from "@/lib/backend";

type MigrationHistoryTableProps = {
  classes: ClaseDelDiaResponse[];
  consultoras: ConsultoraResponse[];
};

const PAGE_SIZE = 50;

function getTitleGroupKey(title: string) {
  return title.trim().toLowerCase();
}

function getStatusFilterValue(clase: ClaseDelDiaResponse) {
  if (clase.sinClasificar) {
    return "sin-clasificar";
  }

  return clase.estado.toLowerCase();
}

export function MigrationHistoryTable({
  classes,
  consultoras,
}: MigrationHistoryTableProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredClasses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return classes.filter((clase) => {
      const matchesQuery =
        !normalizedQuery ||
        clase.titulo.toLowerCase().includes(normalizedQuery) ||
        (clase.empresa ?? "").toLowerCase().includes(normalizedQuery) ||
        (clase.grupo ?? "").toLowerCase().includes(normalizedQuery) ||
        (clase.consultoraNombre ?? "").toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "todos" || getStatusFilterValue(clase) === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [classes, query, statusFilter]);

  const sameTitleIdsByKey = useMemo(() => {
    const groups = new Map<string, number[]>();

    filteredClasses.forEach((clase) => {
      const key = getTitleGroupKey(clase.titulo);
      const group = groups.get(key) ?? [];
      group.push(clase.id);
      groups.set(key, group);
    });

    return groups;
  }, [filteredClasses]);

  const visibleClasses = filteredClasses.slice(0, visibleCount);
  const hasMore = visibleCount < filteredClasses.length;

  return (
    <SectionFrame className="mt-6 bg-surface-container-lowest p-0">
      <div className="flex flex-col gap-4 border-b border-outline-variant/15 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant/70">
            Filtros
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Buscá por clase, empresa, grupo o consultora y filtrá por estado.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[480px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/70" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder="Buscar clase o consultora"
              className="w-full rounded-xl border border-outline-variant/35 bg-surface px-10 py-3 text-sm text-primary outline-none"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className="w-full rounded-xl border border-outline-variant/35 bg-surface px-4 py-3 text-sm text-primary outline-none"
          >
            <option value="todos">Todos los estados</option>
            <option value="programada">Programadas</option>
            <option value="dictada">Dictadas</option>
            <option value="cancelada">Canceladas</option>
            <option value="reprogramada">Reprogramadas</option>
            <option value="sin-clasificar">Sin clasificar</option>
          </select>
        </div>
      </div>

      <div className="max-h-[68vh] overflow-auto">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-surface-container-high text-left shadow-[0_1px_0_rgba(6,27,14,0.08)]">
            <tr>
              {["Fecha", "Clase", "Consultora", "Estado", "Acciones"].map((label) => (
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
            {visibleClasses.map((clase) => (
              <MigrationClassRow
                key={clase.id}
                clase={clase}
                consultoras={consultoras}
                sameTitleIds={sameTitleIdsByKey.get(getTitleGroupKey(clase.titulo)) ?? []}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filteredClasses.length === 0 ? (
        <div className="px-6 py-8 text-sm text-on-surface-variant">
          No se encontraron clases para los filtros aplicados.
        </div>
      ) : null}

      {hasMore ? (
        <div className="flex justify-center border-t border-outline-variant/15 px-6 py-5">
          <button
            type="button"
            onClick={() => setVisibleCount((value) => value + PAGE_SIZE)}
            className="rounded-xl border border-outline-variant/35 bg-surface px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary transition hover:bg-surface-container-high"
          >
            Cargar más
          </button>
        </div>
      ) : null}
    </SectionFrame>
  );
}
