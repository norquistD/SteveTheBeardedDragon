/**
 * Script to test the translation endpoint
 * Tests the /api/translate POST endpoint
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testTranslation() {
  try {
    console.log('Testing Translation Endpoint...\n');

    const testData = {
      text: 'The quick brown fox jumps over the lazy dog. This is a test of the translation system.',
      source_language: 'English',
      target_language: 'Russian',
    };

    console.log('Translating text...');
    console.log('Source language:', testData.source_language);
    console.log('Target language:', testData.target_language);
    console.log('Original text:', testData.text);
    console.log('');

    const response = await fetch(`${API_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('✗ Failed to translate text');
      console.error('Status:', response.status);
      console.error('Error:', errorData);
      process.exit(1);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✓ Translation successful!');
      console.log('Translated text:', result.data.translation);
      console.log('\n=== Test completed! ===');
    } else {
      console.error('✗ Translation failed');
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
testTranslation();

