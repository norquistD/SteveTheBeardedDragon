/**
 * Script to delete all locations and their associated blocks and contents
 * Order: blocks -> locations -> contents (contents last since they might be orphaned)
 */

const API_URL = process.env.API_URL || "http://localhost:3000";

async function deleteAllLocations() {
  try {
    console.log("\n=== Deleting All Locations and Associated Data ===\n");

    // Step 1: Fetch all locations
    console.log("Step 1: Fetching all locations...");
    const locationsResponse = await fetch(`${API_URL}/api/locations`);
    const locationsResult = await locationsResponse.json();

    if (!locationsResult.success) {
      throw new Error(`Failed to fetch locations: ${locationsResult.error}`);
    }

    const locations = locationsResult.data;
    console.log(`✓ Found ${locations.length} locations\n`);

    if (locations.length === 0) {
      console.log("No locations to delete. Exiting.\n");
      return;
    }

    // Step 2: Delete all blocks for each location
    console.log("Step 2: Deleting all blocks...");
    let totalBlocksDeleted = 0;

    for (const location of locations) {
      const blocksResponse = await fetch(
        `${API_URL}/api/blocks?location_id=${location.location_id}`
      );
      const blocksResult = await blocksResponse.json();

      if (blocksResult.success && blocksResult.data.length > 0) {
        for (const block of blocksResult.data) {
          const deleteBlockResponse = await fetch(
            `${API_URL}/api/blocks/${block.block_id}`,
            { method: "DELETE" }
          );
          const deleteBlockResult = await deleteBlockResponse.json();

          if (deleteBlockResult.success) {
            totalBlocksDeleted++;
          } else {
            console.warn(
              `⚠ Failed to delete block ${block.block_id}: ${deleteBlockResult.error}`
            );
          }
        }
      }
    }

    console.log(`✓ Deleted ${totalBlocksDeleted} blocks\n`);

    // Step 3: Delete all locations
    console.log("Step 3: Deleting all locations...");
    let locationsDeleted = 0;

    for (const location of locations) {
      const deleteLocationResponse = await fetch(
        `${API_URL}/api/locations/${location.location_id}`,
        { method: "DELETE" }
      );
      const deleteLocationResult = await deleteLocationResponse.json();

      if (deleteLocationResult.success) {
        locationsDeleted++;
        console.log(
          `✓ Deleted location ${location.location_id}: ${location.location_name}`
        );
      } else {
        console.warn(
          `⚠ Failed to delete location ${location.location_id}: ${deleteLocationResult.error}`
        );
      }
    }

    console.log(`\n✓ Deleted ${locationsDeleted} locations\n`);

    // Step 4: Clean up orphaned contents (optional but recommended)
    console.log("Step 4: Cleaning up orphaned contents...");
    console.log(
      "Note: Contents are not automatically deleted as they may be shared across languages."
    );
    console.log(
      "If you need to delete all contents, run a separate cleanup script.\n"
    );

    console.log("=== Deletion Complete ===\n");
    console.log(`Summary:`);
    console.log(`- Blocks deleted: ${totalBlocksDeleted}`);
    console.log(`- Locations deleted: ${locationsDeleted}`);
  } catch (error) {
    console.error("\n✗ Deletion failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the deletion
deleteAllLocations();
