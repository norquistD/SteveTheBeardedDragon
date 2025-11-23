"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "../../components/IntlProvider";
import { type Block, BlockCard } from "../../info/BlockCard";
import Spinner from "../../components/Spinner";
import "../../info/InfoPage.css";

export interface PlantPageData {
  title: string;
  content: Block[];
}

export default function PlantPage({
  params,
}: {
  params: { plantId: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("info");
  const { languageId: contextLanguageId, languageNativeName } = useLocale();
  const languageId = searchParams.get("language_id") || contextLanguageId?.toString();
  const plantId = params.plantId;

  const [pageData, setPageData] = useState<PlantPageData | null>(null);
  const [plantName, setPlantName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchingPlantInfo, setFetchingPlantInfo] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [translating, setTranslating] = useState<boolean>(false);
  const [translationAttempted, setTranslationAttempted] = useState<boolean>(false);
  const [webSearching, setWebSearching] = useState<boolean>(false);
  const [webSearchAttempted, setWebSearchAttempted] = useState<boolean>(false);

  // Update URL when context language changes
  useEffect(() => {
    if (contextLanguageId && languageId !== contextLanguageId.toString()) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("language_id", contextLanguageId.toString());
      router.replace(`/plant/${plantId}?${params.toString()}`);
    }
  }, [contextLanguageId, plantId, router, searchParams, languageId]);

  // Fetch plant name
  useEffect(() => {
    const fetchPlantName = async () => {
      setFetchingPlantInfo(true);
      try {
        const response = await fetch(`/api/plants/${plantId}`);
        const result = await response.json();
        if (result.success) {
          setPlantName(result.data.plant_name);
        }
      } catch (err) {
        console.error("Failed to fetch plant name:", err);
      } finally {
        setFetchingPlantInfo(false);
      }
    };
    fetchPlantName();
  }, [plantId]);

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/plants/${plantId}/content?language_id=${languageId}`
      );
      const result = await response.json();

      if (result.success) {
        // Use plant name as title if title from blocks is empty
        const title = result.data.title || plantName || "";
        setPageData({
          ...result.data,
          title,
        });
        // Reset translation and web search attempted flags when language or plant changes
        setTranslationAttempted(false);
        setWebSearchAttempted(false);
      } else {
        setError(result.error || "Failed to load content");
      }
    } catch (err) {
      setError("Failed to fetch page data");
      console.error("Failed to fetch page data:", err);
    } finally {
      setLoading(false);
    }
  }, [plantId, languageId, plantName]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  // Helper function to find English language
  const findEnglishLanguage = async (): Promise<number | null> => {
    try {
      const response = await fetch("/api/languages");
      const result = await response.json();

      if (result.success) {
        const englishLang = result.data.find(
          (lang: { language_code: string; language_name: string }) =>
            lang.language_code === "en" || lang.language_name === "English"
        );
        return englishLang ? englishLang.language_id : null;
      }
      return null;
    } catch (err) {
      console.error("Failed to find English language:", err);
      return null;
    }
  };

  // Helper function to get current language info
  const getCurrentLanguageInfo = async (): Promise<{ name: string } | null> => {
    try {
      const response = await fetch(`/api/languages/${languageId}`);
      const result = await response.json();

      if (result.success) {
        return { name: result.data.language_name };
      }
      return null;
    } catch (err) {
      console.error("Failed to get current language info:", err);
      return null;
    }
  };

  // Helper function to moderate text
  const moderateText = async (text: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/moderate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: text }),
      });

      const result = await response.json();
      if (result.success && result.data.results && result.data.results.length > 0) {
        // Return true if content is safe (not flagged)
        return !result.data.results[0].flagged;
      }
      // If moderation fails, assume unsafe to be cautious
      return false;
    } catch (err) {
      console.error("Failed to moderate text:", err);
      // If moderation fails, assume unsafe to be cautious
      return false;
    }
  };

  // Function to translate and upload content
  const translateAndUploadContent = useCallback(async () => {
    if (!languageId) {
      console.error("Language ID is not available");
      setTranslating(false);
      return;
    }

    setTranslating(true);

    try {
      // Find English language
      const englishLanguageId = await findEnglishLanguage();
      if (!englishLanguageId) {
        console.error("English language not found");
        setTranslating(false);
        return;
      }

      // Skip translation if current language is English (English content should already exist)
      if (languageId && parseInt(languageId) === englishLanguageId) {
        console.log("Current language is English, skipping translation");
        setTranslating(false);
        return;
      }

      // Get current language info
      const currentLangInfo = await getCurrentLanguageInfo();
      if (!currentLangInfo) {
        console.error("Failed to get current language info");
        setTranslating(false);
        return;
      }

      // Fetch English content
      const englishContentResponse = await fetch(
        `/api/plants/${plantId}/content?language_id=${englishLanguageId}`
      );
      const englishContentResult = await englishContentResponse.json();

      if (!englishContentResult.success) {
        console.error("Failed to fetch English content");
        setTranslating(false);
        return;
      }

      const englishContent: PlantPageData = englishContentResult.data;

      // Check if English content exists and has content
      const hasEnglishContent =
        englishContent.title.trim() !== "" || englishContent.content.length > 0;

      if (!hasEnglishContent) {
        console.error("English content is empty");
        setTranslating(false);
        return;
      }

      // Translate title if it exists
      let translatedTitle = englishContent.title;
      if (englishContent.title.trim() !== "") {
        let translationSuccess = false;
        for (let attempt = 1; attempt <= 3 && !translationSuccess; attempt++) {
          try {
            const translateResponse = await fetch("/api/translate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text: englishContent.title,
                source_language: "English",
                target_language: currentLangInfo.name,
              }),
            });

            const translateResult = await translateResponse.json();
            if (translateResult.success) {
              const translation = translateResult.data.translation;
              // Moderate the translated title
              const isSafe = await moderateText(translation);
              if (isSafe) {
                translatedTitle = translation;
                translationSuccess = true;
              } else {
                console.warn(`Translated title failed moderation (attempt ${attempt}/3)`);
              }
            }
          } catch (err) {
            console.error(`Failed to translate title (attempt ${attempt}/3):`, err);
          }
        }
        if (!translationSuccess) {
          console.warn("All translation attempts failed moderation, using English title");
        }
      }

      // Translate content blocks
      const translatedBlocks: Block[] = await Promise.all(
        englishContent.content.map(async (block) => {
          let translatedLeftContent = block.leftContent;
          let translatedRightContent = block.rightContent;

          // Translate left content if it's a paragraph
          if (block.leftType === "paragraph" && block.leftContent.trim() !== "") {
            let translationSuccess = false;
            for (let attempt = 1; attempt <= 3 && !translationSuccess; attempt++) {
              try {
                const translateResponse = await fetch("/api/translate", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    text: block.leftContent,
                    source_language: "English",
                    target_language: currentLangInfo.name,
                  }),
                });

                const translateResult = await translateResponse.json();
                if (translateResult.success) {
                  const translation = translateResult.data.translation;
                  // Moderate the translated content
                  const isSafe = await moderateText(translation);
                  if (isSafe) {
                    translatedLeftContent = translation;
                    translationSuccess = true;
                  } else {
                    console.warn(`Translated left content failed moderation (attempt ${attempt}/3)`);
                  }
                }
              } catch (err) {
                console.error(`Failed to translate left content (attempt ${attempt}/3):`, err);
              }
            }
            if (!translationSuccess) {
              console.warn("All translation attempts failed moderation, using English for left content");
            }
          }

          // Translate right content if it's a paragraph
          if (block.rightType === "paragraph" && block.rightContent.trim() !== "") {
            let translationSuccess = false;
            for (let attempt = 1; attempt <= 3 && !translationSuccess; attempt++) {
              try {
                const translateResponse = await fetch("/api/translate", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    text: block.rightContent,
                    source_language: "English",
                    target_language: currentLangInfo.name,
                  }),
                });

                const translateResult = await translateResponse.json();
                if (translateResult.success) {
                  const translation = translateResult.data.translation;
                  // Moderate the translated content
                  const isSafe = await moderateText(translation);
                  if (isSafe) {
                    translatedRightContent = translation;
                    translationSuccess = true;
                  } else {
                    console.warn(`Translated right content failed moderation (attempt ${attempt}/3)`);
                  }
                }
              } catch (err) {
                console.error(`Failed to translate right content (attempt ${attempt}/3):`, err);
              }
            }
            if (!translationSuccess) {
              console.warn("All translation attempts failed moderation, using English for right content");
            }
          }

          return {
            leftType: block.leftType,
            leftContent: translatedLeftContent,
            rightType: block.rightType,
            rightContent: translatedRightContent,
          };
        })
      );

      // Upload translated content
      const uploadResponse = await fetch(
        `/api/plants/${plantId}/content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: translatedTitle,
            content: translatedBlocks,
            language_id: parseInt(languageId),
          }),
        }
      );

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        console.error("Failed to upload translated content:", uploadResult.error);
        setTranslating(false);
        return;
      }

      // Refetch page data to show translated content
      await fetchPageData();
    } catch (err) {
      console.error("Error in translateAndUploadContent:", err);
    } finally {
      setTranslating(false);
    }
  }, [plantId, languageId, fetchPageData]);

  // Function to fetch web search results and upload as plant blocks
  const fetchAndUploadWebSearchContent = useCallback(async () => {
    if (!languageId) {
      console.error("Language ID is not available");
      setWebSearching(false);
      return;
    }

    setWebSearching(true);

    try {
      // Fetch web search results
      const webSearchResponse = await fetch(
        `/api/plants/${plantId}/websearch`
      );
      const webSearchResult = await webSearchResponse.json();

      if (!webSearchResult.success || !webSearchResult.data.botanical_info) {
        console.error("Failed to fetch web search results");
        setWebSearching(false);
        return;
      }

      const botanicalInfo = webSearchResult.data.botanical_info;
      const plantNameForTitle = plantName || webSearchResult.data.plant_name || "";

      // Convert web search results into Block format
      const blocks: Block[] = [];

      // Block 1: Origin (left) and Habitat (right)
      if (botanicalInfo.origin || botanicalInfo.habitat) {
        blocks.push({
          leftType: "paragraph",
          leftContent: botanicalInfo.origin || "",
          rightType: "paragraph",
          rightContent: botanicalInfo.habitat || "",
        });
      }

      // Block 2: Characteristics (left) and Interesting Facts (right)
      if (botanicalInfo.characteristics || botanicalInfo.interesting_facts) {
        blocks.push({
          leftType: "paragraph",
          leftContent: botanicalInfo.characteristics || "",
          rightType: "paragraph",
          rightContent: botanicalInfo.interesting_facts || "",
        });
      }

      // Upload blocks to database
      const uploadResponse = await fetch(
        `/api/plants/${plantId}/content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: plantNameForTitle,
            content: blocks,
            language_id: parseInt(languageId),
          }),
        }
      );

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        console.error("Failed to upload web search content:", uploadResult.error);
        setWebSearching(false);
        return;
      }

      // Refetch page data to show the new content
      await fetchPageData();
    } catch (err) {
      console.error("Error in fetchAndUploadWebSearchContent:", err);
    } finally {
      setWebSearching(false);
    }
  }, [plantId, languageId, plantName, fetchPageData]);

  // Check if content is empty (no title and no content blocks)
  const hasContent =
    pageData?.title.trim() !== "" || (pageData?.content.length ?? 0) > 0;

  // Auto-fill with web search if content is empty (only once per language/plant)
  // Try web search first, then fall back to translation if web search fails
  useEffect(() => {
    if (
      pageData &&
      !hasContent &&
      !webSearching &&
      !translating &&
      !loading &&
      !webSearchAttempted
    ) {
      setWebSearchAttempted(true);
      fetchAndUploadWebSearchContent();
    }
  }, [
    hasContent,
    webSearching,
    translating,
    loading,
    fetchAndUploadWebSearchContent,
    pageData,
    webSearchAttempted,
  ]);

  // Auto-translate if content is still empty after web search (only once per language/plant)
  useEffect(() => {
    if (
      pageData &&
      !hasContent &&
      !translating &&
      !webSearching &&
      !loading &&
      webSearchAttempted &&
      !translationAttempted
    ) {
      setTranslationAttempted(true);
      translateAndUploadContent();
    }
  }, [
    hasContent,
    translating,
    webSearching,
    loading,
    translateAndUploadContent,
    pageData,
    translationAttempted,
    webSearchAttempted,
  ]);

  if (loading || translating || webSearching || fetchingPlantInfo) {
    return (
      <>
        <div className="info-page">
          <div className="spinner-container">
            <Spinner size="large" />
          </div>
        </div>
      </>
    );
  }

  if (error || !pageData) {
    return (
      <>
        <div className="info-page">
          <p style={{ textAlign: "center", color: "var(--dark-green)" }}>
            {error || "No content found"}
          </p>
        </div>
      </>
    );
  }

  if (!hasContent) {
    return (
      <>
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
      </>
    );
  }

  return (
    <>
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
    </>
  );
}

