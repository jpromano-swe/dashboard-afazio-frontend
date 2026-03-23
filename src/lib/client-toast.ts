"use client";

import { toast } from "vibe-toast";
import { getSafeErrorMessage } from "@/lib/error-messages";

const TOAST_STYLES = {
  success: {
    background: "#e8f6ec",
    color: "#134b25",
    accent: "#2f8f4e",
  },
  warning: {
    background: "#fff2dc",
    color: "#7a4d12",
    accent: "#d48a22",
  },
  error: {
    background: "#fee7e4",
    color: "#7e1711",
    accent: "#cc3d31",
  },
} as const;

type ToastDescription = string | undefined;

function buildDescription(description?: string | null): ToastDescription {
  const value = description?.trim();
  return value ? value : undefined;
}

export function notifySuccess(title: string, description?: string | null) {
  toast.success(title, {
    description: buildDescription(description),
    style: TOAST_STYLES.success,
  });
}

export function notifyWarning(title: string, description?: string | null) {
  toast.warning(title, {
    description: buildDescription(description),
    style: TOAST_STYLES.warning,
  });
}

export function notifyError(
  error: unknown,
  fallbackTitle = "Ocurrió un error inesperado.",
  description?: string | null,
) {
  toast.error(getSafeErrorMessage(error, fallbackTitle), {
    description: buildDescription(description),
    style: TOAST_STYLES.error,
    duration: 5500,
  });
}
