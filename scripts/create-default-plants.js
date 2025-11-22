/**
 * Script to create plants from plants_names.csv
 * Format: Common Name,Scientific Name
 */

const fs = require("fs");
const path = require("path");

const API_URL = process.env.API_URL || "http://localhost:3000";
const CSV_FILE = path.join(__dirname, "..", "plants_names.csv");

// Simple CSV parser that handles quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  // Add last field
  result.push(current.trim());

  return result;
}

async function createPlants() {
  try {
    console.log("\n=== Creating Plants from CSV ===\n");

    // Step 1: Read and parse CSV file
    console.log("Step 1: Reading CSV file...");
    const fileContent = fs.readFileSync(CSV_FILE, "utf-8");
    const lines = fileContent.split("\n").filter((line) => line.trim());

    // Skip header line
    const dataLines = lines.slice(1);
    console.log(`✓ Found ${dataLines.length} plants to process\n`);

    // Step 2: Process each line
    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const parts = parseCSVLine(line);

      if (parts.length < 2) {
        console.warn(`⚠ Skipping invalid line ${i + 2}: Not enough columns`);
        skipCount++;
        continue;
      }

      const plantName = parts[0].replace(/^"|"$/g, "").trim();
      const plantScientificName = parts[1].replace(/^"|"$/g, "").trim();

      // Skip rows with empty plant names or scientific names
      if (!plantName || !plantScientificName || plantName === '""' || plantScientificName === '""') {
        skipCount++;
        continue;
      }

      console.log(
        `\nProcessing (${i + 1}/${dataLines.length}): ${plantName}`
      );

      try {
        const createPlantResponse = await fetch(`${API_URL}/api/plants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plant_name: plantName,
            plant_scientific_name: plantScientificName,
          }),
        });

        const createPlantResult = await createPlantResponse.json();

        if (!createPlantResult.success) {
          throw new Error(
            `Failed to create plant: ${createPlantResult.error}`
          );
        }

        const plantId = createPlantResult.data.plant_id;
        console.log(`  ✓ Created plant (ID: ${plantId})`);
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
    console.log(`- Skipped (empty/invalid): ${skipCount}`);
    console.log(`- Total processed: ${dataLines.length}`);
  } catch (error) {
    console.error("\n✗ Script failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
createPlants();

