/**
 * Script to create, update, get, and delete a content
 * Demonstrates full CRUD operations
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function runContentOperations() {
  let contentId;
  let languageId;

  try {
    // 0. Create a language first (dependency)
    console.log('\n=== Step 0: Creating language (dependency) ===');
    const languageData = {
      language_code: 'en',
      language_name: 'English',
      language_native_name: 'English',
    };

    console.log('Creating language with data:', languageData);
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

    // 1. Create a content
    console.log('\n=== Step 1: Creating content ===');
    const contentData = {
      content: 'https://example.com/test-content',
      is_url: true,
      language_id: languageId,
    };

    console.log('Creating content with data:', contentData);
    const createResponse = await fetch(`${API_URL}/api/contents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contentData),
    });

    const createResult = await createResponse.json();

    if (!createResult.success) {
      console.error('✗ Failed to create content');
      console.error('Error:', createResult.error);
      process.exit(1);
    }

    console.log('✓ Content created successfully!');
    console.log('Created content:', createResult.data);
    contentId = parseInt(createResult.data.content_id);
    console.log(`Content ID: ${contentId}`);

    // 2. Update the content
    console.log('\n=== Step 2: Updating content ===');
    const updateData = {
      content: 'https://example.com/updated-content',
    };

    console.log(`Updating content ${contentId} with new content: ${updateData.content}`);
    const updateResponse = await fetch(`${API_URL}/api/contents/${contentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const updateResult = await updateResponse.json();

    if (!updateResult.success) {
      console.error('✗ Failed to update content');
      console.error('Error:', updateResult.error);
      process.exit(1);
    }

    console.log('✓ Content updated successfully!');
    console.log('Updated content:', updateResult.data);

    // 3. Get the content by ID
    console.log('\n=== Step 3: Getting content by ID ===');
    console.log(`Fetching content ${contentId}`);
    const getResponse = await fetch(`${API_URL}/api/contents/${contentId}`);

    const getResult = await getResponse.json();

    if (!getResult.success) {
      console.error('✗ Failed to get content');
      console.error('Error:', getResult.error);
      process.exit(1);
    }

    console.log('✓ Content retrieved successfully!');
    console.log('Retrieved content:', getResult.data);

    // 4. Delete the content
    console.log('\n=== Step 4: Deleting content ===');
    console.log(`Deleting content ${contentId}`);
    const deleteResponse = await fetch(`${API_URL}/api/contents/${contentId}`, {
      method: 'DELETE',
    });

    const deleteResult = await deleteResponse.json();

    if (!deleteResult.success) {
      console.error('✗ Failed to delete content');
      console.error('Error:', deleteResult.error);
      process.exit(1);
    }

    console.log('✓ Content deleted successfully!');
    console.log('Deleted content ID:', deleteResult.data.id);

    // 5. Clean up: Delete the language
    console.log('\n=== Step 5: Cleaning up language ===');
    console.log(`Deleting language ${languageId}`);
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
runContentOperations();

