/* eslint-disable @typescript-eslint/no-explicit-any */
// resources/js/hooks/useQzTray.ts
import { useCallback } from "react";

const QZ_URL = "https://cdn.jsdelivr.net/gh/qzind/tray/2.2/web/qz-tray.js";

declare global { interface Window { qz?: any } }

export function useQzTray() {
    const loadScript = useCallback(async () => {
        if (window.qz) return;
        await new Promise<void>((res, rej) => {
            const existing = document.querySelector(`script[src="${QZ_URL}"]`) as HTMLScriptElement | null;
            if (existing) {
                existing.addEventListener("load", () => res(), { once: true });
                existing.addEventListener("error", () => rej(new Error("Gagal memuat qz-tray.js")), { once: true });
            } else {
                const s = document.createElement("script");
                s.src = QZ_URL;
                s.async = true;
                s.onload = () => res();
                s.onerror = () => rej(new Error("Gagal memuat qz-tray.js"));
                document.body.appendChild(s);
            }
        });
    }, []);

    const ensureQz = useCallback(async () => {
        await loadScript();
        const qz = window.qz;
        if (!qz) throw new Error("QZ Tray belum tersedia di window");

        try {
            qz.security.setCertificatePromise((resolve: any) =>
                resolve("-----BEGIN CERTIFICATE-----\nDEV CERT ONLY\n-----END CERTIFICATE-----")
            );
            qz.security.setSignaturePromise(() => Promise.resolve(null));
        } catch (e) {
            console.log(e)
        }

        const isHttps = window.location.protocol === "https:";
        if (qz.websocket.setUsingSecure) qz.websocket.setUsingSecure(isHttps);
        if (qz.websocket.setHostname) qz.websocket.setHostname("127.0.0.1");
        if (qz.websocket.setPort) qz.websocket.setPort(isHttps ? 8181 : 8181);

        return qz;
    }, [loadScript]);

    const connectQz = useCallback(async (qz: any) => {
        for (let i = 0; i < 2; i++) {
            if (qz.websocket.isActive()) return;
            try {
                await qz.websocket.connect();
                return;
            } catch (e) {
                await new Promise(r => setTimeout(r, 700));
                if (i === 1) throw e;
            }
        }
    }, []);

    return { ensureQz, connectQz };
}
