import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store/store";
import { ThemeProvider }    from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext"; 
import "./i18n/i18n";
import "./assets/custom.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider> {/* ✅ */}
          <App />
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);