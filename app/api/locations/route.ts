import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Location, ApiResponse, ApiError } from "@/lib/types";
import { createLocationSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domeId = searchParams.get("dome_id");

    let locations: Location[];
    if (domeId) {
      const domeIdNum = parseInt(domeId);
      if (isNaN(domeIdNum)) {
        return NextResponse.json(
          { success: false, error: "Invalid dome_id" } as ApiError,
          { status: 400 },
        );
      }
      locations = await sql`
        SELECT location_id, dome_id, location_name 
        FROM locations 
        WHERE dome_id = ${domeIdNum} 
        ORDER BY location_id
      ` as Location[];
    } else {
      locations = await sql`
        SELECT location_id, dome_id, location_name 
        FROM locations 
        ORDER BY location_id
      ` as Location[];
    }

    return NextResponse.json({ success: true, data: locations } as ApiResponse<
      Location[]
    >);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch locations" } as ApiError,
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = createLocationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        } as ApiError,
        { status: 400 },
      );
    }

    const { dome_id, location_name } = validationResult.data;

    // Validate dome_id exists
    const domeCheck =
      await sql`SELECT dome_id FROM domes WHERE dome_id = ${dome_id}`;
    if (domeCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Dome not found" } as ApiError,
        { status: 404 },
      );
    }

    const result = await sql`
      INSERT INTO locations (dome_id, location_name)
      VALUES (${dome_id}, ${location_name})
      RETURNING location_id, dome_id, location_name
    ` as Location[];

    return NextResponse.json(
      { success: true, data: result[0] } as ApiResponse<Location>,
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create location" } as ApiError,
      { status: 500 },
    );
  }
}
