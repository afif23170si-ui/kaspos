import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShow(true);
        };

        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
        setShow(false);
    };

    if (!show) return null;

    return (
        <button
            onClick={handleInstall}
            className="
                fixed bottom-4 right-4 flex items-center gap-2
                px-4 py-2 rounded-full shadow-lg
                bg-gray-700/60 hover:bg-gray-700/80
                text-white dark:bg-gray-600/60 dark:hover:bg-gray-600/80
                backdrop-blur-md transition-all duration-200
            "
        >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Install Aplikasi</span>
        </button>



    );
}
