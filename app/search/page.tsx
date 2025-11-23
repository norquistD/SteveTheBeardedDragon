"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import Fuse from "fuse.js";
import { usePlants } from "../components/PlantProvider";
import BackButton from "../components/BackButton";
import "./search.css";

export default function SearchPage() {
  const t = useTranslations("search");
  const { plants } = usePlants();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlants = useMemo(() => {
    if (!searchQuery.trim()) {
      return plants;
    }

    const fuse = new Fuse(plants, {
      keys: ["plant_name", "plant_scientific_name"],
      threshold: 0.3,
      includeScore: true,
    });

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [plants, searchQuery]);

  return (
    <>
      <BackButton />
      <div className="search-page">
        <h1 className="search-title">{t("title")}</h1>
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

        <div className="plants-list">
          {filteredPlants.map((plant) => (
            <div key={plant.plant_id} className="plant-item">
              <h3 className="plant-name">{plant.plant_name}</h3>
              <p className="plant-scientific-name">
                {plant.plant_scientific_name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
