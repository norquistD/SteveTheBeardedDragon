/**
 * Script to test the moderation endpoint
 * Tests the /api/moderate POST endpoint
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testModeration() {
  try {
    console.log('Testing Moderation Endpoint...\n');

    const testData = {
    // Russian for "We need to kill this guy with a hammer."
      input: 'Нужно убить этого парня молотком.',
    };

    console.log('Moderating text...');
    console.log('Input text:', testData.input);
    console.log('');

    const response = await fetch(`${API_URL}/api/moderate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('✗ Failed to moderate content');
      console.error('Status:', response.status);
      console.error('Error:', errorData);
      process.exit(1);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✓ Moderation successful!');
      console.log('\nModeration Results:');
      console.log(JSON.stringify(result.data, null, 2));
      console.log('\n=== Test completed! ===');
    } else {
      console.error('✗ Moderation failed');
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
testModeration();

