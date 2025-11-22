export interface Dome {
  dome_id: number;
  dome_name: string;
  dome_image_url: string;
  dome_path_image_url: string;
}

export interface Location {
  location_id: number;
  dome_id: number;
  location_name: string;
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

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}
