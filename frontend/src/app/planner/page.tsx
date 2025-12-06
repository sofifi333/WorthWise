/**
 * Planner Page
 * Single scenario ROI planning with form controls and KPI display
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { optionsApi, computeApi, exportApi, summarizeApi } from '@/lib/api';
import type { ComputeRequest, ComputeResponse, InstitutionOption, SummarizeResponse } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FormField } from '@/components/form-field';
import { KPICard } from '@/components/kpi-card';
import { LoadingState } from '@/components/loading-spinner';
import { ErrorState } from '@/components/error-state';
import { CostBreakdownChart } from '@/components/charts/cost-breakdown-chart';
import { EarningsChart } from '@/components/charts/earnings-chart';
import { InstitutionSelector } from '@/components/institution-selector';
import { formatCurrency, formatPercent, formatNumber, formatRatio } from '@/lib/utils';
import { Calculator, GraduationCap, Home, DollarSign, MapPin, Download, RotateCcw, Sparkles, Database, Zap, Star, Sparkles as SparklesIcon } from 'lucide-react';

// Example scenario definitions
interface ExampleScenario {
  label: string;
  description: string;
  institutionName: string;
  majorName: string;
  data: Partial<ComputeRequest>;
}

const EXAMPLE_SCENARIOS: ExampleScenario[] = [
  {
    label: 'Budget-Conscious Student',
    description: 'CUNY Brooklyn College - Computer Science, living at home',
    institutionName: 'CUNY Brooklyn College',
    majorName: 'Computer and Information Sciences',
    data: {
      credential_level: 3,
      is_instate: true,
      housing_type: 'none',
      roommate_count: 0,
      utilities_monthly: 250,
      food_monthly: 500,
      transport_monthly: 120,
      misc_monthly: 150,
      aid_annual: 2500,
      cash_annual: 0,
      loan_apr: 0,
      effective_tax_rate: 0,
    },
  },
  {
    label: 'Out-of-State Engineering',
    description: 'Public university, Engineering major, shared housing',
    institutionName: 'University of California-Berkeley',
    majorName: 'Mechanical Engineering',
    data: {
      credential_level: 3,
      is_instate: false,
      housing_type: '2BR',
      roommate_count: 1,
      utilities_monthly: 150,
      food_monthly: 400,
      transport_monthly: 100,
      misc_monthly: 200,
      aid_annual: 5000,
      cash_annual: 10000,
      loan_apr: 0.05,
      effective_tax_rate: 0.22,
    },
  },
  {
    label: 'Business Student',
    description: 'State university, Business major, studio apartment',
    institutionName: 'CUNY Bernard M Baruch College',
    majorName: 'Business Administration, Management and Operations',
    data: {
      credential_level: 3,
      is_instate: true,
      housing_type: 'studio',
      roommate_count: 0,
      utilities_monthly: 200,
      food_monthly: 450,
      transport_monthly: 150,
      misc_monthly: 180,
      aid_annual: 3000,
      cash_annual: 5000,
      loan_apr: 0.045,
      effective_tax_rate: 0.20,
    },
  },
];

export default function PlannerPage() {
  const queryClient = useQueryClient();
  
  // Form state
  const [formData, setFormData] = useState<ComputeRequest>({
    institution_id: 0,
    cip_code: '',
    credential_level: 3,
    is_instate: true,
    housing_type: '1BR',
    roommate_count: 0,
    postgrad_region_id: null,
    rent_monthly: null,
    utilities_monthly: null,
    food_monthly: null,
    transport_monthly: null,
    books_annual: null,
    misc_monthly: null,
    aid_annual: 0,
    cash_annual: 0,
    loan_apr: 0,
    effective_tax_rate: 0,
  });

  // Computed result state
  const [result, setResult] = useState<ComputeResponse | null>(null);
  
  // Summary state
  const [summary, setSummary] = useState<SummarizeResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  
  // Example loading state
  const [exampleError, setExampleError] = useState<string | null>(null);
  const [loadingExample, setLoadingExample] = useState(false);

  // Note: Institution fetching is now handled by InstitutionSelector component

  // Fetch majors filtered by institution (only when institution is selected)
  const { data: majors = [], isLoading: loadingMajors } = useQuery({
    queryKey: ['majors', formData.institution_id],
    queryFn: () => optionsApi.getMajors({ 
      institution_id: formData.institution_id || undefined,
      limit: 500 
    }),
    enabled: formData.institution_id > 0, // Only fetch when institution is selected
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => optionsApi.getRegions(),
  });

  // Compute mutation
  const computeMutation = useMutation({
    mutationFn: (request: ComputeRequest) => computeApi.computeScenario(request),
    onSuccess: async (data) => {
      setResult(data);
      
      // Get institution and major names for summary
      // Try to find institution in query cache (same approach as InstitutionSelector)
      let institutionName: string | undefined;
      const allCacheData = queryClient.getQueriesData<InstitutionOption[]>({ queryKey: ['schools'] });
      for (const [, cacheData] of allCacheData) {
        if (cacheData) {
          const found = cacheData.find(inst => inst.id === data.scenario.institution_id);
          if (found) {
            institutionName = found.name;
            break;
          }
        }
      }
      
      // If not in cache, fetch it
      if (!institutionName && data.scenario.institution_id) {
        try {
          const schools = await optionsApi.getSchools({ search: '', limit: 1000 });
          const found = schools.find(s => s.id === data.scenario.institution_id);
          institutionName = found?.name || `Institution ${data.scenario.institution_id}`;
        } catch {
          institutionName = `Institution ${data.scenario.institution_id}`;
        }
      }
      
      // Get major name from majors list
      const major = majors.find(m => m.cip_code === data.scenario.cip_code);
      const majorName = major?.cip_title || `Major ${data.scenario.cip_code}`;
      
      // Generate summary
      if (institutionName && majorName && data.kpis.tuition_fees) {
        setSummaryLoading(true);
        setSummaryError(null);
        try {
          const summaryResult = await summarizeApi.summarize({
            institution_name: institutionName,
            major_name: majorName,
            tuition_fees: data.kpis.tuition_fees,
            earnings_year_1: data.kpis.earnings_year_1,
            earnings_year_3: data.kpis.earnings_year_3,
            roi: data.kpis.roi,
          });
          setSummary(summaryResult);
        } catch (error) {
          console.error('Failed to generate summary:', error);
          setSummaryError('Failed to generate AI summary');
        } finally {
          setSummaryLoading(false);
        }
      }
    },
  });

  const handleInputChange = (field: keyof ComputeRequest, value: number | string | boolean | null) => {
    // Clear major selection when institution changes
    if (field === 'institution_id' && value !== formData.institution_id) {
      setFormData((prev) => ({ ...prev, institution_id: value as number, cip_code: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value } as ComputeRequest));
    }
  };

  const handleCompute = () => {
    if (formData.institution_id && formData.cip_code) {
      computeMutation.mutate(formData);
    }
  };

  const handleExport = async () => {
    if (result) {
      await exportApi.exportScenario(result.scenario);
    }
  };

  const handleReset = () => {
    setFormData({
      institution_id: 0,
      cip_code: '',
      credential_level: 3,
      is_instate: true,
      housing_type: '1BR',
      roommate_count: 0,
      postgrad_region_id: null,
      rent_monthly: null,
      utilities_monthly: null,
      food_monthly: null,
      transport_monthly: null,
      books_annual: null,
      misc_monthly: null,
      aid_annual: 0,
      cash_annual: 0,
      loan_apr: 0,
      effective_tax_rate: 0,
    });
    setResult(null);
    setSummary(null);
    setSummaryError(null);
  };

  const handleLoadExample = async (scenario: ExampleScenario) => {
    setExampleError(null);
    setLoadingExample(true);
    
    try {
      // Search for institution - try multiple search strategies
      let institutions = await optionsApi.getSchools({ 
        search: scenario.institutionName,
        limit: 50 
      });
      
      // Try to find institution with flexible matching
      let institution = institutions.find(inst => {
        const instName = inst.name.toLowerCase();
        const searchName = scenario.institutionName.toLowerCase();
        return instName === searchName || 
               instName.includes(searchName) || 
               searchName.includes(instName.split(',')[0]) ||
               instName.replace(/[^a-z0-9]/g, '') === searchName.replace(/[^a-z0-9]/g, '');
      });
      
      // If not found, try without search parameter to get more results
      if (!institution && institutions.length > 0) {
        // Try finding in the results we got
        institution = institutions[0];
      }
      
      // If still not found, try a broader search
      if (!institution) {
        const searchTerms = scenario.institutionName.split(' ').filter(term => term.length > 2);
        for (const term of searchTerms) {
          institutions = await optionsApi.getSchools({ 
            search: term,
            limit: 50 
          });
          institution = institutions.find(inst => 
            inst.name.toLowerCase().includes(scenario.institutionName.toLowerCase()) ||
            scenario.institutionName.toLowerCase().includes(inst.name.toLowerCase().split(',')[0])
          );
          if (institution) break;
        }
      }
      
      if (!institution) {
        setExampleError(`Could not find institution: ${scenario.institutionName}. Please ensure it exists in the database.`);
        setLoadingExample(false);
        return;
      }

      // Pre-populate the query cache with the selected institution so InstitutionSelector can display it
      queryClient.setQueryData(['schools', ''], (oldData: InstitutionOption[] | undefined) => {
        if (!oldData) return [institution];
        // Check if already in the list
        if (!oldData.find((inst: InstitutionOption) => inst.id === institution.id)) {
          return [institution, ...oldData];
        }
        return oldData;
      });
      
      // Also set it for the institution name search
      queryClient.setQueryData(['schools', institution.name], [institution]);

      // Search for major (filtered by institution) - try multiple strategies
      let majors = await optionsApi.getMajors({ 
        institution_id: institution.id,
        search: scenario.majorName,
        limit: 200 
      });
      
      // Try exact match first
      let major = majors.find(m => 
        m.cip_title.toLowerCase() === scenario.majorName.toLowerCase()
      );
      
      // Try partial match - handle cases like "Computer and Information Sciences, General"
      if (!major) {
        major = majors.find(m => {
          const majorTitle = m.cip_title.toLowerCase();
          const searchName = scenario.majorName.toLowerCase();
          // Remove common suffixes for comparison
          const majorBase = majorTitle.split(',')[0].trim();
          const searchBase = searchName.split(',')[0].trim();
          return majorTitle.includes(searchName) || 
                 searchName.includes(majorBase) ||
                 majorBase.includes(searchName) ||
                 majorBase === searchBase ||
                 majorTitle.startsWith(searchName) ||
                 searchName.startsWith(majorBase);
        });
      }
      
      // Try searching without filter to find similar majors
      if (!major && majors.length > 0) {
        // Try to find any major that contains key words
        const searchWords = scenario.majorName.toLowerCase().split(' ').filter(w => w.length > 3);
        for (const word of searchWords) {
          major = majors.find(m => m.cip_title.toLowerCase().includes(word));
          if (major) break;
        }
      }
      
      // If still not found, try getting all majors for the institution
      if (!major) {
        majors = await optionsApi.getMajors({ 
          institution_id: institution.id,
          limit: 500 
        });
        const searchWords = scenario.majorName.toLowerCase().split(' ').filter(w => w.length > 3);
        for (const word of searchWords) {
          major = majors.find(m => m.cip_title.toLowerCase().includes(word));
          if (major) break;
        }
      }

      if (!major) {
        setExampleError(`Could not find major "${scenario.majorName}" for ${institution.name}. Available majors may differ.`);
        setLoadingExample(false);
        return;
      }

      // Set form data with example scenario
      const newFormData: ComputeRequest = {
        institution_id: institution.id,
        cip_code: major.cip_code,
        credential_level: scenario.data.credential_level ?? 3,
        is_instate: scenario.data.is_instate ?? true,
        housing_type: scenario.data.housing_type ?? '1BR',
        roommate_count: scenario.data.roommate_count ?? 0,
        postgrad_region_id: scenario.data.postgrad_region_id ?? null,
        rent_monthly: scenario.data.rent_monthly ?? null,
        utilities_monthly: scenario.data.utilities_monthly ?? null,
        food_monthly: scenario.data.food_monthly ?? null,
        transport_monthly: scenario.data.transport_monthly ?? null,
        books_annual: scenario.data.books_annual ?? null,
        misc_monthly: scenario.data.misc_monthly ?? null,
        aid_annual: scenario.data.aid_annual ?? 0,
        cash_annual: scenario.data.cash_annual ?? 0,
        loan_apr: scenario.data.loan_apr ?? 0,
        effective_tax_rate: scenario.data.effective_tax_rate ?? 0,
      };

      setFormData(newFormData);
      setLoadingExample(false);
      
      // Invalidate majors query to ensure it refetches with new institution
      queryClient.invalidateQueries({ queryKey: ['majors', institution.id] });
      
      // Wait for majors to load, then calculate
      setTimeout(() => {
        computeMutation.mutate(newFormData);
      }, 500);
    } catch (error) {
      console.error('Error loading example:', error);
      setExampleError('Failed to load example scenario. Please try again or check your connection.');
      setLoadingExample(false);
    }
  };

  const canCompute = formData.institution_id > 0 && formData.cip_code !== '';

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl blur-3xl opacity-50"></div>
        <div className="bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm rounded-2xl border-2 border-blue-100 p-8 shadow-lg overflow-visible min-h-0">
          <div className="flex items-start justify-between mb-4">
            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
              <Calculator className="w-3 h-3 mr-1" />
              ROI Calculator
            </Badge>
            <Button 
              onClick={handleReset} 
              variant="outline" 
              className="border-2 hover:bg-slate-50 text-sm"
              title="Reset all fields"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 break-words overflow-visible">
            College ROI Planner
          </h1>
          <p className="text-lg text-slate-600 mt-3 max-w-3xl">
            Plan your college investment by selecting an institution and major, then customize your assumptions to see detailed financial projections.
          </p>
          
          {/* Example Scenarios */}
          <div className="mt-6 pt-6 border-t border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-700">Try Example Scenarios:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {EXAMPLE_SCENARIOS.map((scenario, index) => (
                <Button
                  key={index}
                  onClick={() => handleLoadExample(scenario)}
                  variant="outline"
                  className="border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-sm"
                  disabled={computeMutation.isPending || loadingExample}
                >
                  <Zap className="w-3 h-3 mr-2" />
                  {loadingExample ? 'Loading...' : scenario.label}
                </Button>
              ))}
            </div>
            {exampleError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{exampleError}</p>
                <button
                  onClick={() => setExampleError(null)}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Click any example to prefill the form and calculate ROI automatically
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-2 hover:border-blue-200 transition-all shadow-md hover:shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Institution & Program</CardTitle>
                  <CardDescription>Select your school and major</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Institution" htmlFor="institution" required>
                <InstitutionSelector
                  value={formData.institution_id || undefined}
                  onValueChange={(value) => handleInputChange('institution_id', value)}
                  placeholder="Search for an institution..."
                />
              </FormField>

              <FormField label="Major" htmlFor="major" required>
                {!formData.institution_id ? (
                  <Select disabled>
                    <option>Select an institution first...</option>
                  </Select>
                ) : loadingMajors ? (
                  <Select disabled>
                    <option>Loading majors...</option>
                  </Select>
                ) : majors.length === 0 ? (
                  <Select disabled>
                    <option>No majors available for this institution</option>
                  </Select>
                ) : (
                  <Select
                    id="major"
                    value={formData.cip_code || ''}
                    onChange={(e) => handleInputChange('cip_code', e.target.value)}
                  >
                    <option value="">Select major...</option>
                    {majors.map((major) => (
                      <option key={major.cip_code} value={major.cip_code}>
                        {major.cip_title}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>

              <FormField label="Credential Level" htmlFor="credential">
                <Select
                  id="credential"
                  value={formData.credential_level}
                  onChange={(e) => handleInputChange('credential_level', Number(e.target.value))}
                >
                  <option value={1}>Certificate</option>
                  <option value={2}>Associate&apos;s</option>
                  <option value={3}>Bachelor&apos;s</option>
                  <option value={5}>Master&apos;s</option>
                  <option value={6}>Doctorate</option>
                </Select>
              </FormField>

              <FormField label="Residency Status" htmlFor="residency">
                <Select
                  id="residency"
                  value={formData.is_instate ? 'instate' : 'outstate'}
                  onChange={(e) => handleInputChange('is_instate', e.target.value === 'instate')}
                >
                  <option value="instate">In-State</option>
                  <option value="outstate">Out-of-State</option>
                </Select>
              </FormField>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-200 transition-all shadow-md hover:shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-xl">Housing</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Housing Type" htmlFor="housing">
                <Select
                  id="housing"
                  value={formData.housing_type}
                  onChange={(e) => handleInputChange('housing_type', e.target.value)}
                >
                  <option value="none">No Housing (Living at Home)</option>
                  <option value="studio">Studio</option>
                  <option value="1BR">1 Bedroom</option>
                  <option value="2BR">2 Bedrooms</option>
                  <option value="3BR">3 Bedrooms</option>
                  <option value="4BR">4 Bedrooms</option>
                </Select>
              </FormField>

              {formData.housing_type !== 'none' && (
                <>
                  <FormField label="Roommate Count" htmlFor="roommates">
                    <Input
                      id="roommates"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.roommate_count}
                      onChange={(e) => handleInputChange('roommate_count', Number(e.target.value))}
                    />
                  </FormField>

                  <FormField label="Monthly Rent Override (optional)" htmlFor="rent">
                    <Input
                      id="rent"
                      type="number"
                      min="0"
                      placeholder="Leave blank to use FMR data"
                      value={formData.rent_monthly || ''}
                      onChange={(e) => handleInputChange('rent_monthly', e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormField>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-200 transition-all shadow-md hover:shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Monthly Expenses</CardTitle>
                  <CardDescription>Leave blank for $0 (no expense)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Utilities" htmlFor="utilities">
                <Input
                  id="utilities"
                  type="number"
                  min="0"
                  placeholder="$/month"
                  value={formData.utilities_monthly || ''}
                  onChange={(e) => handleInputChange('utilities_monthly', e.target.value ? Number(e.target.value) : null)}
                />
              </FormField>

              <FormField label="Food" htmlFor="food">
                <Input
                  id="food"
                  type="number"
                  min="0"
                  placeholder="$/month"
                  value={formData.food_monthly || ''}
                  onChange={(e) => handleInputChange('food_monthly', e.target.value ? Number(e.target.value) : null)}
                />
              </FormField>

              <FormField label="Transportation" htmlFor="transport">
                <Input
                  id="transport"
                  type="number"
                  min="0"
                  placeholder="$/month"
                  value={formData.transport_monthly || ''}
                  onChange={(e) => handleInputChange('transport_monthly', e.target.value ? Number(e.target.value) : null)}
                />
              </FormField>

              <FormField label="Miscellaneous" htmlFor="misc">
                <Input
                  id="misc"
                  type="number"
                  min="0"
                  placeholder="$/month"
                  value={formData.misc_monthly || ''}
                  onChange={(e) => handleInputChange('misc_monthly', e.target.value ? Number(e.target.value) : null)}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-indigo-200 transition-all shadow-md hover:shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-xl">Financial Aid & Loans</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Annual Grants/Scholarships" htmlFor="aid">
                <Input
                  id="aid"
                  type="number"
                  min="0"
                  placeholder="$/year"
                  value={formData.aid_annual}
                  onChange={(e) => handleInputChange('aid_annual', Number(e.target.value))}
                />
              </FormField>

              <FormField label="Annual Cash Contribution" htmlFor="cash">
                <Input
                  id="cash"
                  type="number"
                  min="0"
                  placeholder="$/year"
                  value={formData.cash_annual}
                  onChange={(e) => handleInputChange('cash_annual', Number(e.target.value))}
                />
              </FormField>

              <FormField label="Loan APR" htmlFor="apr">
                <Input
                  id="apr"
                  type="number"
                  step="0.001"
                  min="0"
                  max="1"
                  value={formData.loan_apr}
                  onChange={(e) => handleInputChange('loan_apr', Number(e.target.value))}
                />
              </FormField>

              <FormField label="Effective Tax Rate" htmlFor="tax">
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.effective_tax_rate}
                  onChange={(e) => handleInputChange('effective_tax_rate', Number(e.target.value))}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-orange-200 transition-all shadow-md hover:shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Post-Graduation Region</CardTitle>
                  <CardDescription>Where will you work after graduation?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FormField label="Region" htmlFor="region">
                <Select
                  id="region"
                  value={formData.postgrad_region_id || ''}
                  onChange={(e) => handleInputChange('postgrad_region_id', e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">National average</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.region_name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleCompute}
              disabled={!canCompute || computeMutation.isPending}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all h-12"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {computeMutation.isPending ? 'Computing...' : 'Calculate ROI'}
            </Button>
            <Button onClick={handleReset} variant="outline" className="border-2 hover:bg-slate-50 h-12 px-4">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {computeMutation.isPending && <LoadingState message="Computing your ROI..." />}
          
          {computeMutation.isError && (
            <ErrorState
              message={
                (computeMutation.error instanceof Error && 'response' in computeMutation.error 
                  ? (computeMutation.error.response as { data?: { detail?: string } })?.data?.detail 
                  : undefined) || 'Failed to compute ROI'
              }
              onRetry={handleCompute}
            />
          )}

          {result && (
            <>
              {/* Warnings */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">Warnings</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {result.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm text-yellow-800">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* KPIs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <KPICard
                  title="True Yearly Cost"
                  value={formatCurrency(result.kpis.true_yearly_cost)}
                  description="Total annual cost including all expenses"
                />
                <KPICard
                  title="Expected Debt at Graduation"
                  value={formatCurrency(result.kpis.expected_debt_at_grad)}
                  description="Projected total debt"
                />
                <KPICard
                  title="Year 1 Earnings"
                  value={formatCurrency(result.kpis.earnings_year_1)}
                  description="Post-graduation"
                  trend="positive"
                />
                <KPICard
                  title="Year 3 Earnings"
                  value={formatCurrency(result.kpis.earnings_year_3)}
                  description="Post-graduation"
                  trend="positive"
                />
                <KPICard
                  title="Year 5 Earnings"
                  value={formatCurrency(result.kpis.earnings_year_5)}
                  description="Post-graduation"
                  trend="positive"
                />
                <KPICard
                  title="Return on Investment"
                  value={result.kpis.roi !== null ? formatRatio(result.kpis.roi) : 'N/A'}
                  description="ROI ratio"
                  trend={result.kpis.roi && result.kpis.roi > 2 ? 'positive' : 'neutral'}
                />
                <KPICard
                  title="Payback Period"
                  value={result.kpis.payback_years !== null ? `${formatNumber(result.kpis.payback_years)} years` : 'N/A'}
                  description="Years to pay off debt"
                />
                <KPICard
                  title="Debt-to-Income (Year 1)"
                  value={formatPercent(result.kpis.dti_year_1)}
                  description="DTI ratio"
                  trend={result.kpis.dti_year_1 && result.kpis.dti_year_1 < 0.3 ? 'positive' : result.kpis.dti_year_1 && result.kpis.dti_year_1 > 0.5 ? 'negative' : 'neutral'}
                />
                <KPICard
                  title="Graduation Rate"
                  value={formatPercent(result.kpis.graduation_rate)}
                  description="Institution completion rate"
                />
                <KPICard
                  title="Comfort Index"
                  value={result.kpis.comfort_index !== null ? formatNumber(result.kpis.comfort_index, 0) : 'N/A'}
                  description="Financial comfort score (0-100)"
                  trend={result.kpis.comfort_index && result.kpis.comfort_index > 70 ? 'positive' : result.kpis.comfort_index && result.kpis.comfort_index < 40 ? 'negative' : 'neutral'}
                />
              </div>

              {/* AI Summary */}
              <Card className="border-2 border-purple-100 shadow-lg bg-gradient-to-br from-white to-purple-50/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-purple-600" />
                    AI-Powered Analysis
                  </CardTitle>
                  <CardDescription>AI-generated summary of your ROI analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {summaryLoading && (
                    <div className="flex items-center justify-center py-8">
                      <LoadingState message="Generating AI summary..." />
                    </div>
                  )}
                  
                  {summaryError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">{summaryError}</p>
                    </div>
                  )}
                  
                  {summary && !summaryLoading && (
                    <>
                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-semibold text-slate-700">Rating:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= summary.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600">({summary.rating}/5)</span>
                      </div>
                      
                      {/* Summary Text */}
                      <div className="prose prose-sm max-w-none">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {summary.summary}
                        </p>
                      </div>
                    </>
                  )}
                  
                  {!summary && !summaryLoading && !summaryError && (
                    <p className="text-sm text-slate-500 italic">
                      Summary will be generated automatically after calculation...
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Charts */}
              <Card className="border-2 border-blue-100 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                    Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CostBreakdownChart
                    data={{
                      tuition: result.kpis.tuition_fees,
                      housing: result.kpis.housing_annual,
                      other: result.kpis.other_expenses,
                    }}
                  />
                </CardContent>
              </Card>

              <Card className="border-2 border-green-100 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-green-600" />
                    Earnings Progression
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EarningsChart
                    data={{
                      year1: result.kpis.earnings_year_1,
                      year3: result.kpis.earnings_year_3,
                      year5: result.kpis.earnings_year_5,
                    }}
                  />
                </CardContent>
              </Card>

              {/* Export Button */}
              <Button onClick={handleExport} variant="outline" className="w-full border-2 hover:border-blue-400 hover:bg-blue-50 h-12 text-base font-semibold group">
                <Download className="w-4 h-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                Export Scenario to CSV
              </Button>

              {/* Data Versions */}
              <Card className="border-2 border-slate-200 bg-slate-50/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="w-5 h-5 text-slate-600" />
                    Data Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    {Object.entries(result.data_versions).map(([dataset, version]) => (
                      <div key={dataset} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                        <span className="text-slate-700 font-medium">{dataset}</span>
                        <span className="font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded">{String(version)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!result && !computeMutation.isPending && !computeMutation.isError && (
            <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-10 h-10 text-blue-600" />
                  </div>
                  <p className="text-slate-600 text-lg">Select an institution and major, then click <span className="font-semibold">&quot;Calculate ROI&quot;</span> to see your results.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

