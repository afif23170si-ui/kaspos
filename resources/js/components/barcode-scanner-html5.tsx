// resources/js/components/barcode-scanner-html5.tsx
import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerHtml5Props {
  onScanSuccess: (decodedText: string) => void;
}

export default function BarcodeScannerHtml5({ onScanSuccess }: BarcodeScannerHtml5Props) {
  useEffect(() => {
    const scannerId = 'html5-qrcode-scanner';
    const config = {
      fps: 10,
      qrbox: { width: 260, height: 360 },
    };

    const scanner = new Html5QrcodeScanner(scannerId, config, false);

    setTimeout(() => {
      scanner.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          scanner.clear();
        },
        (error) => {
          // optional: console.warn(error);
        }
      );
    }, 100); // Delay agar elemen siap

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScanSuccess]);

  return <div id="html5-qrcode-scanner" className="w-full h-full" />;
}
