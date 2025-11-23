/**
 * Script to clear all contents, blocks, and languages, then insert default languages
 */

const API_URL = process.env.API_URL || "http://localhost:3000";

const DEFAULT_LANGUAGES = [
  {
    language_code: "en",
    language_name: "English",
    language_native_name: "English",
  },
  {
    language_code: "es",
    language_name: "Spanish",
    language_native_name: "Español",
  },
  {
    language_code: "pt",
    language_name: "Portuguese",
    language_native_name: "Português",
  },
  {
    language_code: "ru",
    language_name: "Russian",
    language_native_name: "Русский",
  },
  {
    language_code: "zh",
    language_name: "Chinese",
    language_native_name: "中文",
  },
  {
    language_code: "ja",
    language_name: "Japanese",
    language_native_name: "日本語",
  },
];

async function resetLanguages() {
  try {
    console.log("\n=== Resetting Languages ===\n");

    // 1. Delete all blocks first (they reference contents)
    console.log("Step 1: Deleting all blocks...");
    const blocksResponse = await fetch(`${API_URL}/api/blocks`);
    const blocksResult = await blocksResponse.json();

    if (blocksResult.success && blocksResult.data.length > 0) {
      console.log(`Found ${blocksResult.data.length} blocks to delete`);
      for (const block of blocksResult.data) {
        await fetch(`${API_URL}/api/blocks/${block.block_id}`, {
          method: "DELETE",
        });
      }
      console.log(`✓ Deleted all blocks\n`);
    } else {
      console.log("No blocks found\n");
    }

    // 2. Delete all contents (they reference languages)
    console.log("Step 2: Deleting all contents...");
    const contentsResponse = await fetch(`${API_URL}/api/contents`);
    const contentsResult = await contentsResponse.json();

    if (contentsResult.success && contentsResult.data.length > 0) {
      console.log(`Found ${contentsResult.data.length} contents to delete`);
      for (const content of contentsResult.data) {
        await fetch(`${API_URL}/api/contents/${content.content_id}`, {
          method: "DELETE",
        });
      }
      console.log(`✓ Deleted all contents\n`);
    } else {
      console.log("No contents found\n");
    }

    // 3. Get all existing languages
    console.log("Step 3: Fetching existing languages...");
    const languagesResponse = await fetch(`${API_URL}/api/languages`);
    const languagesResult = await languagesResponse.json();

    if (languagesResult.success && languagesResult.data.length > 0) {
      console.log(`Found ${languagesResult.data.length} existing languages`);

      // 4. Delete all existing languages
      console.log("\nStep 4: Deleting existing languages...");
      for (const language of languagesResult.data) {
        await fetch(`${API_URL}/api/languages/${language.language_id}`, {
          method: "DELETE",
        });
        console.log(
          `✓ Deleted ${language.language_name} (ID: ${language.language_id})`
        );
      }
      console.log();
    } else {
      console.log("No existing languages found\n");
    }

    // 5. Insert default languages
    console.log("Step 5: Creating default languages...");
    const createdLanguages = [];

    for (const language of DEFAULT_LANGUAGES) {
      const response = await fetch(`${API_URL}/api/languages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(language),
      });

      const result = await response.json();
      if (result.success) {
        createdLanguages.push({
          ...language,
          language_id: result.data.language_id,
        });
        console.log(
          `✓ Created ${language.language_name} (${language.language_native_name}) - ID: ${result.data.language_id}`
        );
      } else {
        console.error(
          `✗ Failed to create ${language.language_name}: ${result.error}`
        );
      }
    }

    console.log("\n=== Reset Complete ===\n");
    console.log("Languages created:");
    createdLanguages.forEach((lang) => {
      console.log(
        `  ${lang.language_code}: ${lang.language_name} (${lang.language_native_name}) - ID: ${lang.language_id}`
      );
    });
    console.log();
  } catch (error) {
    console.error("\n✗ Reset failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
resetLanguages();
