/**
 * Script to create, update, get, and delete a location
 * Demonstrates full CRUD operations
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function runLocationOperations() {
  let locationId;
  let tourId;

  try {
    // 0. Create a tour first (dependency)
    console.log('\n=== Step 0: Creating tour (dependency) ===');
    const tourData = {
      tour_name: 'Test Tour',
      tour_description: 'A test tour description',
      tour_path_image_url: 'https://example.com/tour-path-image.jpg',
    };

    console.log('Creating tour with data:', tourData);
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

    // 1. Create a location
    console.log('\n=== Step 1: Creating location ===');
    const locationData = {
      tour_id: tourId,
      location_name: 'Test Location',
    };

    console.log('Creating location with data:', locationData);
    const createResponse = await fetch(`${API_URL}/api/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
    });

    const createResult = await createResponse.json();

    if (!createResult.success) {
      console.error('✗ Failed to create location');
      console.error('Error:', createResult.error);
      process.exit(1);
    }

    console.log('✓ Location created successfully!');
    console.log('Created location:', createResult.data);
    locationId = parseInt(createResult.data.location_id);
    console.log(`Location ID: ${locationId}`);

    // 2. Update the location's name
    console.log('\n=== Step 2: Updating location name ===');
    const updateData = {
      location_name: 'Updated Test Location',
    };

    console.log(`Updating location ${locationId} with new name: ${updateData.location_name}`);
    const updateResponse = await fetch(`${API_URL}/api/locations/${locationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const updateResult = await updateResponse.json();

    if (!updateResult.success) {
      console.error('✗ Failed to update location');
      console.error('Error:', updateResult.error);
      process.exit(1);
    }

    console.log('✓ Location updated successfully!');
    console.log('Updated location:', updateResult.data);

    // 3. Get the location by ID
    console.log('\n=== Step 3: Getting location by ID ===');
    console.log(`Fetching location ${locationId}`);
    const getResponse = await fetch(`${API_URL}/api/locations/${locationId}`);

    const getResult = await getResponse.json();

    if (!getResult.success) {
      console.error('✗ Failed to get location');
      console.error('Error:', getResult.error);
      process.exit(1);
    }

    console.log('✓ Location retrieved successfully!');
    console.log('Retrieved location:', getResult.data);

    // 4. Delete the location
    console.log('\n=== Step 4: Deleting location ===');
    console.log(`Deleting location ${locationId}`);
    const deleteResponse = await fetch(`${API_URL}/api/locations/${locationId}`, {
      method: 'DELETE',
    });

    const deleteResult = await deleteResponse.json();

    if (!deleteResult.success) {
      console.error('✗ Failed to delete location');
      console.error('Error:', deleteResult.error);
      process.exit(1);
    }

    console.log('✓ Location deleted successfully!');
    console.log('Deleted location ID:', deleteResult.data.id);

    // 5. Clean up: Delete the tour
    console.log('\n=== Step 5: Cleaning up tour ===');
    console.log(`Deleting tour ${tourId}`);
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

    console.log('\n=== All operations completed successfully! ===');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
runLocationOperations();

