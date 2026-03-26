"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { ActionButton } from "@/components/editorial";
import { RateCreateForm } from "@/components/rate-create-form";
import type { ConsultoraResponse } from "@/lib/backend";

type RateCreateModalProps = {
  activeConsultoras: ConsultoraResponse[];
};

export function RateCreateModal({ activeConsultoras }: RateCreateModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const enterTimer = window.setTimeout(() => setVisible(true), 10);

    return () => window.clearTimeout(enterTimer);
  }, [mounted]);

  function handleOpen() {
    setMounted(true);
  }

  function handleClose() {
    setVisible(false);
    window.setTimeout(() => setMounted(false), 220);
  }

  return (
    <>
      <ActionButton
        variant="primary"
        icon={<Plus className="h-4 w-4" />}
        onClick={handleOpen}
      >
        Nueva tarifa
      </ActionButton>

      {mounted ? (
        <div
          className={`fixed inset-0 z-50 flex items-end justify-end p-4 backdrop-blur-[2px] transition-all duration-200 ease-out sm:p-6 ${
            visible ? "bg-black/20 opacity-100" : "bg-black/0 opacity-0"
          }`}
          onClick={handleClose}
        >
          <div
            className={`w-full max-w-2xl rounded-[1.6rem] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_24px_80px_rgba(6,27,14,0.16)] transition-all duration-250 ease-out sm:p-8 ${
              visible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-6 scale-[0.98] opacity-0"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant/70">
                  Tarifa
                </p>
                <h3 className="mt-2 font-headline text-3xl font-bold text-primary">
                  Nueva tarifa
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
                  Elegí la consultora, definí la vigencia y guardá la nueva tarifa en ARS.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/30 bg-surface text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
                aria-label="Cerrar modal de tarifa"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <RateCreateForm activeConsultoras={activeConsultoras} onSuccess={handleClose} />
          </div>
        </div>
      ) : null}
    </>
  );
}
