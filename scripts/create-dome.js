/**
 * Script to create, update, get, and delete a dome
 * Demonstrates full CRUD operations
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function runDomeOperations() {
  let domeId;

  try {
    // 1. Create a dome
    console.log('\n=== Step 1: Creating dome ===');
    const domeData = {
      dome_name: 'Test Dome',
      dome_image_url: 'https://example.com/dome-image.jpg',
      dome_path_image_url: 'https://example.com/dome-path-image.jpg',
    };

    console.log('Creating dome with data:', domeData);
    const createResponse = await fetch(`${API_URL}/api/domes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(domeData),
    });

    const createResult = await createResponse.json();

    if (!createResult.success) {
      console.error('✗ Failed to create dome');
      console.error('Error:', createResult.error);
      process.exit(1);
    }

    console.log('✓ Dome created successfully!');
    console.log('Created dome:', createResult.data);
    domeId = parseInt(createResult.data.dome_id);
    console.log(`Dome ID: ${domeId}`);

    // 2. Update the dome's name
    console.log('\n=== Step 2: Updating dome name ===');
    const updateData = {
      dome_name: 'Updated Test Dome',
    };

    console.log(`Updating dome ${domeId} with new name: ${updateData.dome_name}`);
    const updateResponse = await fetch(`${API_URL}/api/domes/${domeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const updateResult = await updateResponse.json();

    if (!updateResult.success) {
      console.error('✗ Failed to update dome');
      console.error('Error:', updateResult.error);
      process.exit(1);
    }

    console.log('✓ Dome updated successfully!');
    console.log('Updated dome:', updateResult.data);

    // 3. Get the dome by ID
    console.log('\n=== Step 3: Getting dome by ID ===');
    console.log(`Fetching dome ${domeId}`);
    const getResponse = await fetch(`${API_URL}/api/domes/${domeId}`);

    const getResult = await getResponse.json();

    if (!getResult.success) {
      console.error('✗ Failed to get dome');
      console.error('Error:', getResult.error);
      process.exit(1);
    }

    console.log('✓ Dome retrieved successfully!');
    console.log('Retrieved dome:', getResult.data);

    // 4. Delete the dome
    console.log('\n=== Step 4: Deleting dome ===');
    console.log(`Deleting dome ${domeId}`);
    const deleteResponse = await fetch(`${API_URL}/api/domes/${domeId}`, {
      method: 'DELETE',
    });

    const deleteResult = await deleteResponse.json();

    if (!deleteResult.success) {
      console.error('✗ Failed to delete dome');
      console.error('Error:', deleteResult.error);
      process.exit(1);
    }

    console.log('✓ Dome deleted successfully!');
    console.log('Deleted dome ID:', deleteResult.data.id);

    console.log('\n=== All operations completed successfully! ===');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
runDomeOperations();

