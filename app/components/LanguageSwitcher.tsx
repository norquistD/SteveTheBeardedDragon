"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import "./LanguageSwitcher.css";

interface Language {
  language_id: number;
  language_code: string;
  language_name: string;
  language_native_name: string;
}

interface LanguageSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguageId: number;
  onLanguageChange: (languageId: number) => void;
}

export default function LanguageSwitcher({
  isOpen,
  onClose,
  currentLanguageId,
  onLanguageChange,
}: LanguageSwitcherProps) {
  const t = useTranslations("languageSwitcher");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLanguages();
    }
  }, [isOpen]);

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/languages");
      const result = await response.json();

      if (result.success) {
        setLanguages(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch languages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = (languageId: number) => {
    onLanguageChange(languageId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="language-modal-overlay" onClick={onClose}>
      <div className="language-modal" onClick={(e) => e.stopPropagation()}>
        <div className="language-modal-header">
          <h2>{t("title")}</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="language-modal-content">
          {loading ? (
            <p className="loading-text">{t("loading")}</p>
          ) : (
            <div className="language-list">
              {languages.map((language) => (
                <button
                  key={language.language_id}
                  className={`language-item ${
                    language.language_id === currentLanguageId ? "active" : ""
                  }`}
                  onClick={() => handleLanguageSelect(language.language_id)}
                >
                  <span className="language-native">
                    {language.language_native_name}
                  </span>
                  <span className="language-name">
                    {language.language_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
