/**
 * Script to test POST /api/locations/[id]/content endpoint
 * Creates a complete InfoPageData structure for a location
 */

const API_URL = process.env.API_URL || "http://localhost:3000";

async function testLocationContentPost() {
  let tourId;
  let locationId;
  let languageId;

  try {
    console.log("\n=== Testing POST /api/locations/[id]/content ===\n");

    // 1. Create a language
    console.log("Step 1: Creating language...");
    const languageData = {
      language_code: "en",
      language_name: "English",
      language_native_name: "English",
    };

    const languageResponse = await fetch(`${API_URL}/api/languages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(languageData),
    });

    const languageResult = await languageResponse.json();
    if (!languageResult.success) {
      throw new Error(`Failed to create language: ${languageResult.error}`);
    }

    languageId = parseInt(languageResult.data.language_id);
    console.log(`✓ Language created (ID: ${languageId})\n`);

    // 2. Create a tour
    console.log("Step 2: Creating tour...");
    const tourData = {
      tour_name: "Test Tour for Content",
      tour_description: "A test tour to test location content",
      tour_path_image_url: "/test-tour.png",
    };

    const tourResponse = await fetch(`${API_URL}/api/tours`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tourData),
    });

    const tourResult = await tourResponse.json();
    if (!tourResult.success) {
      throw new Error(`Failed to create tour: ${tourResult.error}`);
    }

    tourId = parseInt(tourResult.data.tour_id);
    console.log(`✓ Tour created (ID: ${tourId})\n`);

    // 3. Create a location
    console.log("Step 3: Creating location...");
    const locationData = {
      tour_id: tourId,
      location_name: "Test Location with Content",
      position_x: 0.5,
      position_y: 0.5,
    };

    const locationResponse = await fetch(`${API_URL}/api/locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(locationData),
    });

    const locationResult = await locationResponse.json();
    if (!locationResult.success) {
      throw new Error(`Failed to create location: ${locationResult.error}`);
    }

    locationId = parseInt(locationResult.data.location_id);
    console.log(`✓ Location created (ID: ${locationId})\n`);

    // 4. POST content to location
    console.log("Step 4: POSTing content to location...");
    const contentData = {
      title: "Amazing Plant Species",
      language_id: languageId,
      content: [
        {
          leftType: "paragraph",
          leftContent: "This is the first block with text on the left.",
          rightType: "url",
          rightContent: "/images/plant1.jpg",
        },
        {
          leftType: "url",
          leftContent: "/images/plant2.jpg",
          rightType: "paragraph",
          rightContent:
            "This is the second block with an image on the left and text on the right.",
        },
        {
          leftType: "paragraph",
          leftContent: "Third block: both sides are text.",
          rightType: "paragraph",
          rightContent: "Right side text for the third block.",
        },
      ],
    };

    console.log("Content data to POST:", JSON.stringify(contentData, null, 2));

    const contentPostResponse = await fetch(
      `${API_URL}/api/locations/${locationId}/content`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentData),
      }
    );

    const contentPostResult = await contentPostResponse.json();
    if (!contentPostResult.success) {
      throw new Error(`Failed to POST content: ${contentPostResult.error}`);
    }

    console.log(`✓ Content POSTed successfully!`);
    console.log("Response:", contentPostResult.data);
    console.log();

    // 5. GET the content back to verify
    console.log("Step 5: GETting content back to verify...");
    const contentGetResponse = await fetch(
      `${API_URL}/api/locations/${locationId}/content?language_id=${languageId}`
    );

    const contentGetResult = await contentGetResponse.json();
    if (!contentGetResult.success) {
      throw new Error(`Failed to GET content: ${contentGetResult.error}`);
    }

    console.log("✓ Content retrieved successfully!");
    console.log(
      "Retrieved data:",
      JSON.stringify(contentGetResult.data, null, 2)
    );
    console.log();

    // Verify the data matches
    if (contentGetResult.data.title !== contentData.title) {
      throw new Error("Title mismatch!");
    }
    if (contentGetResult.data.content.length !== contentData.content.length) {
      throw new Error("Content block count mismatch!");
    }
    console.log("✓ Data verification passed!\n");

    // 6. Clean up
    console.log("Step 6: Cleaning up...");

    // Delete location (will cascade delete blocks)
    await fetch(`${API_URL}/api/locations/${locationId}`, { method: "DELETE" });
    console.log(`✓ Deleted location ${locationId}`);

    // Delete tour
    await fetch(`${API_URL}/api/tours/${tourId}`, { method: "DELETE" });
    console.log(`✓ Deleted tour ${tourId}`);

    // Delete language
    await fetch(`${API_URL}/api/languages/${languageId}`, { method: "DELETE" });
    console.log(`✓ Deleted language ${languageId}`);

    console.log("\n=== All tests passed! ===\n");
  } catch (error) {
    console.error("\n✗ Test failed:", error.message);

    // Attempt cleanup on failure
    if (locationId) {
      await fetch(`${API_URL}/api/locations/${locationId}`, {
        method: "DELETE",
      }).catch(() => {});
    }
    if (tourId) {
      await fetch(`${API_URL}/api/tours/${tourId}`, { method: "DELETE" }).catch(
        () => {}
      );
    }
    if (languageId) {
      await fetch(`${API_URL}/api/languages/${languageId}`, {
        method: "DELETE",
      }).catch(() => {});
    }

    process.exit(1);
  }
}

// Run the test
testLocationContentPost();
