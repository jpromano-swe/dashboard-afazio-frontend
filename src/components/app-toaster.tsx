"use client";

import { Toaster } from "vibe-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      theme="light"
      duration={4200}
    />
  );
}
