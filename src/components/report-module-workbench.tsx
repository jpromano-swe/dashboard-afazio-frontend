"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Copy, Download, Mail, Send, X } from "lucide-react";
import { ActionButton, SectionFrame, StatusBadge } from "@/components/editorial";
import { notifyError, notifySuccess, notifyWarning } from "@/lib/client-toast";
import type { ReportTheme, ReportWorkspaceData } from "@/lib/report-workspace";

type ReportModuleWorkbenchProps = {
  data: ReportWorkspaceData;
  title: string;
  subtitle: string;
};

const THEME_STYLES: Record<
  ReportTheme,
  {
    card: string;
    cardBorder: string;
    primaryButton: string;
    primaryBadge: string;
    heroTag: string;
    heroText: string;
    pill: string;
    tableHead: string;
  }
> = {
  amber: {
    card: "bg-[#f4e3a1]",
    cardBorder: "border-[#e0cf79]",
    primaryButton: "bg-[#d8c35c] text-[#2f2500] hover:opacity-95",
    primaryBadge: "bg-[#fff4bf] text-[#6d5a00]",
    heroTag: "bg-[#fff4c2] text-[#7a6500]",
    heroText: "text-[#3c3000]",
    pill: "bg-[#fff7d0] text-[#716100]",
    tableHead: "bg-[#fff7d0]/70",
  },
  purple: {
    card: "bg-[#d9cff3]",
    cardBorder: "border-[#cbbef0]",
    primaryButton: "bg-[#cdbff3] text-[#3f2f85] hover:opacity-95",
    primaryBadge: "bg-[#ece5ff] text-[#5943a6]",
    heroTag: "bg-[#ede7ff] text-[#5d49b2]",
    heroText: "text-[#2f225f]",
    pill: "bg-[#f3efff] text-[#5a46ab]",
    tableHead: "bg-[#eee7ff]/70",
  },
};

export function ReportModuleWorkbench({
  data,
  title,
  subtitle,
}: ReportModuleWorkbenchProps) {
  return (
    <ReportModuleWorkbenchInner
      key={`${data.moduleName}-${data.key}`}
      data={data}
      title={title}
      subtitle={subtitle}
    />
  );
}

