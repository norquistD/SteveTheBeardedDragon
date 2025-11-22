const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function testNeon() {
  try {
    console.log("Testing Neon database connection...\n");

    // Test 1: Simple query to check connection
    console.log("Test 1: Checking database version...");
    const version = await sql`SELECT version()`;
    console.log("✓ Connected successfully!");
    console.log("Database version:", version[0].version);
    console.log("");

    // Test 2: List all tables in the public schema
    console.log("Test 2: Listing tables in public schema...");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    if (tables.length === 0) {
      console.log("No tables found in the public schema.");
    } else {
      console.log(`Found ${tables.length} table(s):`);
      tables.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table.table_name}`);
      });
    }
    console.log("");

    // Test 3: Get current timestamp
    console.log("Test 3: Getting current database timestamp...");
    const timestamp = await sql`SELECT NOW() as current_time`;
    console.log("Current database time:", timestamp[0].current_time);
    console.log("");

    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Error testing Neon database:");
    console.error(error.message);

    if (error.message.includes("DATABASE_URL")) {
      console.error(
        "\n💡 Make sure you have DATABASE_URL set in your .env.local file",
      );
      console.error(
        "   Example: DATABASE_URL=postgresql://user:password@host/database",
      );
    }

    process.exit(1);
  }
}

// Run the test
testNeon();
