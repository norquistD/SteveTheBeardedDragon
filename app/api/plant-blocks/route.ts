import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { PlantBlock, ApiResponse, ApiError } from "@/lib/types";
import { createPlantBlockSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plantId = searchParams.get("plant_id");

    let plantBlocks: PlantBlock[];
    if (plantId) {
      const plantIdNum = parseInt(plantId);
      if (isNaN(plantIdNum)) {
        return NextResponse.json(
          { success: false, error: "Invalid plant_id" } as ApiError,
          { status: 400 },
        );
      }
      plantBlocks = await sql`
        SELECT block_id, content_id_left, content_id_right, plant_id, position 
        FROM plant_blocks 
        WHERE plant_id = ${plantIdNum} 
        ORDER BY block_id
      ` as PlantBlock[];
    } else {
      plantBlocks = await sql`
        SELECT block_id, content_id_left, content_id_right, plant_id, position 
        FROM plant_blocks 
        ORDER BY block_id
      ` as PlantBlock[];
    }

    return NextResponse.json({ success: true, data: plantBlocks } as ApiResponse<
      PlantBlock[]
    >);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch plant blocks" } as ApiError,
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = createPlantBlockSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        } as ApiError,
        { status: 400 },
      );
    }

    const { content_id_left, content_id_right, plant_id, position } =
      validationResult.data;

    // Validate plant_id exists
    const plantCheck =
      await sql`SELECT plant_id FROM plants WHERE plant_id = ${plant_id}`;
    if (plantCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Plant not found" } as ApiError,
        { status: 404 },
      );
    }

    const result = await sql`
      INSERT INTO plant_blocks (content_id_left, content_id_right, plant_id, position)
      VALUES (${content_id_left ?? null}, ${content_id_right ?? null}, ${plant_id}, ${position ?? null})
      RETURNING block_id, content_id_left, content_id_right, plant_id, position
    ` as PlantBlock[];

    return NextResponse.json(
      { success: true, data: result[0] } as ApiResponse<PlantBlock>,
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create plant block" } as ApiError,
      { status: 500 },
    );
  }
}

