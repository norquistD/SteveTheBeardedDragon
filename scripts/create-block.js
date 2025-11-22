/**
 * Script to create, update, get, and delete a block
 * Demonstrates full CRUD operations
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function runBlockOperations() {
  let blockId;
  let locationId;
  let tourId;
  let languageId;
  let contentIdLeft;
  let contentIdRight;

  try {
    // 0. Create dependencies: tour, location, language, and contents
    console.log('\n=== Step 0: Creating dependencies ===');
    
    // Create tour
    console.log('\n--- Creating tour ---');
    const tourData = {
      tour_name: 'Test Tour',
      tour_description: 'A test tour description',
      tour_path_image_url: 'https://example.com/tour-path-image.jpg',
    };

    const tourCreateResponse = await fetch(`${API_URL}/api/tours`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tourData),
    });

    const tourCreateResult = await tourCreateResponse.json();

    if (!tourCreateResult.success) {
      console.error('✗ Failed to create tour');
      console.error('Error:', tourCreateResult.error);
      process.exit(1);
    }

    console.log('✓ Tour created successfully!');
    tourId = parseInt(tourCreateResult.data.tour_id);
    console.log(`Tour ID: ${tourId}`);

    // Create location
    console.log('\n--- Creating location ---');
    const locationData = {
      tour_id: tourId,
      location_name: 'Test Location',
    };

    const locationCreateResponse = await fetch(`${API_URL}/api/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
    });

    const locationCreateResult = await locationCreateResponse.json();

    if (!locationCreateResult.success) {
      console.error('✗ Failed to create location');
      console.error('Error:', locationCreateResult.error);
      process.exit(1);
    }

    console.log('✓ Location created successfully!');
    locationId = parseInt(locationCreateResult.data.location_id);
    console.log(`Location ID: ${locationId}`);

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

    // 1. Create a block
    console.log('\n=== Step 1: Creating block ===');
    const blockData = {
      content_id_left: contentIdLeft,
      content_id_right: contentIdRight,
      location_id: locationId,
      position: 1,
    };

    console.log('Creating block with data:', blockData);
    const createResponse = await fetch(`${API_URL}/api/blocks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blockData),
    });

    const createResult = await createResponse.json();

    if (!createResult.success) {
      console.error('✗ Failed to create block');
      console.error('Error:', createResult.error);
      process.exit(1);
    }

    console.log('✓ Block created successfully!');
    console.log('Created block:', createResult.data);
    blockId = parseInt(createResult.data.block_id);
    console.log(`Block ID: ${blockId}`);

    // 2. Update the block's position
    console.log('\n=== Step 2: Updating block position ===');
    const updateData = {
      position: 2,
    };

    console.log(`Updating block ${blockId} with new position: ${updateData.position}`);
    const updateResponse = await fetch(`${API_URL}/api/blocks/${blockId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const updateResult = await updateResponse.json();

    if (!updateResult.success) {
      console.error('✗ Failed to update block');
      console.error('Error:', updateResult.error);
      process.exit(1);
    }

    console.log('✓ Block updated successfully!');
    console.log('Updated block:', updateResult.data);

    // 3. Get the block by ID
    console.log('\n=== Step 3: Getting block by ID ===');
    console.log(`Fetching block ${blockId}`);
    const getResponse = await fetch(`${API_URL}/api/blocks/${blockId}`);

    const getResult = await getResponse.json();

    if (!getResult.success) {
      console.error('✗ Failed to get block');
      console.error('Error:', getResult.error);
      process.exit(1);
    }

    console.log('✓ Block retrieved successfully!');
    console.log('Retrieved block:', getResult.data);

    // 4. Delete the block
    console.log('\n=== Step 4: Deleting block ===');
    console.log(`Deleting block ${blockId}`);
    const deleteResponse = await fetch(`${API_URL}/api/blocks/${blockId}`, {
      method: 'DELETE',
    });

    const deleteResult = await deleteResponse.json();

    if (!deleteResult.success) {
      console.error('✗ Failed to delete block');
      console.error('Error:', deleteResult.error);
      process.exit(1);
    }

    console.log('✓ Block deleted successfully!');
    console.log('Deleted block ID:', deleteResult.data.id);

    // 5. Clean up: Delete contents, location, tour, and language
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

    // Delete location
    console.log('\n--- Deleting location ---');
    const locationDeleteResponse = await fetch(`${API_URL}/api/locations/${locationId}`, {
      method: 'DELETE',
    });

    const locationDeleteResult = await locationDeleteResponse.json();

    if (!locationDeleteResult.success) {
      console.error('✗ Failed to delete location');
      console.error('Error:', locationDeleteResult.error);
      process.exit(1);
    }

    console.log('✓ Location deleted successfully!');

    // Delete tour
    console.log('\n--- Deleting tour ---');
    const tourDeleteResponse = await fetch(`${API_URL}/api/tours/${tourId}`, {
      method: 'DELETE',
    });

    const tourDeleteResult = await tourDeleteResponse.json();

    if (!tourDeleteResult.success) {
      console.error('✗ Failed to delete tour');
      console.error('Error:', tourDeleteResult.error);
      process.exit(1);
    }

    console.log('✓ Tour deleted successfully!');

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
runBlockOperations();

