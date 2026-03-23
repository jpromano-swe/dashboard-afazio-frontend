export function getSafeErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const rawMessage = String((error as { message?: unknown }).message ?? "").trim();

    if (rawMessage) {
      return rawMessage
        .replace(/^error:\s*/i, "")
        .split("\n")[0]
        .trim()
        .slice(0, 220);
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
      .replace(/^error:\s*/i, "")
      .split("\n")[0]
      .trim()
      .slice(0, 220);
  }

  return fallback;
}
