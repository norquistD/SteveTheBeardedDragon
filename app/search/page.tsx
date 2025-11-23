"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import BackButton from "../components/BackButton";
import "./search.css";

export default function SearchPage() {
  const t = useTranslations("search");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality to be implemented
    console.log("Searching for:", searchQuery);
  };

  return (
    <>
      <BackButton />
      <div className="search-page">
        <h1 className="search-title">{t("title")}</h1>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <svg
              className="search-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--dark-green)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("placeholder")}
              className="search-input"
            />
          </div>
        </form>
      </div>
    </>
  );
}
