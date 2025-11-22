import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Tour, ApiResponse, ApiError } from "@/lib/types";
import { createTourSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const tours = await sql`
      SELECT tour_id, tour_name, tour_description, tour_path_image_url 
      FROM tours 
      ORDER BY tour_id
    ` as Tour[];
    return NextResponse.json({ success: true, data: tours } as ApiResponse<
      Tour[]
    >);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch tours" } as ApiError,
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = createTourSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        } as ApiError,
        { status: 400 },
      );
    }

    const { tour_name, tour_description, tour_path_image_url } =
      validationResult.data;

    const result = await sql`
      INSERT INTO tours (tour_name, tour_description, tour_path_image_url)
      VALUES (${tour_name}, ${tour_description}, ${tour_path_image_url})
      RETURNING tour_id, tour_name, tour_description, tour_path_image_url
    ` as Tour[];

    return NextResponse.json(
      { success: true, data: result[0] } as ApiResponse<Tour>,
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create tour" } as ApiError,
      { status: 500 },
    );
  }
}

