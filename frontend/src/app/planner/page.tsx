/**
 * Planner Page
 * Single scenario ROI planning with form controls and KPI display
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { optionsApi, computeApi, exportApi } from '@/lib/api';
import type { ComputeRequest, ComputeResponse } from '@/types/api';
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
import { Calculator, GraduationCap, Home, DollarSign, MapPin, Download, RotateCcw, Sparkles, Database } from 'lucide-react';

export default function PlannerPage() {
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
    onSuccess: (data) => {
      setResult(data);
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
  };

  const canCompute = formData.institution_id > 0 && formData.cip_code !== '';

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl blur-3xl opacity-50"></div>
        <div className="bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm rounded-2xl border-2 border-blue-100 p-8 shadow-lg overflow-visible min-h-0">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <Calculator className="w-3 h-3 mr-1" />
            ROI Calculator
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 break-words overflow-visible">
            College ROI Planner
          </h1>
          <p className="text-lg text-slate-600 mt-3 max-w-3xl">
            Plan your college investment by selecting an institution and major, then customize your assumptions to see detailed financial projections.
          </p>
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

