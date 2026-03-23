"use client";

import { useEffect } from "react";
import { ActionButton, SectionFrame } from "@/components/editorial";
import { notifyError } from "@/lib/client-toast";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    notifyError(
      undefined,
      "No se pudo cargar esta pantalla.",
      "Intentá nuevamente. Si el problema persiste, revisá la conexión con el backend.",
    );
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <SectionFrame className="bg-surface-container-lowest">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
          Error de carga
        </p>
        <h1 className="mt-4 font-headline text-4xl font-bold text-primary">
          No pudimos mostrar esta pantalla
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
          La aplicación ocultó el detalle técnico para no exponer trazas internas al usuario.
        </p>
        <div className="mt-8">
          <ActionButton type="button" variant="primary" onClick={() => reset()}>
            Reintentar
          </ActionButton>
        </div>
      </SectionFrame>
    </div>
  );
}
