/**
 * Script to test the search endpoint
 * Tests the /api/search endpoint
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Get search query from command line arguments or use default
const searchQuery = process.argv[2] || 'cactus';

async function testSearch() {
  try {
    console.log('Testing Search Endpoint...\n');

    console.log('Searching for:', searchQuery);
    console.log('');

    // Try GET request first with query parameter
    const url = `${API_URL}/api/search?q=${encodeURIComponent(searchQuery)}`;
    console.log('Making GET request to:', url);

    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If GET fails with 405, try POST
    if (response.status === 405) {
      console.log('GET not allowed, trying POST...\n');
      response = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('✗ Failed to search');
      console.error('Status:', response.status);
      console.error('Error:', errorData);
      process.exit(1);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✓ Search successful!');
      console.log('\nSearch Results:');
      console.log(JSON.stringify(result.data, null, 2));
      console.log('\n=== Test completed! ===');
    } else {
      console.error('✗ Search failed');
      console.error('Error:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
    if (error.message.includes('fetch')) {
      console.error('\n💡 Make sure the development server is running:');
      console.error('   npm run dev');
    }
    process.exit(1);
  }
}

// Run the test
testSearch();

