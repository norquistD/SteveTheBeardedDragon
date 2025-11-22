/**
 * Script to create, update, get, and delete a plant
 * Demonstrates full CRUD operations
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function runPlantOperations() {
  let plantId;

  try {
    // 1. Create a plant
    console.log('\n=== Step 1: Creating plant ===');
    const plantData = {
      plant_name: 'Silver-Dollar Fern',
      plant_scientific_name: 'Adiantum peruvianum',
    };

    console.log('Creating plant with data:', plantData);
    const createResponse = await fetch(`${API_URL}/api/plants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plantData),
    });

    const createResult = await createResponse.json();

    if (!createResult.success) {
      console.error('✗ Failed to create plant');
      console.error('Error:', createResult.error);
      process.exit(1);
    }

    console.log('✓ Plant created successfully!');
    console.log('Created plant:', createResult.data);
    plantId = parseInt(createResult.data.plant_id);
    console.log(`Plant ID: ${plantId}`);

    // 2. Update the plant's name
    console.log('\n=== Step 2: Updating plant name ===');
    const updateData = {
      plant_name: 'Updated Silver-Dollar Fern',
    };

    console.log(`Updating plant ${plantId} with new name: ${updateData.plant_name}`);
    const updateResponse = await fetch(`${API_URL}/api/plants/${plantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const updateResult = await updateResponse.json();

    if (!updateResult.success) {
      console.error('✗ Failed to update plant');
      console.error('Error:', updateResult.error);
      process.exit(1);
    }

    console.log('✓ Plant updated successfully!');
    console.log('Updated plant:', updateResult.data);

    // 3. Get the plant by ID
    console.log('\n=== Step 3: Getting plant by ID ===');
    console.log(`Fetching plant ${plantId}`);
    const getResponse = await fetch(`${API_URL}/api/plants/${plantId}`);

    const getResult = await getResponse.json();

    if (!getResult.success) {
      console.error('✗ Failed to get plant');
      console.error('Error:', getResult.error);
      process.exit(1);
    }

    console.log('✓ Plant retrieved successfully!');
    console.log('Retrieved plant:', getResult.data);

    // 4. Delete the plant
    console.log('\n=== Step 4: Deleting plant ===');
    console.log(`Deleting plant ${plantId}`);
    const deleteResponse = await fetch(`${API_URL}/api/plants/${plantId}`, {
      method: 'DELETE',
    });

    const deleteResult = await deleteResponse.json();

    if (!deleteResult.success) {
      console.error('✗ Failed to delete plant');
      console.error('Error:', deleteResult.error);
      process.exit(1);
    }

    console.log('✓ Plant deleted successfully!');
    console.log('Deleted plant ID:', deleteResult.data.id);

    console.log('\n=== All operations completed successfully! ===');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
runPlantOperations();

