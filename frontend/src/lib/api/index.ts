/**
 * API Service Layer
 * All API calls to backend
 */

import apiClient from '../api-client';
import type {
  ComputeRequest,
  ComputeResponse,
  CompareRequest,
  CompareResponse,
  InstitutionOption,
  CampusOption,
  MajorOption,
  RegionOption,
  DataVersionResponse,
  HealthResponse,
} from '@/types/api';

// ============ Options API ============

export const optionsApi = {
  getSchools: async (params?: { state?: string; search?: string; limit?: number }) => {
    const response = await apiClient.get<InstitutionOption[]>('/options/schools', { params });
    return response.data;
  },

  getCampuses: async (institutionId: number) => {
    const response = await apiClient.get<CampusOption[]>('/options/campuses', {
      params: { institution_id: institutionId },
    });
    return response.data;
  },

  getMajors: async (params?: { institution_id?: number; category?: string; search?: string; limit?: number }) => {
    const response = await apiClient.get<MajorOption[]>('/options/majors', { params });
    return response.data;
  },

  getRegions: async (params?: { region_type?: string; state?: string }) => {
    const response = await apiClient.get<RegionOption[]>('/options/regions', { params });
    return response.data;
  },

  getVersions: async () => {
    const response = await apiClient.get<DataVersionResponse[]>('/options/versions');
    return response.data;
  },
};

// ============ Compute API ============

export const computeApi = {
  computeScenario: async (request: ComputeRequest) => {
    const response = await apiClient.post<ComputeResponse>('/compute', request);
    return response.data;
  },

  compareScenarios: async (request: CompareRequest) => {
    const response = await apiClient.post<CompareResponse>('/compare', request);
    return response.data;
  },
};

// ============ Export API ============

export const exportApi = {
  exportScenario: async (scenario: ComputeRequest) => {
    const params = new URLSearchParams();
    Object.entries(scenario).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, String(value));
      }
    });
    
    const response = await apiClient.get('/export/scenario.csv', {
      params,
      responseType: 'blob',
    });
    
    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'scenario.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  exportComparison: async (request: CompareRequest) => {
    const response = await apiClient.post('/export/compare.csv', request, {
      responseType: 'blob',
    });
    
    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'comparison.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

// ============ Health API ============

export const healthApi = {
  check: async () => {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },
};

