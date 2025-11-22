/**
 * Script to get blocks and content for a specific location
 */

const API_URL = process.env.API_URL || "http://localhost:3000";
const LOCATION_ID = 5;

async function getLocationContent() {
  try {
    console.log(`\n=== Getting content for Location ID: ${LOCATION_ID} ===\n`);

    // 1. Get location details
    console.log("Step 1: Getting location details...");
    const locationResponse = await fetch(
      `${API_URL}/api/locations/${LOCATION_ID}`
    );
    const locationResult = await locationResponse.json();

    if (locationResult.success) {
      console.log("Location:", locationResult.data);
      console.log();
    } else {
      console.log("Location not found or error:", locationResult.error);
      console.log();
    }

    // 2. Get all blocks for this location
    console.log("Step 2: Getting all blocks...");
    const blocksResponse = await fetch(
      `${API_URL}/api/blocks?location_id=${LOCATION_ID}`
    );
    const blocksResult = await blocksResponse.json();

    if (blocksResult.success) {
      console.log(`Found ${blocksResult.data.length} blocks:`);
      console.log(JSON.stringify(blocksResult.data, null, 2));
      console.log();

      // Show summary
      const titleBlock = blocksResult.data.find((b) => b.position === null);
      const contentBlocks = blocksResult.data.filter(
        (b) => b.position !== null
      );

      console.log("Summary:");
      console.log(`- Title block: ${titleBlock ? "Yes" : "No"}`);
      console.log(`- Content blocks: ${contentBlocks.length}`);
      if (titleBlock) {
        console.log(`- Title block ID: ${titleBlock.block_id}`);
        console.log(`- Title content_id_left: ${titleBlock.content_id_left}`);
      }
      console.log();
    } else {
      console.log("No blocks found or error:", blocksResult.error);
      console.log();
    }

    // 3. Get formatted content for each language
    console.log("Step 3: Getting formatted content by language...");
    const languagesResponse = await fetch(`${API_URL}/api/languages`);
    const languagesResult = await languagesResponse.json();

    if (languagesResult.success && languagesResult.data.length > 0) {
      for (const language of languagesResult.data) {
        console.log(
          `\n--- Content for ${language.language_name} (ID: ${language.language_id}) ---`
        );
        const contentResponse = await fetch(
          `${API_URL}/api/locations/${LOCATION_ID}/content?language_id=${language.language_id}`
        );
        const contentResult = await contentResponse.json();

        if (contentResult.success) {
          console.log("Title:", contentResult.data.title || "(empty)");
          console.log(
            `Content blocks: ${contentResult.data.content.length || 0}`
          );
          if (contentResult.data.content.length > 0) {
            console.log(
              "Content:",
              JSON.stringify(contentResult.data.content, null, 2)
            );
          }
        } else {
          console.log("Error:", contentResult.error);
        }
      }
    }

    console.log("\n=== Done ===\n");
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
getLocationContent();
