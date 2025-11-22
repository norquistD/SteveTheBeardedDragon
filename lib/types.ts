export interface Dome {
  dome_id: number;
  dome_name: string;
  dome_image_url: string;
}

export interface Tour {
  tour_id: number;
  tour_name: string;
  tour_description: string;
  tour_path_image_url: string;
}

export interface Location {
  location_id: number;
  tour_id: number;
  location_name: string;
  location_label: string;
  position_x: number;
  position_y: number;
}

export interface Language {
  language_id: number;
  language_code: string;
  language_name: string;
  language_native_name: string;
}

export interface Content {
  content_id: number;
  content: string;
  is_url: boolean;
  language_id: number;
}

export interface Block {
  block_id: number;
  content_id_left: number | null;
  content_id_right: number | null;
  location_id: number;
  position: number | null;
}

export interface Plant {
  plant_id: number;
  plant_name: string;
  plant_scientific_name: string;
}

export interface PlantBlock {
  block_id: number;
  content_id_left: number | null;
  content_id_right: number | null;
  plant_id: number;
  position: number | null;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}
