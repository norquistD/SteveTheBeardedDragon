/**
 * Script to create, update, get, and delete a language
 * Demonstrates full CRUD operations
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function runLanguageOperations() {
  let languageId;

  try {
    // 1. Create a language
    console.log('\n=== Step 1: Creating language ===');
    const languageData = {
      language_code: 'en',
      language_name: 'English',
      language_native_name: 'English',
    };

    console.log('Creating language with data:', languageData);
    const createResponse = await fetch(`${API_URL}/api/languages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(languageData),
    });

    const createResult = await createResponse.json();

    if (!createResult.success) {
      console.error('✗ Failed to create language');
      console.error('Error:', createResult.error);
      process.exit(1);
    }

    console.log('✓ Language created successfully!');
    console.log('Created language:', createResult.data);
    languageId = parseInt(createResult.data.language_id);
    console.log(`Language ID: ${languageId}`);

    // 2. Update the language's name
    console.log('\n=== Step 2: Updating language name ===');
    const updateData = {
      language_name: 'Updated English',
    };

    console.log(`Updating language ${languageId} with new name: ${updateData.language_name}`);
    const updateResponse = await fetch(`${API_URL}/api/languages/${languageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const updateResult = await updateResponse.json();

    if (!updateResult.success) {
      console.error('✗ Failed to update language');
      console.error('Error:', updateResult.error);
      process.exit(1);
    }

    console.log('✓ Language updated successfully!');
    console.log('Updated language:', updateResult.data);

    // 3. Get the language by ID
    console.log('\n=== Step 3: Getting language by ID ===');
    console.log(`Fetching language ${languageId}`);
    const getResponse = await fetch(`${API_URL}/api/languages/${languageId}`);

    const getResult = await getResponse.json();

    if (!getResult.success) {
      console.error('✗ Failed to get language');
      console.error('Error:', getResult.error);
      process.exit(1);
    }

    console.log('✓ Language retrieved successfully!');
    console.log('Retrieved language:', getResult.data);

    // 4. Delete the language
    console.log('\n=== Step 4: Deleting language ===');
    console.log(`Deleting language ${languageId}`);
    const deleteResponse = await fetch(`${API_URL}/api/languages/${languageId}`, {
      method: 'DELETE',
    });

    const deleteResult = await deleteResponse.json();

    if (!deleteResult.success) {
      console.error('✗ Failed to delete language');
      console.error('Error:', deleteResult.error);
      process.exit(1);
    }

    console.log('✓ Language deleted successfully!');
    console.log('Deleted language ID:', deleteResult.data.id);

    console.log('\n=== All operations completed successfully! ===');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
runLanguageOperations();

