/**
 * Script to create, update, get, and delete a plant block
 * Demonstrates full CRUD operations
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function runPlantBlockOperations() {
  let plantBlockId;
  let plantId;
  let languageId;
  let contentIdLeft;
  let contentIdRight;

  try {
    // 0. Create dependencies: plant, language, and contents
    console.log('\n=== Step 0: Creating dependencies ===');
    
    // Create plant
    console.log('\n--- Creating plant ---');
    const plantData = {
      plant_name: 'Test Plant',
      plant_scientific_name: 'Testus plantus',
    };

    const plantCreateResponse = await fetch(`${API_URL}/api/plants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plantData),
    });

    const plantCreateResult = await plantCreateResponse.json();

    if (!plantCreateResult.success) {
      console.error('✗ Failed to create plant');
      console.error('Error:', plantCreateResult.error);
      process.exit(1);
    }

    console.log('✓ Plant created successfully!');
    plantId = parseInt(plantCreateResult.data.plant_id);
    console.log(`Plant ID: ${plantId}`);

    // Create language
    console.log('\n--- Creating language ---');
    const languageData = {
      language_code: 'en',
      language_name: 'English',
      language_native_name: 'English',
    };

    const languageCreateResponse = await fetch(`${API_URL}/api/languages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(languageData),
    });

    const languageCreateResult = await languageCreateResponse.json();

    if (!languageCreateResult.success) {
      console.error('✗ Failed to create language');
      console.error('Error:', languageCreateResult.error);
      process.exit(1);
    }

    console.log('✓ Language created successfully!');
    languageId = parseInt(languageCreateResult.data.language_id);
    console.log(`Language ID: ${languageId}`);

    // Create content for left
    console.log('\n--- Creating left content ---');
    const contentLeftData = {
      content: 'https://example.com/left-content',
      is_url: true,
      language_id: languageId,
    };

    const contentLeftCreateResponse = await fetch(`${API_URL}/api/contents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contentLeftData),
    });

    const contentLeftCreateResult = await contentLeftCreateResponse.json();

    if (!contentLeftCreateResult.success) {
      console.error('✗ Failed to create left content');
      console.error('Error:', contentLeftCreateResult.error);
      process.exit(1);
    }

    console.log('✓ Left content created successfully!');
    contentIdLeft = parseInt(contentLeftCreateResult.data.content_id);
    console.log(`Left Content ID: ${contentIdLeft}`);

    // Create content for right
    console.log('\n--- Creating right content ---');
    const contentRightData = {
      content: 'https://example.com/right-content',
      is_url: true,
      language_id: languageId,
    };

    const contentRightCreateResponse = await fetch(`${API_URL}/api/contents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contentRightData),
    });

    const contentRightCreateResult = await contentRightCreateResponse.json();

    if (!contentRightCreateResult.success) {
      console.error('✗ Failed to create right content');
      console.error('Error:', contentRightCreateResult.error);
      process.exit(1);
    }

    console.log('✓ Right content created successfully!');
    contentIdRight = parseInt(contentRightCreateResult.data.content_id);
    console.log(`Right Content ID: ${contentIdRight}`);

    // 1. Create a plant block
    console.log('\n=== Step 1: Creating plant block ===');
    const plantBlockData = {
      content_id_left: contentIdLeft,
      content_id_right: contentIdRight,
      plant_id: plantId,
      position: 1,
    };

    console.log('Creating plant block with data:', plantBlockData);
    const createResponse = await fetch(`${API_URL}/api/plant-blocks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plantBlockData),
    });

    const createResult = await createResponse.json();

    if (!createResult.success) {
      console.error('✗ Failed to create plant block');
      console.error('Error:', createResult.error);
      process.exit(1);
    }

    console.log('✓ Plant block created successfully!');
    console.log('Created plant block:', createResult.data);
    plantBlockId = parseInt(createResult.data.block_id);
    console.log(`Plant Block ID: ${plantBlockId}`);

    // 2. Update the plant block's position
    console.log('\n=== Step 2: Updating plant block position ===');
    const updateData = {
      position: 2,
    };

    console.log(`Updating plant block ${plantBlockId} with new position: ${updateData.position}`);
    const updateResponse = await fetch(`${API_URL}/api/plant-blocks/${plantBlockId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const updateResult = await updateResponse.json();

    if (!updateResult.success) {
      console.error('✗ Failed to update plant block');
      console.error('Error:', updateResult.error);
      process.exit(1);
    }

    console.log('✓ Plant block updated successfully!');
    console.log('Updated plant block:', updateResult.data);

    // 3. Get the plant block by ID
    console.log('\n=== Step 3: Getting plant block by ID ===');
    console.log(`Fetching plant block ${plantBlockId}`);
    const getResponse = await fetch(`${API_URL}/api/plant-blocks/${plantBlockId}`);

    const getResult = await getResponse.json();

    if (!getResult.success) {
      console.error('✗ Failed to get plant block');
      console.error('Error:', getResult.error);
      process.exit(1);
    }

    console.log('✓ Plant block retrieved successfully!');
    console.log('Retrieved plant block:', getResult.data);

    // 4. Delete the plant block
    console.log('\n=== Step 4: Deleting plant block ===');
    console.log(`Deleting plant block ${plantBlockId}`);
    const deleteResponse = await fetch(`${API_URL}/api/plant-blocks/${plantBlockId}`, {
      method: 'DELETE',
    });

    const deleteResult = await deleteResponse.json();

    if (!deleteResult.success) {
      console.error('✗ Failed to delete plant block');
      console.error('Error:', deleteResult.error);
      process.exit(1);
    }

    console.log('✓ Plant block deleted successfully!');
    console.log('Deleted plant block ID:', deleteResult.data.id);

    // 5. Clean up: Delete contents, plant, and language
    console.log('\n=== Step 5: Cleaning up dependencies ===');
    
    // Delete right content
    console.log('\n--- Deleting right content ---');
    const contentRightDeleteResponse = await fetch(`${API_URL}/api/contents/${contentIdRight}`, {
      method: 'DELETE',
    });

    const contentRightDeleteResult = await contentRightDeleteResponse.json();

    if (!contentRightDeleteResult.success) {
      console.error('✗ Failed to delete right content');
      console.error('Error:', contentRightDeleteResult.error);
      process.exit(1);
    }

    console.log('✓ Right content deleted successfully!');

    // Delete left content
    console.log('\n--- Deleting left content ---');
    const contentLeftDeleteResponse = await fetch(`${API_URL}/api/contents/${contentIdLeft}`, {
      method: 'DELETE',
    });

    const contentLeftDeleteResult = await contentLeftDeleteResponse.json();

    if (!contentLeftDeleteResult.success) {
      console.error('✗ Failed to delete left content');
      console.error('Error:', contentLeftDeleteResult.error);
      process.exit(1);
    }

    console.log('✓ Left content deleted successfully!');

    // Delete plant
    console.log('\n--- Deleting plant ---');
    const plantDeleteResponse = await fetch(`${API_URL}/api/plants/${plantId}`, {
      method: 'DELETE',
    });

    const plantDeleteResult = await plantDeleteResponse.json();

    if (!plantDeleteResult.success) {
      console.error('✗ Failed to delete plant');
      console.error('Error:', plantDeleteResult.error);
      process.exit(1);
    }

    console.log('✓ Plant deleted successfully!');

    // Delete language
    console.log('\n--- Deleting language ---');
    const languageDeleteResponse = await fetch(`${API_URL}/api/languages/${languageId}`, {
      method: 'DELETE',
    });

    const languageDeleteResult = await languageDeleteResponse.json();

    if (!languageDeleteResult.success) {
      console.error('✗ Failed to delete language');
      console.error('Error:', languageDeleteResult.error);
      process.exit(1);
    }

    console.log('✓ Language deleted successfully!');

    console.log('\n=== All operations completed successfully! ===');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
runPlantBlockOperations();

