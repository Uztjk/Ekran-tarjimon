import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { UiLangProvider } from "./contexts/UiLangContext.tsx";
import "./index.css";

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <UiLangProvider>
      <App />
    </UiLangProvider>
  </AuthProvider>
);
