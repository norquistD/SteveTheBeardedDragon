"use client";

import { useState, useEffect } from "react";
import { useLocale } from "./IntlProvider";
import LanguageButton from "./LanguageButton";
import SearchButton from "./SearchButton";
import BackButton from "./BackButton";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [languageId, setLanguageId] = useState<number | null>(null);
  const { setLocale } = useLocale();

  useEffect(() => {
    // Fetch languages and set English as default
    const fetchDefaultLanguage = async () => {
      try {
        const response = await fetch("/api/languages");
        const result = await response.json();

        if (result.success && result.data.length > 0) {
          // Find English language (by code 'en' or name 'English')
          const englishLang = result.data.find(
            (lang: any) =>
              lang.language_code === "en" || lang.language_name === "English"
          );

          const selectedLang = englishLang || result.data[0];
          setLanguageId(selectedLang.language_id);
          setLocale(
            selectedLang.language_code,
            selectedLang.language_id,
            selectedLang.language_native_name
          );
        }
      } catch (error) {
        console.error("Failed to fetch languages:", error);
        setLanguageId(1);
      }
    };

    fetchDefaultLanguage();
  }, []);

  const handleLanguageChange = async (newLanguageId: number) => {
    try {
      const response = await fetch("/api/languages");
      const result = await response.json();

      if (result.success) {
        const selectedLang = result.data.find(
          (lang: any) => lang.language_id === newLanguageId
        );

        if (selectedLang) {
          setLanguageId(newLanguageId);
          setLocale(
            selectedLang.language_code,
            newLanguageId,
            selectedLang.language_native_name
          );
        }
      }
    } catch (error) {
      console.error("Failed to update language:", error);
    }
  };

  return (
    <>
      <div className="header">
        <div className="header-left-buttons">
          <BackButton />
          <SearchButton />
        </div>
        <h1>Steve&apos;s Stories</h1>
        <LanguageButton
          languageId={languageId}
          setLanguageId={handleLanguageChange}
        />
      </div>
      <div className="content-wrapper">{children}</div>
    </>
  );
}
