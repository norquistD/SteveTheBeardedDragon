/**
 * Script to create default locations from default_routes.csv
 * Format: route_id, section, x, y, location_name, content (rest of line)
 */

const fs = require("fs");
const path = require("path");

const API_URL = process.env.API_URL || "http://localhost:3000";
const CSV_FILE = path.join(__dirname, "default_routes.csv");

async function createDefaultLocations() {
  try {
    console.log("\n=== Creating Default Locations ===\n");

    // Step 1: Get English language ID
    console.log("Step 1: Fetching English language ID...");
    const languagesResponse = await fetch(`${API_URL}/api/languages`);
    const languagesResult = await languagesResponse.json();

    if (!languagesResult.success) {
      throw new Error(`Failed to fetch languages: ${languagesResult.error}`);
    }

    const englishLang = languagesResult.data.find(
      (lang) => lang.language_code === "en"
    );

    if (!englishLang) {
      throw new Error("English language not found in database");
    }

    const languageId = englishLang.language_id;
    console.log(`✓ Found English language (ID: ${languageId})\n`);

    // Step 2: Read and parse CSV file
    console.log("Step 2: Reading CSV file...");
    const fileContent = fs.readFileSync(CSV_FILE, "utf-8");
    const lines = fileContent.split("\n").filter((line) => line.trim());

    // Skip header line
    const dataLines = lines.slice(1);
    console.log(`✓ Found ${dataLines.length} locations to create\n`);

    // Step 3: Process each line
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];

      // Parse line manually: route_id, section, x, y, location_name, content...
      // Split only the first 5 commas, rest is content
      const parts = line.split(",");

      if (parts.length < 6) {
        console.warn(`⚠ Skipping invalid line ${i + 2}: Not enough columns`);
        failCount++;
        continue;
      }

      const routeId = parseInt(parts[0]);
      const section = parts[1];
      const positionX = parseFloat(parts[2]);
      const positionY = parseFloat(parts[3]);
      const locationName = parts[4];
      const imageUrl = parts[5];
      // Everything after the 5th column is content (may contain commas)
      let content = parts.slice(6).join(",").trim();

      content = content.replace(/,+$/, "").replaceAll('"', "");

      // Validate data
      if (
        isNaN(routeId) ||
        isNaN(positionX) ||
        isNaN(positionY) ||
        !locationName
      ) {
        console.warn(`⚠ Skipping invalid line ${i + 2}: Invalid data format`);
        failCount++;
        continue;
      }

      console.log(
        `\nProcessing (${i + 1}/${dataLines.length}): ${locationName}`
      );

      try {
        // Step 3a: Create location
        const createLocationResponse = await fetch(`${API_URL}/api/locations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tour_id: routeId,
            location_name: locationName,
            position_x: positionX,
            position_y: positionY,
            location_label: section,
          }),
        });

        const createLocationResult = await createLocationResponse.json();

        if (!createLocationResult.success) {
          throw new Error(
            `Failed to create location: ${createLocationResult.error}`
          );
        }

        const locationId = createLocationResult.data.location_id;
        console.log(`  ✓ Created location (ID: ${locationId})`);

        // Step 3b: Create content using PUT endpoint
        const contentData = {
          title: locationName,
          language_id: languageId,
          content: content
            ? [
                {
                  leftType: "paragraph",
                  leftContent: content,
                  rightType: "url",
                  rightContent: imageUrl || "",
                },
              ]
            : [],
        };

        const putContentResponse = await fetch(
          `${API_URL}/api/locations/${locationId}/content`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contentData),
          }
        );

        const putContentResult = await putContentResponse.json();

        if (!putContentResult.success) {
          throw new Error(
            `Failed to create content: ${putContentResult.error}`
          );
        }

        console.log(`  ✓ Created content (title + 1 block)`);
        successCount++;
      } catch (error) {
        console.error(`  ✗ Failed: ${error.message}`);
        failCount++;
      }
    }

    console.log("\n=== Creation Complete ===\n");
    console.log(`Summary:`);
    console.log(`- Successfully created: ${successCount}`);
    console.log(`- Failed: ${failCount}`);
    console.log(`- Total: ${dataLines.length}`);
  } catch (error) {
    console.error("\n✗ Script failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
createDefaultLocations();
