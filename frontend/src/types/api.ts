/**
 * TypeScript types matching backend Pydantic schemas
 */

// ============ Compute Types ============

export interface ComputeRequest {
  institution_id: number;
  cip_code: string;
  credential_level?: number;
  is_instate?: boolean;
  housing_type?: string;
  roommate_count?: number;
  postgrad_region_id?: number | null;
  rent_monthly?: number | null;
  utilities_monthly?: number | null;
  food_monthly?: number | null;
  transport_monthly?: number | null;
  books_annual?: number | null;
  misc_monthly?: number | null;
  aid_annual?: number;
  cash_annual?: number;
  loan_apr?: number;
  effective_tax_rate?: number;
}

export interface KPIResult {
  true_yearly_cost: number;
  tuition_fees: number;
  housing_annual: number;
  other_expenses: number;
  expected_debt_at_grad: number;
  earnings_year_1: number | null;
  earnings_year_3: number | null;
  earnings_year_5: number | null;
  roi: number | null;
  payback_years: number | null;
  dti_year_1: number | null;
  graduation_rate: number | null;
  comfort_index: number | null;
}

export interface ComputeResponse {
  scenario: ComputeRequest;
  kpis: KPIResult;
  assumptions: Record<string, unknown>;
  data_versions: Record<string, string>;
  warnings: string[];
}

// ============ Compare Types ============

export interface CompareRequest {
  scenarios: ComputeRequest[];
}

export interface ScenarioComparison {
  scenario_index: number;
  institution_name: string;
  major_name: string;
  scenario: ComputeRequest;
  kpis: KPIResult | null;
  warnings: string[];
}

export interface CompareResponse {
  comparisons: ScenarioComparison[];
  data_versions: Record<string, string>;
}

// ============ Options Types ============

export interface InstitutionOption {
  id: number;
  name: string;
  city: string;
  state_code: string;
  ownership_label: string;
  tuition_in_state: number | null;
  tuition_out_state: number | null;
  avg_net_price_public: number | null;
  avg_net_price_private: number | null;
  has_data: boolean;
}

export interface CampusOption {
  id: number;
  institution_id: number;
  campus_name: string;
  city: string;
  state_code: string;
  is_main: boolean;
  is_active: boolean;
}

export interface MajorOption {
  cip_code: string;
  cip_title: string;
  category: string;
  institutions_count: number;
  avg_median_earnings: number | null;
}

export interface RegionOption {
  id: number;
  region_name: string;
  region_type: string;
  state_code: string | null;
  geo_fips: string | null;
}

export interface DataVersionResponse {
  dataset_name: string;
  version_identifier: string;
  version_date: string;
  row_count: number | null;
  loaded_at: string;
}

// ============ Health Check ============

export interface HealthResponse {
  status: string;
  version: string;
  database: {
    connected: boolean;
    type: string;
    latency_ms: number | null;
  };
  duckdb: Record<string, unknown>;
  timestamp: string;
}

