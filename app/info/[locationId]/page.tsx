"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "../../components/IntlProvider";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("info");
  const { languageId: contextLanguageId, languageNativeName } = useLocale();
  const languageId = searchParams.get("language_id") || "1";
  const locationId = params.locationId;

  const [pageData, setPageData] = useState<InfoPageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Update URL when context language changes
  useEffect(() => {
    if (contextLanguageId && languageId !== contextLanguageId.toString()) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("language_id", contextLanguageId.toString());
      router.replace(`/info/${locationId}?${params.toString()}`);
    }
  }, [contextLanguageId, locationId, router]);

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

  // Check if content is empty (no title and no content blocks)
  const hasContent =
    pageData.title.trim() !== "" || pageData.content.length > 0;

  if (!hasContent) {
    return (
      <div className="info-page">
        <p
          style={{
            textAlign: "center",
            color: "var(--dark-green)",
            padding: "2rem",
          }}
        >
          {t("notAvailable", {
            language: languageNativeName || "this language",
          })}
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
