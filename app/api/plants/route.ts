import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Plant, ApiResponse, ApiError } from "@/lib/types";
import { createPlantSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const plants = await sql`
      SELECT plant_id, plant_name, plant_scientific_name 
      FROM plants 
      ORDER BY plant_id
    ` as Plant[];
    return NextResponse.json({ success: true, data: plants } as ApiResponse<
      Plant[]
    >);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch plants" } as ApiError,
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = createPlantSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        } as ApiError,
        { status: 400 },
      );
    }

    const { plant_name, plant_scientific_name } = validationResult.data;

    const result = await sql`
      INSERT INTO plants (plant_name, plant_scientific_name)
      VALUES (${plant_name}, ${plant_scientific_name})
      RETURNING plant_id, plant_name, plant_scientific_name
    ` as Plant[];

    return NextResponse.json(
      { success: true, data: result[0] } as ApiResponse<Plant>,
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create plant" } as ApiError,
      { status: 500 },
    );
  }
}

