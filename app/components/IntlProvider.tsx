"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { NextIntlClientProvider } from "next-intl";

const LocaleContext = createContext<{
  locale: string;
  languageId: number;
  languageNativeName: string;
  setLocale: (locale: string, languageId: number, languageNativeName: string) => void;
}>({ locale: "en", languageId: 4, languageNativeName: "English", setLocale: () => {} });

export function useLocale() {
  return useContext(LocaleContext);
}

export default function IntlProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState("en");
  const [languageId, setLanguageId] = useState(4); // Default to English
  const [languageNativeName, setLanguageNativeName] = useState("English");
  const [messages, setMessages] = useState({});

  useEffect(() => {
    loadMessages(locale);
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

  const setLocale = (newLocale: string, newLanguageId: number, newLanguageNativeName: string) => {
    setLocaleState(newLocale);
    setLanguageId(newLanguageId);
    setLanguageNativeName(newLanguageNativeName);
  };

  return (
    <LocaleContext.Provider value={{ locale, languageId, languageNativeName, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
