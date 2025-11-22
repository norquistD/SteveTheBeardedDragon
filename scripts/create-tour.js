/**
 * Script to create, update, get, and delete a tour
 * Demonstrates full CRUD operations
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function runTourOperations() {
  let tourId;

  try {
    // 1. Create a tour
    console.log('\n=== Step 1: Creating tour ===');
    const tourData = {
      tour_name: 'Test Tour',
      tour_description: 'A test tour description',
      tour_path_image_url: 'https://example.com/tour-path-image.jpg',
    };

    console.log('Creating tour with data:', tourData);
    const createResponse = await fetch(`${API_URL}/api/tours`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tourData),
    });

    const createResult = await createResponse.json();

    if (!createResult.success) {
      console.error('✗ Failed to create tour');
      console.error('Error:', createResult.error);
      process.exit(1);
    }

    console.log('✓ Tour created successfully!');
    console.log('Created tour:', createResult.data);
    tourId = parseInt(createResult.data.tour_id);
    console.log(`Tour ID: ${tourId}`);

    // 2. Update the tour's name
    console.log('\n=== Step 2: Updating tour name ===');
    const updateData = {
      tour_name: 'Updated Test Tour',
    };

    console.log(`Updating tour ${tourId} with new name: ${updateData.tour_name}`);
    const updateResponse = await fetch(`${API_URL}/api/tours/${tourId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const updateResult = await updateResponse.json();

    if (!updateResult.success) {
      console.error('✗ Failed to update tour');
      console.error('Error:', updateResult.error);
      process.exit(1);
    }

    console.log('✓ Tour updated successfully!');
    console.log('Updated tour:', updateResult.data);

    // 3. Get the tour by ID
    console.log('\n=== Step 3: Getting tour by ID ===');
    console.log(`Fetching tour ${tourId}`);
    const getResponse = await fetch(`${API_URL}/api/tours/${tourId}`);

    const getResult = await getResponse.json();

    if (!getResult.success) {
      console.error('✗ Failed to get tour');
      console.error('Error:', getResult.error);
      process.exit(1);
    }

    console.log('✓ Tour retrieved successfully!');
    console.log('Retrieved tour:', getResult.data);

    // 4. Delete the tour
    console.log('\n=== Step 4: Deleting tour ===');
    console.log(`Deleting tour ${tourId}`);
    const deleteResponse = await fetch(`${API_URL}/api/tours/${tourId}`, {
      method: 'DELETE',
    });

    const deleteResult = await deleteResponse.json();

    if (!deleteResult.success) {
      console.error('✗ Failed to delete tour');
      console.error('Error:', deleteResult.error);
      process.exit(1);
    }

    console.log('✓ Tour deleted successfully!');
    console.log('Deleted tour ID:', deleteResult.data.id);

    console.log('\n=== All operations completed successfully! ===');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
runTourOperations();

