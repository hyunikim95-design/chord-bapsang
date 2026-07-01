"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const isProduction = process.env.NODE_ENV === "production";

    if (typeof window === "undefined") return;

    if (isProduction && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
    }

    function handleBeforeInstallPrompt(event: Event) {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean })
          .standalone === true;

      if (standalone) return;

      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  async function installApp() {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
    }
  }

  if (!installPrompt) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md rounded-lg border border-blue-900/40 bg-[#02040A]/95 p-3 text-[#E5E7EB] shadow-2xl shadow-black/50 backdrop-blur">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-[#64748B]">
            Install App
          </p>
          <p className="mt-1 break-words text-sm font-bold text-[#CBD5E1]">
            코드밥상을 설치해서 연습 앱처럼 열기
          </p>
        </div>
        <button
          type="button"
          onClick={installApp}
          className="shrink-0 rounded-md bg-[#1E40AF] px-3 py-2 text-xs font-black text-white transition hover:bg-[#2563EB]"
        >
          설치
        </button>
      </div>
    </div>
  );
}
