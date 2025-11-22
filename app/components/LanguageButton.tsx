"use client";

import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";

interface LanguageButtonProps {
  languageId: number | null;
  setLanguageId: (id: number) => void;
}

export default function LanguageButton({
  languageId,
  setLanguageId,
}: LanguageButtonProps) {
  const [isLanguageSwitcherOpen, setIsLanguageSwitcherOpen] = useState(false);

  const handleLanguageClick = () => {
    setIsLanguageSwitcherOpen(true);
  };

  const handleLanguageChange = (newLanguageId: number) => {
    setLanguageId(newLanguageId);
  };

  if (languageId === null) {
    return null; // Don't render until we have a language
  }

  return (
    <>
      <button
        onClick={handleLanguageClick}
        className="language-button"
        aria-label="Change language"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--cream)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </button>

      <LanguageSwitcher
        isOpen={isLanguageSwitcherOpen}
        onClose={() => setIsLanguageSwitcherOpen(false)}
        currentLanguageId={languageId}
        onLanguageChange={handleLanguageChange}
      />
    </>
  );
}
