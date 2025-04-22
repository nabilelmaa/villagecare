import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import Backend from "i18next-http-backend"

import translationEN from "./locales/en/translation.json"
import translationFR from "./locales/fr/translation.json"
import translationAR from "./locales/ar/translation.json"

const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  },
  ar: {
    translation: translationAR,
  },
}

i18n

  .use(Backend)

  .use(LanguageDetector)

  .use(initReactI18next)

  .init({
    resources,
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",

    interpolation: {
      escapeValue: false,
    },


    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "language",
      caches: ["localStorage"],
    },


    react: {
      useSuspense: true,
    },
  })

export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language)

  if (language === "ar") {
    document.documentElement.dir = "rtl"
    document.documentElement.lang = "ar"
    document.body.classList.add("rtl")
  } else {
    document.documentElement.dir = "ltr"
    document.documentElement.lang = language
    document.body.classList.remove("rtl")
  }


  localStorage.setItem("language", language)
}

const currentLanguage = i18n.language || localStorage.getItem("language") || "en"
if (currentLanguage === "ar") {
  document.documentElement.dir = "rtl"
  document.documentElement.lang = "ar"
  document.body.classList.add("rtl")
}

export default i18n
