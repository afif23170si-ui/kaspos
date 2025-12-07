import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { AppProvider } from './contexts/app-context';
import InstallPrompt from "@/components/InstallPrompt";
import ErrorBoundary from '@/components/ErrorBoundary';


const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ErrorBoundary>
                <AppProvider>
                    <App {...props} />
                </AppProvider>
            </ErrorBoundary>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("✅ Service Worker registered:", reg))
      .catch((err) => console.log("❌ Service Worker registration failed:", err));
  });
}

function App() {
  return (
    <>
      {/* ...content... */}
      <InstallPrompt />
    </>
  );
}


// This will set light / dark mode on load...
initializeTheme();
