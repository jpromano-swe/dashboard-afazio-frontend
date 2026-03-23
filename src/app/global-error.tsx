"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background px-5 py-16 text-on-surface antialiased sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[1.6rem] border border-outline-variant/25 bg-surface-container-lowest p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
            Error global
          </p>
          <h1 className="mt-4 font-headline text-4xl font-bold text-primary">
            La aplicación encontró un problema inesperado
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
            El detalle técnico se ocultó para evitar mostrar trazas internas al usuario final.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-xl bg-primary px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-primary transition hover:opacity-95"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
