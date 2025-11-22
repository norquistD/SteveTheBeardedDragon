import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Location, ApiResponse, ApiError } from "@/lib/types";
import { createLocationSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get("tour_id");

    let locations: Location[];
    if (tourId) {
      const tourIdNum = parseInt(tourId);
      if (isNaN(tourIdNum)) {
        return NextResponse.json(
          { success: false, error: "Invalid tour_id" } as ApiError,
          { status: 400 }
        );
      }
      locations = (await sql`
        SELECT location_id, tour_id, location_name, location_label, position_x, position_y 
        FROM locations 
        WHERE tour_id = ${tourIdNum} 
        ORDER BY location_id
      `) as Location[];
    } else {
      locations = (await sql`
        SELECT location_id, tour_id, location_name, location_label, position_x, position_y 
        FROM locations 
        ORDER BY location_id
      `) as Location[];
    }

    return NextResponse.json({ success: true, data: locations } as ApiResponse<
      Location[]
    >);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch locations" } as ApiError,
      { status: 500 }
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
        { status: 400 }
      );
    }

    const { tour_id, location_name, location_label, position_x, position_y } =
      validationResult.data;

    // Validate tour_id exists
    const tourCheck =
      await sql`SELECT tour_id FROM tours WHERE tour_id = ${tour_id}`;
    if (tourCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tour not found" } as ApiError,
        { status: 404 }
      );
    }

    const result = (await sql`
      INSERT INTO locations (tour_id, location_name, location_label, position_x, position_y)
      VALUES (${tour_id}, ${location_name}, ${location_label}, ${position_x}, ${position_y})
      RETURNING location_id, tour_id, location_name, location_label, position_x, position_y
    `) as Location[];

    return NextResponse.json(
      { success: true, data: result[0] } as ApiResponse<Location>,
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create location" } as ApiError,
      { status: 500 }
    );
  }
}
