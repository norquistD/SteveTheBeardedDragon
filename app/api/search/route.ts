import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Plant, ApiResponse, ApiError } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    // If no query or empty query, return all plants
    if (!query || query.trim() === "") {
      const plants = await sql`
        SELECT plant_id, plant_name, plant_scientific_name 
        FROM plants 
        ORDER BY plant_name
        LIMIT 500
      ` as Plant[];

      return NextResponse.json({
        success: true,
        data: plants,
      } as ApiResponse<Plant[]>);
    }

    const searchTerm = `%${query.trim()}%`;

    const plants = await sql`
      SELECT plant_id, plant_name, plant_scientific_name 
      FROM plants 
      WHERE 
        plant_name ILIKE ${searchTerm} 
        OR plant_scientific_name ILIKE ${searchTerm}
      ORDER BY 
        CASE 
          WHEN plant_name ILIKE ${query.trim()} THEN 1
          WHEN plant_name ILIKE ${searchTerm} THEN 2
          WHEN plant_scientific_name ILIKE ${query.trim()} THEN 3
          ELSE 4
        END,
        plant_name
      LIMIT 50
    ` as Plant[];

    return NextResponse.json({
      success: true,
      data: plants,
    } as ApiResponse<Plant[]>);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search plants" } as ApiError,
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query || body.q;

    if (!query || query.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Search query is required" } as ApiError,
        { status: 400 },
      );
    }

    const searchTerm = `%${query.trim()}%`;

    const plants = await sql`
      SELECT plant_id, plant_name, plant_scientific_name 
      FROM plants 
      WHERE 
        plant_name ILIKE ${searchTerm} 
        OR plant_scientific_name ILIKE ${searchTerm}
      ORDER BY 
        CASE 
          WHEN plant_name ILIKE ${query.trim()} THEN 1
          WHEN plant_name ILIKE ${searchTerm} THEN 2
          WHEN plant_scientific_name ILIKE ${query.trim()} THEN 3
          ELSE 4
        END,
        plant_name
      LIMIT 50
    ` as Plant[];

    return NextResponse.json({
      success: true,
      data: plants,
    } as ApiResponse<Plant[]>);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search plants" } as ApiError,
      { status: 500 },
    );
  }
}

