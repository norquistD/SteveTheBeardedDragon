/**
 * Script to test the GET /api/locations/[id]/content endpoint
 * This endpoint returns InfoPageData with title and content blocks
 */

const API_URL = process.env.API_URL || "http://localhost:3000";

async function testLocationContent() {
  let locationId;
  let languageId;
  let tourId;
  let titleContentId;
  let leftContentId1;
  let rightContentId1;
  let leftContentId2;
  let rightContentId2;
  let titleBlockId;
  let blockId1;
  let blockId2;

  try {
    // 0. Create dependencies: tour, location, language, and contents
    console.log("\n=== Step 0: Setting up test data ===");

    // Create tour
    console.log("\n--- Creating tour ---");
    const tourData = {
      tour_name: "Test Tour",
      tour_description: "A test tour for testing location content endpoint",
      tour_path_image_url: "https://example.com/tour-path.jpg",
    };

    const tourCreateResponse = await fetch(`${API_URL}/api/tours`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tourData),
    });

    const tourCreateResult = await tourCreateResponse.json();

    if (!tourCreateResult.success) {
      console.error("✗ Failed to create tour");
      console.error("Error:", tourCreateResult.error);
      process.exit(1);
    }

    console.log("✓ Tour created successfully!");
    tourId = parseInt(tourCreateResult.data.tour_id);
    console.log(`Tour ID: ${tourId}`);

    // Create location
    console.log("\n--- Creating location ---");
    const locationData = {
      tour_id: tourId,
      location_name: "Test Location",
      position_x: 0.5,
      position_y: 0.5,
    };

    const locationCreateResponse = await fetch(`${API_URL}/api/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(locationData),
    });

    const locationCreateResult = await locationCreateResponse.json();

    if (!locationCreateResult.success) {
      console.error("✗ Failed to create location");
      console.error("Error:", locationCreateResult.error);
      process.exit(1);
    }

    console.log("✓ Location created successfully!");
    locationId = parseInt(locationCreateResult.data.location_id);
    console.log(`Location ID: ${locationId}`);

    // Create language
    console.log("\n--- Creating language ---");
    const languageData = {
      language_code: "en",
      language_name: "English",
      language_native_name: "English",
    };

    const languageCreateResponse = await fetch(`${API_URL}/api/languages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(languageData),
    });

    const languageCreateResult = await languageCreateResponse.json();

    if (!languageCreateResult.success) {
      console.error("✗ Failed to create language");
      console.error("Error:", languageCreateResult.error);
      process.exit(1);
    }

    console.log("✓ Language created successfully!");
    languageId = parseInt(languageCreateResult.data.language_id);
    console.log(`Language ID: ${languageId}`);

    // Create title content (text, for position NULL)
    console.log("\n--- Creating title content ---");
    const titleContentData = {
      content: "Test Location Title",
      is_url: false,
      language_id: languageId,
    };

    const titleContentResponse = await fetch(`${API_URL}/api/contents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(titleContentData),
    });

    const titleContentResult = await titleContentResponse.json();

    if (!titleContentResult.success) {
      console.error("✗ Failed to create title content");
      console.error("Error:", titleContentResult.error);
      process.exit(1);
    }

    console.log("✓ Title content created successfully!");
    titleContentId = parseInt(titleContentResult.data.content_id);
    console.log(`Title Content ID: ${titleContentId}`);

    // Create content blocks (mix of text and URLs)
    console.log("\n--- Creating content blocks ---");

    // Block 1 - left: paragraph, right: url
    const leftContent1 = {
      content: "This is some descriptive text about the location.",
      is_url: false,
      language_id: languageId,
    };

    const leftResponse1 = await fetch(`${API_URL}/api/contents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leftContent1),
    });

    const leftResult1 = await leftResponse1.json();
    if (!leftResult1.success) {
      console.error("✗ Failed to create left content 1");
      process.exit(1);
    }
    leftContentId1 = parseInt(leftResult1.data.content_id);

    const rightContent1 = {
      content: "/test-image-1.png",
      is_url: true,
      language_id: languageId,
    };

    const rightResponse1 = await fetch(`${API_URL}/api/contents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rightContent1),
    });

    const rightResult1 = await rightResponse1.json();
    if (!rightResult1.success) {
      console.error("✗ Failed to create right content 1");
      process.exit(1);
    }
    rightContentId1 = parseInt(rightResult1.data.content_id);

    // Block 2 - left: url, right: paragraph
    const leftContent2 = {
      content: "/test-image-2.png",
      is_url: true,
      language_id: languageId,
    };

    const leftResponse2 = await fetch(`${API_URL}/api/contents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leftContent2),
    });

    const leftResult2 = await leftResponse2.json();
    if (!leftResult2.success) {
      console.error("✗ Failed to create left content 2");
      process.exit(1);
    }
    leftContentId2 = parseInt(leftResult2.data.content_id);

    const rightContent2 = {
      content: "More information about this amazing place.",
      is_url: false,
      language_id: languageId,
    };

    const rightResponse2 = await fetch(`${API_URL}/api/contents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rightContent2),
    });

    const rightResult2 = await rightResponse2.json();
    if (!rightResult2.success) {
      console.error("✗ Failed to create right content 2");
      process.exit(1);
    }
    rightContentId2 = parseInt(rightResult2.data.content_id);

    console.log("✓ All content created successfully!");

    // Create blocks
    console.log("\n--- Creating blocks ---");

    // Title block (position NULL)
    const titleBlockData = {
      content_id_left: titleContentId,
      content_id_right: titleContentId, // Both required for position NULL
      location_id: locationId,
      position: null,
    };

    const titleBlockResponse = await fetch(`${API_URL}/api/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(titleBlockData),
    });

    const titleBlockResult = await titleBlockResponse.json();
    if (!titleBlockResult.success) {
      console.error("✗ Failed to create title block");
      console.error("Error:", titleBlockResult.error);
      process.exit(1);
    }
    titleBlockId = parseInt(titleBlockResult.data.block_id);
    console.log("✓ Title block created (position NULL)");

    // Content block 1 (position 0)
    const block1Data = {
      content_id_left: leftContentId1,
      content_id_right: rightContentId1,
      location_id: locationId,
      position: 0,
    };

    const block1Response = await fetch(`${API_URL}/api/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(block1Data),
    });

    const block1Result = await block1Response.json();
    if (!block1Result.success) {
      console.error("✗ Failed to create block 1");
      console.error("Error:", block1Result.error);
      process.exit(1);
    }
    blockId1 = parseInt(block1Result.data.block_id);
    console.log("✓ Block 1 created (position 0)");

    // Content block 2 (position 1)
    const block2Data = {
      content_id_left: leftContentId2,
      content_id_right: rightContentId2,
      location_id: locationId,
      position: 1,
    };

    const block2Response = await fetch(`${API_URL}/api/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(block2Data),
    });

    const block2Result = await block2Response.json();
    if (!block2Result.success) {
      console.error("✗ Failed to create block 2");
      console.error("Error:", block2Result.error);
      process.exit(1);
    }
    blockId2 = parseInt(block2Result.data.block_id);
    console.log("✓ Block 2 created (position 1)");

    // 1. Test the endpoint
    console.log("\n=== Step 1: Testing GET /api/locations/[id]/content ===");
    console.log(
      `Fetching content for location ${locationId} with language ${languageId}`
    );

    const testResponse = await fetch(
      `${API_URL}/api/locations/${locationId}/content?language_id=${languageId}`
    );

    const testResult = await testResponse.json();

    if (!testResult.success) {
      console.error("✗ Failed to fetch location content");
      console.error("Error:", testResult.error);
      process.exit(1);
    }

    console.log("\n✓ Location content retrieved successfully!");
    console.log("\n--- Response Data ---");
    console.log("Title:", testResult.data.title);
    console.log("\nContent Blocks:");
    testResult.data.content.forEach((block, index) => {
      console.log(`\nBlock ${index}:`);
      console.log(`  Left: [${block.leftType}] ${block.leftContent}`);
      console.log(`  Right: [${block.rightType}] ${block.rightContent}`);
    });

    // Validate response structure
    console.log("\n=== Step 2: Validating response structure ===");

    if (typeof testResult.data.title !== "string") {
      console.error("✗ Title is not a string");
      process.exit(1);
    }
    console.log("✓ Title is a string");

    if (!Array.isArray(testResult.data.content)) {
      console.error("✗ Content is not an array");
      process.exit(1);
    }
    console.log("✓ Content is an array");

    if (testResult.data.content.length !== 2) {
      console.error(
        `✗ Expected 2 content blocks, got ${testResult.data.content.length}`
      );
      process.exit(1);
    }
    console.log("✓ Content has correct number of blocks (2)");

    testResult.data.content.forEach((block, index) => {
      if (!["paragraph", "url"].includes(block.leftType)) {
        console.error(`✗ Block ${index} has invalid leftType`);
        process.exit(1);
      }
      if (!["paragraph", "url"].includes(block.rightType)) {
        console.error(`✗ Block ${index} has invalid rightType`);
        process.exit(1);
      }
      if (typeof block.leftContent !== "string") {
        console.error(`✗ Block ${index} leftContent is not a string`);
        process.exit(1);
      }
      if (typeof block.rightContent !== "string") {
        console.error(`✗ Block ${index} rightContent is not a string`);
        process.exit(1);
      }
    });
    console.log("✓ All blocks have valid structure");

    // 3. Clean up all test data
    console.log("\n=== Step 3: Cleaning up test data ===");

    // Delete blocks
    await fetch(`${API_URL}/api/blocks/${titleBlockId}`, { method: "DELETE" });
    await fetch(`${API_URL}/api/blocks/${blockId1}`, { method: "DELETE" });
    await fetch(`${API_URL}/api/blocks/${blockId2}`, { method: "DELETE" });
    console.log("✓ Blocks deleted");

    // Delete contents
    await fetch(`${API_URL}/api/contents/${titleContentId}`, {
      method: "DELETE",
    });
    await fetch(`${API_URL}/api/contents/${leftContentId1}`, {
      method: "DELETE",
    });
    await fetch(`${API_URL}/api/contents/${rightContentId1}`, {
      method: "DELETE",
    });
    await fetch(`${API_URL}/api/contents/${leftContentId2}`, {
      method: "DELETE",
    });
    await fetch(`${API_URL}/api/contents/${rightContentId2}`, {
      method: "DELETE",
    });
    console.log("✓ Contents deleted");

    // Delete location
    await fetch(`${API_URL}/api/locations/${locationId}`, { method: "DELETE" });
    console.log("✓ Location deleted");

    // Delete tour
    await fetch(`${API_URL}/api/tours/${tourId}`, { method: "DELETE" });
    console.log("✓ Tour deleted");

    // Delete language
    await fetch(`${API_URL}/api/languages/${languageId}`, { method: "DELETE" });
    console.log("✓ Language deleted");

    console.log("\n=== ✅ All tests passed successfully! ===");
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testLocationContent();
