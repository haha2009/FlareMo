import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { I18nProvider } from "@/i18n.tsx";
import { AuthGate } from "@/components/AuthGate";

import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient();
const root = document.getElementById("root");

if (!root) {
  throw new Error("FlareMo root element was not found.");
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ThemeProvider>
          <AuthGate>
            <App />
          </AuthGate>
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  </StrictMode>,
);
