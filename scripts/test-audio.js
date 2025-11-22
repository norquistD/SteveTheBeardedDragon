/**
 * Script to test the audio generation endpoint
 * Converts a short paragraph to speech
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const { writeFileSync } = require('node:fs');

async function testAudioGeneration() {
  try {
    console.log('Testing Audio Generation Endpoint...\n');

    const testData = {
      prompt: "El español o castellano es una lengua romance procedente del latín hablado, perteneciente a la familia de lenguas indoeuropeas. Forma parte del grupo ibérico y es originaria de Castilla, reino medieval de la península ibérica. Actualmente, hay más de 600 millones de personas que hablan español, de las cuales más de 500 millones son hablantes nativos, que se suman a quienes tienen competencia limitada (más de 92 millones) y los estudiantes (24,5 millones).",
      voice: 'alloy',
      format: 'mp3',
    };

    console.log('Converting text to speech...');
    console.log('Text:', testData.prompt);
    console.log('');

    const response = await fetch(`${API_URL}/api/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('✗ Failed to generate audio');
      console.error('Status:', response.status);
      console.error('Error:', errorData);
      process.exit(1);
    }

    const audioBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);
    const filename = 'test-audio.mp3';
    writeFileSync(filename, buffer);

    console.log('✓ Audio generated successfully!');
    console.log(`  Saved to: ${filename}`);
    console.log(`  Size: ${buffer.length} bytes`);
    console.log('\n=== Test completed! ===');
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
testAudioGeneration();

