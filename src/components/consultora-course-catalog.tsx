"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CourseCardActions } from "@/components/course-card-actions";
import { type ConsultoraResponse, type CursoResponse } from "@/lib/backend";

type CourseCatalogTone = {
  courseCard: string;
  courseExpanded: string;
};

type ConsultoraCourseCatalogProps = {
  cursos: CursoResponse[];
  consultoras: ConsultoraResponse[];
  backendUnavailable: boolean;
  tone: CourseCatalogTone;
};

function CourseCardItem({
  curso,
  consultoras,
  backendUnavailable,
  toneClassName,
}: {
  curso: CursoResponse;
  consultoras: ConsultoraResponse[];
  backendUnavailable: boolean;
  toneClassName: string;
}) {
  return (
    <div
      className={`group/course relative rounded-xl px-4 py-3 pr-24 ${toneClassName}`}
    >
      <CourseCardActions
        curso={curso}
        consultoras={consultoras}
        backendUnavailable={backendUnavailable}
      />
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
        Curso #{curso.id}
      </p>
      <p className="mt-2 text-sm font-semibold text-primary">
        {curso.empresa}
        {curso.grupo ? ` - ${curso.grupo}` : ""}
      </p>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
        {curso.activa ? "Activa" : "Inactiva"}
      </p>
    </div>
  );
}

export function ConsultoraCourseCatalog({
  cursos,
  consultoras,
  backendUnavailable,
  tone,
}: ConsultoraCourseCatalogProps) {
  const [expanded, setExpanded] = useState(false);
  const featuredCourses = cursos.slice(0, 4);
  const remainingCourses = cursos.slice(4);

  return (
    <div className="mt-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {featuredCourses.map((curso) => (
          <CourseCardItem
            key={curso.id}
            curso={curso}
            consultoras={consultoras}
            backendUnavailable={backendUnavailable}
            toneClassName={tone.courseCard}
          />
        ))}
      </div>

      {remainingCourses.length > 0 ? (
        <>
          <div
            className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
              expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div
                className={`grid gap-3 pt-1 transition-all duration-300 ease-out sm:grid-cols-2 ${
                  expanded
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-2 opacity-0"
                }`}
              >
                {remainingCourses.map((curso) => (
                  <CourseCardItem
                    key={curso.id}
                    curso={curso}
                    consultoras={consultoras}
                    backendUnavailable={backendUnavailable}
                    toneClassName={tone.courseExpanded}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="inline-flex w-full items-center justify-between rounded-xl border border-outline-variant/18 bg-white/55 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-primary transition hover:-translate-y-0.5 hover:bg-white/72"
            aria-expanded={expanded}
          >
            <span>
              {expanded
                ? "Ocultar cursos"
                : `Ver los ${cursos.length} cursos`}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                expanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </>
      ) : null}
    </div>
  );
}
