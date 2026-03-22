import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translations from "./translations";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translations.en },
    hi: { translation: translations.hi },
    bn: { translation: translations.bn },
  },
  lng: localStorage.getItem("language") || "en", // ✅ remember preference
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;