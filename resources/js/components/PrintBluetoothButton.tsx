/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import axios from "axios";
import React from "react";

declare global { interface Window { qz?: any } }

type Props = {
    invoice: string | undefined;
    endpoint: string;
};

function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

export default function PrintBluetoothButton({ invoice, endpoint }: Props) {
    const [qzReady, setQzReady] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
    const [loading, setLoading] = React.useState(false);
    const [lastErr, setLastErr] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (isAndroid()) { setQzReady("idle"); return; }

        let cancelled = false;
        (async () => {
            try {
                setQzReady("loading");

                // Use QZ Tray 2.2.4 (stable release)
                const url = "https://cdn.jsdelivr.net/npm/qz-tray@2.2.4/qz-tray.min.js";
                if (!window.qz) {
                    await new Promise<void>((resolve, reject) => {
                        const existing = document.querySelector(`script[src="${url}"]`) as HTMLScriptElement | null;
                        if (existing) {
                            existing.addEventListener("load", () => resolve(), { once: true });
                            existing.addEventListener("error", () => reject(new Error("Gagal memuat qz-tray.js")), { once: true });
                        } else {
                            const s = document.createElement("script");
                            s.src = url;
                            s.async = true;
                            s.onload = () => resolve();
                            s.onerror = () => reject(new Error("Gagal memuat qz-tray.js"));
                            document.body.appendChild(s);
                        }
                    });
                }

                if (cancelled) return;
                if (!window.qz) throw new Error("QZ Tray belum tersedia di window");

                // DEV cert/signature (ganti di production)
                try {
                    window.qz.security.setCertificatePromise(() =>
                        Promise.resolve("-----BEGIN CERTIFICATE-----\nDEV CERT ONLY\n-----END CERTIFICATE-----")
                    );
                    window.qz.security.setSignaturePromise(() => Promise.resolve(null));
                } catch { /* ignore */ }

                try {
                    const isHttps = window.location.protocol === "https:";
                    window.qz.websocket.setUsingSecure?.(isHttps);
                    window.qz.websocket.setHostname?.("127.0.0.1");
                    window.qz.websocket.setPort?.(8181);
                } catch { /* ignore */ }

                if (!cancelled) setQzReady("ready");
            } catch (e: any) {
                if (!cancelled) {
                    setLastErr(e?.message || String(e));
                    setQzReady("error");
                    console.error("[QZ preload error]", e);
                }
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const handlePrintBT = React.useCallback(async () => {
        setLastErr(null);

        try {
            if (!invoice) {
                alert("❌ Invoice kosong");
                return;
            }

            setLoading(true);

            let url = endpoint;
            try {
                if (typeof route === "function" && !endpoint) {
                    url = route("apps.pos.print-receipt-bluetooth", { invoice });
                }
            } catch(e) {
                console.log(e);
            }

            const { data } = await axios.get(url, { params: { invoice } });
            if (!data?.raw) throw new Error("Payload kosong dari server");

            if (isAndroid()) {
                const rawbtUri = `data:application/rawbt;base64,${data.raw}`;
                window.location.href = rawbtUri;
                // alert("✅ Struk dikirim ke RawBT (Android)");
                return;
            }

            if (!window.qz) {
                // alert("❌ QZ Tray belum siap. Pastikan aplikasi QZ Tray berjalan di komputer kasir.");
                return;
            }

            try {
                const isHttps = window.location.protocol === "https:";
                window.qz.websocket.setUsingSecure?.(isHttps);
                window.qz.websocket.setHostname?.("127.0.0.1");
                window.qz.websocket.setPort?.(8181);
            } catch(e) {
                console.log(e);
            }

            if (!window.qz.websocket.isActive()) {
                try {
                    await window.qz.websocket.connect();
                } catch {
                    await new Promise(r => setTimeout(r, 600));
                    await window.qz.websocket.connect();
                }
            }

            const cfg = window.qz.configs.create(data.printer || null);
            await window.qz.print(cfg, [
                { type: "raw", format: "base64", data: data.raw }
            ]);

            // alert("✅ Struk berhasil dikirim ke printer (QZ Tray)");
        } catch (err: any) {
            console.error("[handlePrintBT] error", err);
            setLastErr(err?.message || String(err));
            alert("❌ Gagal print: " + (err?.message || err));
        } finally {
            try {
                if (window.qz?.websocket.isActive())
                    await window.qz.websocket.disconnect();
            } catch(e) {
                console.log(e);
            }
            setLoading(false);
        }
    }, [invoice, endpoint]);

    return (
        <div className="flex flex-col gap-2">
            <Button
                type="button"
                variant="destructive"
                className="w-full"
                onClick={handlePrintBT}
                disabled={loading || qzReady === "loading"}
            >
                <Printer className="size-4 mr-2" />
                {loading ? "Mencetak..." : "Cetak Struk Kasir"}
            </Button>
        </div>
    );
}
