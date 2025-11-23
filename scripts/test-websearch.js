/**
 * Script to test the web search endpoint
 * Tests the /api/plants/[id]/websearch endpoint
 */

const API_URL = process.env.API_URL || "http://localhost:3000";

// Get plant ID from command line arguments or use default
const plantId = process.argv[2] || "1122"; // Default to Beaver Tail Cactus

async function testWebSearch() {
  try {
    console.log("Testing Web Search Endpoint...\n");

    console.log("Plant ID:", plantId);
    console.log("");

    const url = `${API_URL}/api/plants/${plantId}/websearch`;
    console.log("Making GET request to:", url);
    console.log("");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Unknown error",
      }));
      console.error("✗ Failed to fetch web search results");
      console.error("Status:", response.status);
      console.error("Error:", errorData);
      process.exit(1);
    }

    const result = await response.json();

    if (result.success) {
      console.log("✓ Web search successful!");
      console.log("\nPlant Information:");
      console.log(`  Plant ID: ${result.data.plant_id}`);
      console.log(`  Plant Name: ${result.data.plant_name}`);
      console.log(
        `  Scientific Name: ${result.data.plant_scientific_name}`
      );
      console.log("\nBotanical Information:");
      const info = result.data.botanical_info;
      if (info.origin) {
        console.log(`  Origin: ${info.origin}`);
      }
      if (info.habitat) {
        console.log(`  Habitat: ${info.habitat}`);
      }
      if (info.characteristics) {
        console.log(`  Characteristics: ${info.characteristics}`);
      }
      if (info.interesting_facts) {
        console.log(`  Interesting Facts: ${info.interesting_facts}`);
      }
      console.log("\nFull Response:");
      console.log(JSON.stringify(result, null, 2));
      console.log("\n=== Test completed! ===");
    } else {
      console.error("✗ Web search failed");
      console.error("Error:", result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error("✗ Error:", error.message);
    if (error.message.includes("fetch")) {
      console.error("\n💡 Make sure the development server is running:");
      console.error("   npm run dev");
    }
    process.exit(1);
  }
}

// Run the test
testWebSearch();

