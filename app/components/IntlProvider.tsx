"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { NextIntlClientProvider } from "next-intl";
import Spinner from "./Spinner";

const LocaleContext = createContext<{
  locale: string;
  languageId: number | null;
  languageNativeName: string;
  setLocale: (
    locale: string,
    languageId: number,
    languageNativeName: string
  ) => void;
}>({
  locale: "en",
  languageId: null,
  languageNativeName: "English",
  setLocale: () => {},
});

export function useLocale() {
  return useContext(LocaleContext);
}

export default function IntlProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState("en");
  const [languageId, setLanguageId] = useState<number | null>(null);
  const [languageNativeName, setLanguageNativeName] = useState("English");
  const [messages, setMessages] = useState({});
  const [error, setError] = useState<string | null>(null);

  // Fetch English language on mount
  useEffect(() => {
    const fetchEnglishLanguage = async () => {
      try {
        const response = await fetch("/api/languages");
        const result = await response.json();

        if (!result.success) {
          throw new Error("Failed to fetch languages from API");
        }

        if (!result.data || result.data.length === 0) {
          throw new Error("No languages found in database");
        }

        // Find English language (by code 'en' or name 'English')
        const englishLang = result.data.find(
          (lang: { language_code: string; language_name: string }) =>
            lang.language_code === "en" || lang.language_name === "English"
        );

        if (!englishLang) {
          throw new Error("English language not found in database. English language is required.");
        }

        // Set the English language
        setLanguageId(englishLang.language_id);
        setLocaleState(englishLang.language_code);
        setLanguageNativeName(englishLang.language_native_name);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize language";
        console.error("IntlProvider error:", errorMessage);
        setError(errorMessage);
      }
    };

    fetchEnglishLanguage();
  }, []);

  useEffect(() => {
    if (locale) {
      loadMessages(locale);
    }
  }, [locale]);

  const loadMessages = async (loc: string) => {
    try {
      const msgs = await import(`../../messages/${loc}.json`);
      setMessages(msgs.default);
    } catch (error) {
      console.error(`Failed to load messages for locale ${loc}:`, error);
      // Fallback to English if locale messages don't exist
      if (loc !== "en") {
        const msgs = await import(`../../messages/en.json`);
        setMessages(msgs.default);
      }
    }
  };

  const setLocale = (
    newLocale: string,
    newLanguageId: number,
    newLanguageNativeName: string
  ) => {
    setLocaleState(newLocale);
    setLanguageId(newLanguageId);
    setLanguageNativeName(newLanguageNativeName);
  };

  // Show error if English language not found
  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#d32f2f" }}>
        <h1>Language Initialization Error</h1>
        <p>{error}</p>
        <p>Please ensure the English language exists in the database.</p>
      </div>
    );
  }

  // Don't render children until language is loaded
  if (languageId === null) {
    return (
      <div className="spinner-container">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <LocaleContext.Provider
      value={{ locale, languageId, languageNativeName, setLocale }}
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
