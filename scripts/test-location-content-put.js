/**
 * Script to test PUT /api/locations/[id]/content endpoint
 * Tests updating content for multiple languages
 */

const API_URL = process.env.API_URL || "http://localhost:3000";

async function testLocationContentPut() {
  let tourId;
  let locationId;
  let englishId;
  let spanishId;

  try {
    console.log("\n=== Testing PUT /api/locations/[id]/content ===\n");

    // 1. Create languages
    console.log("Step 1: Creating languages...");
    const englishResponse = await fetch(`${API_URL}/api/languages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language_code: "en",
        language_name: "English",
        language_native_name: "English",
      }),
    });
    const englishResult = await englishResponse.json();
    englishId = parseInt(englishResult.data.language_id);

    const spanishResponse = await fetch(`${API_URL}/api/languages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language_code: "es",
        language_name: "Spanish",
        language_native_name: "Español",
      }),
    });
    const spanishResult = await spanishResponse.json();
    spanishId = parseInt(spanishResult.data.language_id);

    console.log(
      `✓ Created English (ID: ${englishId}) and Spanish (ID: ${spanishId})\n`
    );

    // 2. Create a tour
    console.log("Step 2: Creating tour...");
    const tourResponse = await fetch(`${API_URL}/api/tours`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tour_name: "Test Tour for PUT",
        tour_description: "Testing PUT endpoint",
        tour_path_image_url: "/test-tour.png",
      }),
    });
    const tourResult = await tourResponse.json();
    tourId = parseInt(tourResult.data.tour_id);
    console.log(`✓ Tour created (ID: ${tourId})\n`);

    // 3. Create a location
    console.log("Step 3: Creating location...");
    const locationResponse = await fetch(`${API_URL}/api/locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tour_id: tourId,
        location_name: "Test Location Multi-Language",
        position_x: 0.5,
        position_y: 0.5,
      }),
    });
    const locationResult = await locationResponse.json();
    locationId = parseInt(locationResult.data.location_id);
    console.log(`✓ Location created (ID: ${locationId})\n`);

    // 4. PUT English content
    console.log("Step 4: PUTting English content...");
    const englishContent = {
      title: "Beautiful Flowers",
      language_id: englishId,
      content: [
        {
          leftType: "paragraph",
          leftContent: "These flowers bloom in spring.",
          rightType: "url",
          rightContent: "/images/flower1.jpg",
        },
        {
          leftType: "url",
          leftContent: "/images/flower2.jpg",
          rightType: "paragraph",
          rightContent: "Native to tropical regions.",
        },
      ],
    };

    const putEnglishResponse = await fetch(
      `${API_URL}/api/locations/${locationId}/content`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(englishContent),
      }
    );
    const putEnglishResult = await putEnglishResponse.json();
    if (!putEnglishResult.success) {
      throw new Error(
        `Failed to PUT English content: ${putEnglishResult.error}`
      );
    }
    console.log("✓ English content created\n");

    // 5. GET English content to verify
    console.log("Step 5: GETting English content...");
    const getEnglishResponse = await fetch(
      `${API_URL}/api/locations/${locationId}/content?language_id=${englishId}`
    );
    const getEnglishResult = await getEnglishResponse.json();
    console.log(
      "English content:",
      JSON.stringify(getEnglishResult.data, null, 2)
    );
    console.log();

    // 6. PUT Spanish content
    console.log("Step 6: PUTting Spanish content...");
    const spanishContent = {
      title: "Flores Hermosas",
      language_id: spanishId,
      content: [
        {
          leftType: "paragraph",
          leftContent: "Estas flores florecen en primavera.",
          rightType: "url",
          rightContent: "/images/flower1.jpg",
        },
        {
          leftType: "url",
          leftContent: "/images/flower2.jpg",
          rightType: "paragraph",
          rightContent: "Nativas de regiones tropicales.",
        },
      ],
    };

    const putSpanishResponse = await fetch(
      `${API_URL}/api/locations/${locationId}/content`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spanishContent),
      }
    );
    const putSpanishResult = await putSpanishResponse.json();
    if (!putSpanishResult.success) {
      throw new Error(
        `Failed to PUT Spanish content: ${putSpanishResult.error}`
      );
    }
    console.log("✓ Spanish content created\n");

    // 7. GET Spanish content
    console.log("Step 7: GETting Spanish content...");
    const getSpanishResponse = await fetch(
      `${API_URL}/api/locations/${locationId}/content?language_id=${spanishId}`
    );
    const getSpanishResult = await getSpanishResponse.json();
    console.log(
      "Spanish content:",
      JSON.stringify(getSpanishResult.data, null, 2)
    );
    console.log();

    // 8. Verify English content is unchanged
    console.log("Step 8: Verifying English content is unchanged...");
    const getEnglishAgainResponse = await fetch(
      `${API_URL}/api/locations/${locationId}/content?language_id=${englishId}`
    );
    const getEnglishAgainResult = await getEnglishAgainResponse.json();

    if (getEnglishAgainResult.data.title !== "Beautiful Flowers") {
      throw new Error("English title was modified!");
    }
    if (
      getEnglishAgainResult.data.content[0].leftContent !==
      "These flowers bloom in spring."
    ) {
      throw new Error("English content was modified!");
    }
    console.log("✓ English content remains unchanged\n");

    // 9. Update English content (add a third block)
    console.log("Step 9: Updating English content (adding block)...");
    const updatedEnglishContent = {
      title: "Beautiful Flowers - Updated",
      language_id: englishId,
      content: [
        {
          leftType: "paragraph",
          leftContent: "These flowers bloom in spring.",
          rightType: "url",
          rightContent: "/images/flower1.jpg",
        },
        {
          leftType: "url",
          leftContent: "/images/flower2.jpg",
          rightType: "paragraph",
          rightContent: "Native to tropical regions.",
        },
        {
          leftType: "paragraph",
          leftContent: "NEW BLOCK: They require lots of water.",
          rightType: "paragraph",
          rightContent: "And plenty of sunlight.",
        },
      ],
    };

    const putUpdateEnglishResponse = await fetch(
      `${API_URL}/api/locations/${locationId}/content`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEnglishContent),
      }
    );
    const putUpdateEnglishResult = await putUpdateEnglishResponse.json();
    if (!putUpdateEnglishResult.success) {
      throw new Error(
        `Failed to update English content: ${putUpdateEnglishResult.error}`
      );
    }
    console.log("✓ English content updated\n");

    // 10. GET updated English content
    console.log("Step 10: GETting updated English content...");
    const getUpdatedEnglishResponse = await fetch(
      `${API_URL}/api/locations/${locationId}/content?language_id=${englishId}`
    );
    const getUpdatedEnglishResult = await getUpdatedEnglishResponse.json();
    console.log(
      "Updated English content:",
      JSON.stringify(getUpdatedEnglishResult.data, null, 2)
    );

    if (getUpdatedEnglishResult.data.content.length !== 3) {
      throw new Error("English content should have 3 blocks!");
    }
    console.log();

    // 11. Verify Spanish content still has 2 blocks
    console.log("Step 11: Verifying Spanish content unchanged...");
    const getSpanishAgainResponse = await fetch(
      `${API_URL}/api/locations/${locationId}/content?language_id=${spanishId}`
    );
    const getSpanishAgainResult = await getSpanishAgainResponse.json();

    if (getSpanishAgainResult.data.content.length !== 2) {
      throw new Error("Spanish content should still have 2 blocks!");
    }
    console.log("✓ Spanish content unchanged (2 blocks)\n");

    // 12. Clean up
    console.log("Step 12: Cleaning up...");
    await fetch(`${API_URL}/api/locations/${locationId}`, { method: "DELETE" });
    console.log(`✓ Deleted location ${locationId}`);

    await fetch(`${API_URL}/api/tours/${tourId}`, { method: "DELETE" });
    console.log(`✓ Deleted tour ${tourId}`);

    await fetch(`${API_URL}/api/languages/${englishId}`, { method: "DELETE" });
    console.log(`✓ Deleted English language ${englishId}`);

    await fetch(`${API_URL}/api/languages/${spanishId}`, { method: "DELETE" });
    console.log(`✓ Deleted Spanish language ${spanishId}`);

    console.log("\n=== All tests passed! ===\n");
    console.log("✓ Multi-language content works correctly");
    console.log("✓ Languages are independent");
    console.log("✓ Updates work per language");
  } catch (error) {
    console.error("\n✗ Test failed:", error.message);
    console.error(error.stack);

    // Attempt cleanup on failure
    if (locationId) {
      await fetch(`${API_URL}/api/locations/${locationId}`, {
        method: "DELETE",
      }).catch(() => {});
    }
    if (tourId) {
      await fetch(`${API_URL}/api/tours/${tourId}`, {
        method: "DELETE",
      }).catch(() => {});
    }
    if (englishId) {
      await fetch(`${API_URL}/api/languages/${englishId}`, {
        method: "DELETE",
      }).catch(() => {});
    }
    if (spanishId) {
      await fetch(`${API_URL}/api/languages/${spanishId}`, {
        method: "DELETE",
      }).catch(() => {});
    }

    process.exit(1);
  }
}

// Run the test
testLocationContentPut();
