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
        // Store the raw API data (without fallback) so hasContent check works correctly
        // Apply plant name fallback only for display purposes
        const apiTitle = result.data.title || "";
        const displayTitle = apiTitle || plantName || "";
        setPageData({
          ...result.data,
          title: displayTitle,
          // Store original API title to check if content actually exists
          _apiTitle: apiTitle,
        });
        // Reset web search attempted flag when language or plant changes
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


  // Function to fetch web search results and upload as plant blocks
  const fetchAndUploadWebSearchContent = useCallback(async () => {
    if (!languageId) {
      console.error("Language ID is not available");
      setWebSearching(false);
      return;
    }

    setWebSearching(true);

    try {
      // Find English language
      const englishLanguageId = await findEnglishLanguage();
      if (!englishLanguageId) {
        console.error("English language not found");
        setWebSearching(false);
        return;
      }

      // Check if current language is English
      const isEnglish = parseInt(languageId) === englishLanguageId;

      // First, check if English content already exists in the database
      const englishContentResponse = await fetch(
        `/api/plants/${plantId}/content?language_id=${englishLanguageId}`
      );
      const englishContentResult = await englishContentResponse.json();

      let englishContent: PlantPageData | null = null;
      let englishBlocks: Block[] = [];
      let englishPlantName = plantName || "";

      let hasEnglishContent = false;
      if (englishContentResult.success && englishContentResult.data) {
        englishContent = englishContentResult.data;
        if (englishContent) {
          hasEnglishContent =
            englishContent.title.trim() !== "" || englishContent.content.length > 0;

          if (hasEnglishContent) {
            // Use existing English content from database
            console.log("Using existing English content from database");
            englishBlocks = englishContent.content;
            englishPlantName = englishContent.title || plantName || "";
          }
        }
      }

      // Only do web search if English content doesn't exist
      if (!hasEnglishContent) {
        console.log("English content not found, fetching from web search");
        // Fetch web search results (returns English content)
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
        englishPlantName = plantName || webSearchResult.data.plant_name || "";

        // Convert web search results into Block format (English content)
        // Block 1: Origin (left) and Habitat (right)
        if (botanicalInfo.origin || botanicalInfo.habitat) {
          englishBlocks.push({
            leftType: "paragraph",
            leftContent: botanicalInfo.origin || "",
            rightType: "paragraph",
            rightContent: botanicalInfo.habitat || "",
          });
        }

        // Block 2: Characteristics (left) and Interesting Facts (right)
        if (botanicalInfo.characteristics || botanicalInfo.interesting_facts) {
          englishBlocks.push({
            leftType: "paragraph",
            leftContent: botanicalInfo.characteristics || "",
            rightType: "paragraph",
            rightContent: botanicalInfo.interesting_facts || "",
          });
        }

        // Upload English content to database first (so it can be reused for future translations)
        const englishUploadResponse = await fetch(
          `/api/plants/${plantId}/content`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: englishPlantName,
              content: englishBlocks,
              language_id: englishLanguageId,
            }),
          }
        );

        const englishUploadResult = await englishUploadResponse.json();
        if (!englishUploadResult.success) {
          console.error("Failed to upload English content:", englishUploadResult.error);
          // Continue anyway - we can still translate and upload to target language
        } else {
          console.log("English content saved to database");
          // Update hasEnglishContent and englishContent so we can use it if current language is English
          hasEnglishContent = true;
          englishContent = {
            title: englishPlantName,
            content: englishBlocks,
          };
        }
      }

      // Prepare final title and blocks
      let finalTitle = englishPlantName;
      let finalBlocks = englishBlocks;

      // If current language is English and we have English content, use it directly
      if (isEnglish && hasEnglishContent && englishContent) {
        // English content exists and we're on English - use it directly
        // No need to translate or web search
        console.log("Using existing English content for English language");
        finalTitle = englishContent.title || plantName || "";
        finalBlocks = englishContent.content;
      } else if (!isEnglish) {
        // Need to translate to target language
        // Get current language info
        const currentLangInfo = await getCurrentLanguageInfo();
        if (!currentLangInfo) {
          console.error("Failed to get current language info");
          setWebSearching(false);
          return;
        }

        // Translate title if it exists
        if (englishPlantName.trim() !== "") {
          let translationSuccess = false;
          for (let attempt = 1; attempt <= 3 && !translationSuccess; attempt++) {
            try {
              const translateResponse = await fetch("/api/translate", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  text: englishPlantName,
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
                  finalTitle = translation;
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
        finalBlocks = await Promise.all(
          englishBlocks.map(async (block) => {
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
      }

      // Upload blocks to database (translated or English)
      const uploadResponse = await fetch(
        `/api/plants/${plantId}/content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: finalTitle,
            content: finalBlocks,
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
  // Use _apiTitle (raw API data) to avoid false positives from plant name fallback
  const apiTitle = (pageData as any)?._apiTitle;
  const hasApiTitle = apiTitle !== undefined && apiTitle.trim() !== "";
  const hasContentBlocks = (pageData?.content.length ?? 0) > 0;
  // If _apiTitle exists, use it; otherwise fall back to display title for backwards compatibility
  const hasContent = hasApiTitle || (apiTitle === undefined && pageData?.title.trim() !== "") || hasContentBlocks;

  // Auto-fill with web search if content is empty (only once per language/plant)
  // Web search fetches English content and automatically translates to target language
  useEffect(() => {
    if (
      pageData &&
      !hasContent &&
      !webSearching &&
      !loading &&
      !webSearchAttempted
    ) {
      setWebSearchAttempted(true);
      fetchAndUploadWebSearchContent();
    }
  }, [
    hasContent,
    webSearching,
    loading,
    fetchAndUploadWebSearchContent,
    pageData,
    webSearchAttempted,
  ]);

  if (loading || webSearching || fetchingPlantInfo) {
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