function ReportModuleWorkbenchInner({
  data,
  title,
  subtitle,
}: ReportModuleWorkbenchProps) {
  const theme = THEME_STYLES[data.theme];
  const [message, setMessage] = useState(data.emailBody);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [excelPrepared, setExcelPrepared] = useState(false);
  const [mailPanelMounted, setMailPanelMounted] = useState(false);
  const [mailPanelVisible, setMailPanelVisible] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  const canGenerate = Boolean(data.excelHref) && data.rows.length > 0 && data.rows.length <= 9;

  const summaryItems = useMemo(
    () => [
      { label: "Clases facturables", value: String(data.totalClasses).padStart(2, "0") },
      { label: "Horas facturables", value: data.totalHours },
      { label: "Importe total", value: data.totalAmount ?? "Pendiente" },
    ],
    [data.totalAmount, data.totalClasses, data.totalHours],
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      notifySuccess("Mensaje copiado", "El texto quedó listo para pegar en tu correo.");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
      notifyError(undefined, "No se pudo copiar el mensaje.");
    }
  }

  function handleMockSend() {
    setSent(true);
    notifyWarning(
      "Envío simulado",
      "El backend de correo todavía no está conectado. No se envió un email real.",
    );
    window.setTimeout(() => setSent(false), 2200);
  }

  function handleGenerateExcel() {
    if (!data.excelHref) {
      return;
    }

    window.open(data.excelHref, "_blank", "noopener,noreferrer");
    setExcelPrepared(true);
    notifySuccess(
      "Excel generado",
      "El archivo se abrió en una nueva pestaña. Ya podés preparar el envío por correo.",
    );
  }

  function openMailPanel() {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setMailPanelMounted(true);
    window.requestAnimationFrame(() => setMailPanelVisible(true));
  }

  function closeMailPanel() {
    setMailPanelVisible(false);
    closeTimeoutRef.current = window.setTimeout(() => {
      setMailPanelMounted(false);
      closeTimeoutRef.current = null;
    }, 280);
  }

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <SectionFrame className="p-0">
        <div className="border-b border-outline-variant/12 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <StatusBadge tone="archived">{data.moduleName}</StatusBadge>
              <h2 className="mt-5 font-headline text-5xl font-bold tracking-tight text-primary">
                {title}
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-on-surface-variant">
                {subtitle}
              </p>
            </div>

            <div className={`${theme.card} ${theme.cardBorder} rounded-[1.4rem] border p-4 shadow-[0_16px_32px_rgba(0,0,0,0.08)]`}>
              <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${theme.heroText} opacity-70`}>
                Período de facturación
              </p>
              <p className={`mt-2 font-headline text-3xl font-bold ${theme.heroText}`}>
                {data.label}
              </p>
              <p className={`mt-1 text-sm ${theme.heroText} opacity-85`}>
                {data.consultoraName}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-8">
          <form
            method="GET"
            className="grid gap-4 rounded-[1.2rem] border border-outline-variant/15 bg-surface-container-low p-4 md:grid-cols-[minmax(0,1fr)_auto]"
          >
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
                Período
              </span>
              <input
                type="month"
                name="periodo"
                defaultValue={data.key}
                className="rounded-xl border border-outline-variant/35 bg-surface px-4 py-3 text-sm text-primary outline-none"
              />
            </label>
            <div className="flex items-end">
                <button
                  type="submit"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] ${theme.primaryButton}`}
                >
                  <CalendarDays className="h-4 w-4" />
                  Cargar período
                </button>
              </div>
            </form>

          <div className="grid gap-4 md:grid-cols-3">
            {summaryItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.2rem] border border-outline-variant/15 bg-surface-container-low px-4 py-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
                  {item.label}
                </p>
                <p className="mt-3 font-headline text-3xl font-bold text-primary">{item.value}</p>
              </div>
            ))}
          </div>

          {data.emptyStateMessage ? (
            <div className="rounded-[1.2rem] border border-outline-variant/15 bg-surface-container-low px-4 py-4 text-sm leading-6 text-on-surface-variant">
              {data.emptyStateMessage}
            </div>
          ) : null}

          {data.warnings.length > 0 ? (
            <div className="space-y-3 rounded-[1.2rem] border border-[#e7c88c] bg-[#fde9cf] px-4 py-4 text-sm leading-6 text-[#634010]">
              {data.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          ) : null}

          <div className="rounded-[1.2rem] border border-outline-variant/15 bg-surface-container-lowest p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
                  Vista previa de Excel
                </p>
                <h3 className="mt-2 font-headline text-3xl font-bold text-primary">
                  Previsualización de la hoja
                </h3>
              </div>
              <StatusBadge tone={data.rows.length > 9 ? "danger" : "confirmed"}>
                {String(data.rows.length).padStart(2, "0")} filas
              </StatusBadge>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${theme.pill}`}>
                Límite de plantilla: 9 filas
              </span>

              <div className="flex flex-wrap items-center gap-3">
                {excelPrepared ? (
                  <ActionButton
                    type="button"
                    variant="outline"
                    icon={<Mail className="h-4 w-4" />}
                    onClick={openMailPanel}
                    className="hover:-translate-y-0.5 hover:border-primary/35 hover:bg-surface-container-high"
                  >
                    Preparar envío por correo
                  </ActionButton>
                ) : null}

                <ActionButton
                  type="button"
                  variant="primary"
                  icon={<Download className="h-4 w-4" />}
                  onClick={handleGenerateExcel}
                  disabled={!canGenerate}
                >
                  Generar Excel
                </ActionButton>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className={theme.tableHead}>
                  <tr>
                    {["Fecha", "Clase", "Empresa", "Grupo", "Hora", "Horas", "Tarifa", "Importe"].map(
                      (label) => (
                        <th
                          key={label}
                          className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant"
                        >
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/12">
                  {data.rows.length > 0 ? (
                    data.rows.map((row) => (
                      <tr key={row.classId} className="hover:bg-surface-container-low/50">
                        <td className="px-4 py-4 text-sm text-on-surface-variant">{row.date}</td>
                        <td className="px-4 py-4">
                          <p className="max-w-[240px] font-semibold text-primary">{row.title}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-on-surface-variant">{row.company}</td>
                        <td className="px-4 py-4 text-sm text-on-surface-variant">{row.group}</td>
                        <td className="px-4 py-4 text-sm text-primary">{row.time}</td>
                        <td className="px-4 py-4 text-sm text-on-surface-variant">{row.duration}</td>
                        <td className="px-4 py-4 text-sm text-on-surface-variant">{row.rate}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-primary">{row.amount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-sm text-on-surface-variant">
                        {data.emptyStateMessage ?? "No se encontraron clases para el período seleccionado."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SectionFrame>
      {mailPanelMounted ? (
        <div
          className={`fixed inset-0 z-[1200] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${
            mailPanelVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMailPanel}
        >
          <div
            className={`absolute inset-y-0 right-0 w-full max-w-[520px] overflow-y-auto border-l border-outline-variant/15 bg-surface-container-lowest shadow-[-24px_0_60px_rgba(6,27,14,0.16)] transition-transform duration-300 ease-out ${
              mailPanelVisible ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex min-h-full flex-col">
              <div className={`border-b ${theme.cardBorder} ${theme.card} px-6 py-6`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.24em] ${theme.heroText} opacity-70`}>
                      Paso final
                    </p>
                    <h3 className={`mt-3 font-headline text-4xl font-bold ${theme.heroText}`}>
                      Preparar envío
                    </h3>
                    <p className={`mt-3 text-sm leading-6 ${theme.heroText} opacity-85`}>
                      Revisá el asunto y el mensaje antes de enviar el correo simulado.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeMailPanel}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/25 bg-surface text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
                    aria-label="Cerrar panel de envío"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-5 px-6 py-6">
                <div className="flex items-center gap-2">
                  <StatusBadge tone="confirmed">Excel listo</StatusBadge>
                  <StatusBadge tone={sent ? "confirmed" : "review"}>
                    {sent ? "Enviado simulado" : "Borrador"}
                  </StatusBadge>
                </div>

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
                    Asunto
                  </span>
                  <input
                    value={data.emailSubject}
                    readOnly
                    className="mt-2 w-full rounded-[1rem] border border-outline-variant/35 bg-surface px-4 py-3 text-sm text-primary outline-none"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/70">
                    Mensaje de correo
                  </span>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="mt-2 min-h-[260px] w-full rounded-[1rem] border border-outline-variant/35 bg-surface px-4 py-3 text-sm leading-6 text-primary outline-none"
                  />
                </label>

                <div className="flex items-start gap-3 rounded-[1rem] bg-surface-container-low px-4 py-3">
                  <Mail className="mt-0.5 h-4 w-4 text-primary/70" />
                  <div className="text-sm leading-6 text-on-surface-variant">
                    <p className="font-semibold text-primary">El envío sigue siendo simulado</p>
                    <p className="mt-1">
                      El backend de correo todavía no está conectado. Esta acción no envía un email real.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-outline-variant/15 px-6 py-5">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/35 bg-surface px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary transition hover:bg-surface-container-high"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copiado" : "Copiar mensaje"}
                  </button>

                  <button
                    type="button"
                    onClick={handleMockSend}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-primary transition hover:opacity-95"
                  >
                    <Send className="h-4 w-4" />
                    Enviar mensaje simulado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
