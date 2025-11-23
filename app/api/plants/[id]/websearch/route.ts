import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { sql } from "@/lib/db";
import { ApiResponse, ApiError } from "@/lib/types";

interface BotanicalInfo {
  origin?: string;
  habitat?: string;
  characteristics?: string;
  interesting_facts?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY environment variable is not set",
        } as ApiError,
        { status: 500 }
      );
    }

    const plantId = parseInt(params.id);
    if (isNaN(plantId)) {
      return NextResponse.json(
        { success: false, error: "Invalid plant ID" } as ApiError,
        { status: 400 }
      );
    }

    // Fetch plant information from database
    const plants = await sql`
      SELECT plant_id, plant_name, plant_scientific_name
      FROM plants
      WHERE plant_id = ${plantId}
    `;

    if (plants.length === 0) {
      return NextResponse.json(
        { success: false, error: "Plant not found" } as ApiError,
        { status: 404 }
      );
    }

    const plant = plants[0] as {
      plant_id: number;
      plant_name: string;
      plant_scientific_name: string;
    };

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create prompt that requests web search and concise botanical information extraction
    const prompt = `Search the web for botanical information about the plant "${plant.plant_name}" (scientific name: ${plant.plant_scientific_name}).

Please search for and extract concise botanical information (2-3 sentences maximum per field) that would be interesting to customers:
1. Origin: Where does this plant originate from? (1-2 sentences)
2. Habitat: What is its natural habitat? (1-2 sentences)
3. Characteristics: Key physical features and appearance (2-3 sentences)
4. Interesting Facts: One interesting botanical fact (1-2 sentences)

Format your response as JSON with the following structure:
{
  "origin": "brief description of origin",
  "habitat": "brief description of natural habitat",
  "characteristics": "brief description of physical characteristics",
  "interesting_facts": "one interesting fact"
}

Keep each field short and concise for mobile display. If you cannot find specific information for any field, use an empty string for that field. Only return valid JSON, no additional text.`;

    // Call OpenAI chat completions API
    // GPT-5.1 should have web search capabilities built-in when the prompt requests it
    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the response text
    const responseText = response.choices[0]?.message?.content;
    if (!responseText) {
      return NextResponse.json(
        {
          success: false,
          error: "No response from OpenAI",
        } as ApiError,
        { status: 500 }
      );
    }

    // Try to parse JSON from response
    let botanicalInfo: BotanicalInfo;
    try {
      // Extract JSON from response (might be wrapped in markdown code blocks)
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
      botanicalInfo = JSON.parse(jsonString.trim());
    } catch (parseError) {
      // If JSON parsing fails, try to extract information from text
      console.error("Failed to parse JSON response:", responseText);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse botanical information from response",
        } as ApiError,
        { status: 500 }
      );
    }

    // Return the botanical information
    return NextResponse.json(
      {
        success: true,
        data: {
          plant_id: plant.plant_id,
          plant_name: plant.plant_name,
          plant_scientific_name: plant.plant_scientific_name,
          botanical_info: botanicalInfo,
        },
      } as ApiResponse<{
        plant_id: number;
        plant_name: string;
        plant_scientific_name: string;
        botanical_info: BotanicalInfo;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching plant web search information:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch plant web search information",
      } as ApiError,
      { status: 500 }
    );
  }
}

