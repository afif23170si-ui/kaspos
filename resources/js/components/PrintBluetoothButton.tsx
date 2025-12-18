/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Bluetooth, Printer } from "lucide-react";
import axios from "axios";
import React from "react";

declare global { interface Window { qz?: any } }

type Props = {
    invoice: string | undefined;
    endpoint?: string;
};

function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

// Load QZ Tray script once
let qzLoaded = false;
async function loadQzTray(): Promise<void> {
    if (qzLoaded && window.qz) return;
    
    return new Promise((resolve, reject) => {
        // Use direct QZ Tray file from their CDN
        const url = "https://cdn.jsdelivr.net/npm/qz-tray@2.2.5/qz-tray.min.js";
        const existing = document.querySelector(`script[src*="qz-tray"]`) as HTMLScriptElement | null;
        
        if (existing) {
            if (window.qz) {
                qzLoaded = true;
                resolve();
            } else {
                existing.addEventListener("load", () => { qzLoaded = true; resolve(); }, { once: true });
                existing.addEventListener("error", () => reject(new Error("Gagal memuat qz-tray.js")), { once: true });
            }
        } else {
            const s = document.createElement("script");
            s.src = url;
            s.async = true;
            s.onload = () => { qzLoaded = true; resolve(); };
            s.onerror = () => reject(new Error("Gagal memuat qz-tray.js"));
            document.body.appendChild(s);
        }
    });
}

export default function PrintBluetoothButton({ invoice, endpoint }: Props) {
    const [loading, setLoading] = React.useState(false);

    const handlePrintBT = React.useCallback(async () => {
        try {
            if (!invoice) {
                alert("❌ Invoice kosong");
                return;
            }

            setLoading(true);

            // Get print data from server
            const url = endpoint || `/pos/print-receipt-bluetooth?invoice=${invoice}`;
            console.log("[PrintBT] Fetching from:", url);
            
            const { data } = await axios.get(url, { params: { invoice } });
            console.log("[PrintBT] Server response:", { printer: data.printer, hasRaw: !!data.raw });
            
            if (!data?.raw) throw new Error("Payload kosong dari server");

            // Android - use RawBT app
            if (isAndroid()) {
                const rawbtUri = `data:application/rawbt;base64,${data.raw}`;
                window.location.href = rawbtUri;
                return;
            }

            // Desktop - use QZ Tray
            await loadQzTray();
            
            if (!window.qz) {
                alert("❌ QZ Tray library tidak tersedia. Refresh halaman.");
                return;
            }

            console.log("[PrintBT] QZ Tray loaded, connecting...");

            // Connect to QZ Tray
            if (!window.qz.websocket.isActive()) {
                try {
                    await window.qz.websocket.connect();
                } catch (connErr: any) {
                    console.log("[PrintBT] First connect failed, retrying...", connErr.message);
                    await new Promise(r => setTimeout(r, 1000));
                    await window.qz.websocket.connect();
                }
            }

            console.log("[PrintBT] Connected to QZ Tray, printing to:", data.printer);

            // Create config and print
            const config = window.qz.configs.create(data.printer);
            const printData = [{ type: "raw", format: "base64", data: data.raw }];
            
            await window.qz.print(config, printData);
            console.log("[PrintBT] Print sent successfully!");

        } catch (err: any) {
            console.error("[PrintBT] Error:", err);
            alert("❌ Gagal print: " + (err?.message || err));
        } finally {
            // Disconnect
            try {
                if (window.qz?.websocket?.isActive()) {
                    await window.qz.websocket.disconnect();
                }
            } catch { /* ignore */ }
            setLoading(false);
        }
    }, [invoice, endpoint]);

    return (
        <Button
            type="button"
            variant="destructive"
            className="w-full relative"
            onClick={handlePrintBT}
            disabled={loading}
        >
            <div className="relative mr-2">
                <Printer className="size-4" />
                <Bluetooth className="size-2.5 absolute -top-1 -right-1.5 text-white" />
            </div>
            {loading ? "Mencetak..." : "Cetak Struk"}
        </Button>
    );
}
