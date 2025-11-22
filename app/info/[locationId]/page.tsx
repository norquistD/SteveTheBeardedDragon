"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { type Block, BlockCard } from "../BlockCard";
import "../InfoPage.css";

export interface InfoPageData {
  title: string;
  content: Block[];
}

export default function InfoPage({
  params,
}: {
  params: { locationId: string };
}) {
  const searchParams = useSearchParams();
  const languageId = searchParams.get("language_id") || "1";
  const locationId = params.locationId;

  const [pageData, setPageData] = useState<InfoPageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPageData();
  }, [locationId, languageId]);

  const fetchPageData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/locations/${locationId}/content?language_id=${languageId}`
      );
      const result = await response.json();

      if (result.success) {
        setPageData(result.data);
      } else {
        setError(result.error || "Failed to load content");
      }
    } catch (err) {
      setError("Failed to fetch page data");
      console.error("Failed to fetch page data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="info-page">
        <p style={{ textAlign: "center", color: "var(--dark-green)" }}>
          Loading...
        </p>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="info-page">
        <p style={{ textAlign: "center", color: "var(--dark-green)" }}>
          {error || "No content found"}
        </p>
      </div>
    );
  }

  return (
    <div className="info-page">
      <h1>{pageData.title}</h1>
      <div className="info-body">
        {pageData.content.map((block, index) => (
          <BlockCard
            key={index}
            leftType={block.leftType}
            leftContent={block.leftContent}
            rightType={block.rightType}
            rightContent={block.rightContent}
          />
        ))}
      </div>
    </div>
  );
}
