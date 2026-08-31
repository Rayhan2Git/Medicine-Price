export interface Brand {
  id: number;
  name: string;
  name_bn?: string;
  strength?: string;
  dosage_form?: string;
  manufacturer?: string;
  unit_price?: number | null;
  strip_price?: number | null;
  box_price?: number | null;
  slug?: string;
  generic_name?: string;
  generic_id?: number;
}

export interface BrandDetail extends Brand {
  indications?: string;
  pharmacology?: string;
  dosage?: string;
  side_effects?: string;
  contraindications?: string;
  alternatives?: Brand[];
}

export interface SearchResult {
  query: string;
  results: Brand[];
  total: number;
}

export interface AlternativesResponse {
  generic: { id: number; name: string };
  brands: Brand[];
}

export interface PrescriptionMedicine {
  raw_name: string;
  strength: string;
  frequency: string;
  suggested_generic: string;
  confidence: number;
  db_matches: Brand[];
  cheapest?: Brand | null;
}

export interface PrescriptionResult {
  ocr_text: string;
  medicines: PrescriptionMedicine[];
  total_found: number;
  total_estimated_price: number;
}

export interface Stats {
  generics: number;
  brands: number;
  brands_with_price: number;
}