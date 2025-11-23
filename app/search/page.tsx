"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plant } from "@/lib/types";
import Spinner from "../components/Spinner";
import "./search.css";

export default function SearchPage() {
  const router = useRouter();
  const t = useTranslations("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const isInitialMount = useRef(true);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const url = query.trim()
        ? `/api/search?q=${encodeURIComponent(query.trim())}`
        : `/api/search?q=`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setResults(result.data);
      } else {
        setError(result.error || "Failed to search");
        setResults([]);
      }
    } catch (err) {
      setError("Failed to search. Please try again.");
      setResults([]);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load all plants on first mount only
  useEffect(() => {
    if (isInitialMount.current) {
      // Initial load - show all plants
      handleSearch("");
      isInitialMount.current = false;
    }
  }, []); // Only run on mount

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  return (
    <>
      <div className="search-page">
        <h1 className="search-title">{t("title")}</h1>
        <form onSubmit={handleFormSubmit} className="search-form">
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
              disabled={loading}
            />
          </div>
          <button type="submit" className="search-button" disabled={loading}>
            {t("searchButton")}
          </button>
        </form>

        {loading && (
          <div className="search-loading">
            <Spinner size="medium" />
          </div>
        )}

        {error && (
          <div className="search-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && hasSearched && results.length === 0 && (
          <div className="search-no-results">
            <p>No plants found matching &quot;{searchQuery}&quot;</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="search-results">
            <ul className="search-results-list">
              {results.map((plant) => (
                <li
                  key={plant.plant_id}
                  className="search-result-item"
                  onClick={() => router.push(`/plant/${plant.plant_id}`)}
                >
                  <div className="plant-scientific-name">
                    {plant.plant_scientific_name}
                  </div>
                  {plant.plant_scientific_name !== plant.plant_name && (
                    <div className="plant-name">{plant.plant_name}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
