import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locals/en.json";
import ka from "./locals/ka.json";
import ru from "./locals/ru.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ka: { translation: ka },
      ru: { translation: ru },
    },
    lng: "ka",         // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
