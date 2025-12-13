/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";
import axios from "axios";
import React from "react";

declare global { interface Window { qz?: any } }

type Props = {
    invoice: string | undefined;
    endpoint?: string;
    onPrintStart?: () => void;
    onPrintEnd?: (success: boolean) => void;
};

function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

// Load QZ Tray script once
let qzLoaded = false;
async function loadQzTray(): Promise<void> {
    if (qzLoaded && window.qz) return;
    
    return new Promise((resolve, reject) => {
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

export default function PrintKitchenBluetoothButton({ invoice, endpoint, onPrintStart, onPrintEnd }: Props) {
    const [loading, setLoading] = React.useState(false);

    const handlePrintKitchen = React.useCallback(async () => {
        try {
            if (!invoice) {
                alert("❌ Invoice kosong");
                return;
            }

            setLoading(true);
            onPrintStart?.();

            // Get print data from server
            const url = endpoint || `/pos/print-kitchen-bluetooth?invoice=${invoice}`;
            console.log("[PrintKitchen] Fetching from:", url);
            
            const { data } = await axios.get(url, { params: { invoice } });
            console.log("[PrintKitchen] Server response:", { printer: data.printer, hasRaw: !!data.raw });
            
            if (!data?.raw) throw new Error("Payload kosong dari server");

            // Android - use RawBT app
            if (isAndroid()) {
                const rawbtUri = `data:application/rawbt;base64,${data.raw}`;
                window.location.href = rawbtUri;
                onPrintEnd?.(true);
                return;
            }

            // Desktop - use QZ Tray
            await loadQzTray();
            
            if (!window.qz) {
                alert("❌ QZ Tray library tidak tersedia. Refresh halaman.");
                onPrintEnd?.(false);
                return;
            }

            console.log("[PrintKitchen] QZ Tray loaded, connecting...");

            // Connect to QZ Tray
            if (!window.qz.websocket.isActive()) {
                try {
                    await window.qz.websocket.connect();
                } catch (connErr: any) {
                    console.log("[PrintKitchen] First connect failed, retrying...", connErr.message);
                    await new Promise(r => setTimeout(r, 1000));
                    await window.qz.websocket.connect();
                }
            }

            console.log("[PrintKitchen] Connected to QZ Tray, printing to:", data.printer);

            // Create config and print
            const config = window.qz.configs.create(data.printer);
            const printData = [{ type: "raw", format: "base64", data: data.raw }];
            
            await window.qz.print(config, printData);
            console.log("[PrintKitchen] Print sent successfully!");
            onPrintEnd?.(true);

        } catch (err: any) {
            console.error("[PrintKitchen] Error:", err);
            alert("❌ Gagal print dapur: " + (err?.message || err));
            onPrintEnd?.(false);
        } finally {
            // Disconnect
            try {
                if (window.qz?.websocket?.isActive()) {
                    await window.qz.websocket.disconnect();
                }
            } catch { /* ignore */ }
            setLoading(false);
        }
    }, [invoice, endpoint, onPrintStart, onPrintEnd]);

    return (
        <div className="flex flex-col gap-2">
            <Button
                type="button"
                variant="outline"
                className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                onClick={handlePrintKitchen}
                disabled={loading}
            >
                <ChefHat className="size-4 mr-2" />
                {loading ? "Mencetak..." : "Cetak Ulang Dapur"}
            </Button>
        </div>
    );
}

// Export a function for programmatic printing (for auto-print)
export async function printKitchenBluetooth(invoice: string): Promise<boolean> {
    if (!invoice) return false;

    try {
        const url = `/pos/print-kitchen-bluetooth?invoice=${invoice}`;
        console.log("[printKitchenBluetooth] Fetching from:", url);

        const { data } = await axios.get(url, { params: { invoice } });
        if (!data?.raw) throw new Error("Payload kosong dari server");

        // Android
        if (/Android/i.test(navigator.userAgent)) {
            const rawbtUri = `data:application/rawbt;base64,${data.raw}`;
            window.location.href = rawbtUri;
            return true;
        }

        // Desktop - load QZ if needed
        await loadQzTray();

        if (!window.qz) {
            console.error("[printKitchenBluetooth] QZ Tray tidak tersedia");
            return false;
        }

        // Connect
        if (!window.qz.websocket.isActive()) {
            try {
                await window.qz.websocket.connect();
            } catch {
                await new Promise(r => setTimeout(r, 1000));
                await window.qz.websocket.connect();
            }
        }

        // Print
        const config = window.qz.configs.create(data.printer);
        const printData = [{ type: "raw", format: "base64", data: data.raw }];
        await window.qz.print(config, printData);

        // Disconnect
        try {
            if (window.qz?.websocket?.isActive()) {
                await window.qz.websocket.disconnect();
            }
        } catch { /* ignore */ }

        console.log("[printKitchenBluetooth] Success!");
        return true;
    } catch (err) {
        console.error("[printKitchenBluetooth] Error:", err);
        return false;
    }
}
