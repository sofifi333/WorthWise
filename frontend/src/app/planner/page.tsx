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
import { FormField } from '@/components/form-field';
import { KPICard } from '@/components/kpi-card';
import { LoadingState } from '@/components/loading-spinner';
import { ErrorState } from '@/components/error-state';
import { CostBreakdownChart } from '@/components/charts/cost-breakdown-chart';
import { EarningsChart } from '@/components/charts/earnings-chart';
import { InstitutionSelector } from '@/components/institution-selector';
import { formatCurrency, formatPercent, formatNumber, formatRatio } from '@/lib/utils';

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">College ROI Planner</h1>
        <p className="text-zinc-600 mt-2">
          Plan your college investment by selecting an institution and major, then customize your assumptions to see detailed financial projections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Institution & Program</CardTitle>
              <CardDescription>Select your school and major</CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle>Housing</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle>Monthly Expenses</CardTitle>
              <CardDescription>Leave blank for $0 (no expense)</CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle>Financial Aid & Loans</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle>Post-Graduation Region</CardTitle>
              <CardDescription>Where will you work after graduation?</CardDescription>
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

          <div className="flex gap-2">
            <Button
              onClick={handleCompute}
              disabled={!canCompute || computeMutation.isPending}
              className="flex-1"
            >
              {computeMutation.isPending ? 'Computing...' : 'Calculate ROI'}
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
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
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
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

              <Card>
                <CardHeader>
                  <CardTitle>Earnings Progression</CardTitle>
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
              <Button onClick={handleExport} variant="outline" className="w-full">
                Export Scenario to CSV
              </Button>

              {/* Data Versions */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    {Object.entries(result.data_versions).map(([dataset, version]) => (
                      <div key={dataset} className="flex justify-between">
                        <span className="text-zinc-600">{dataset}:</span>
                        <span className="font-mono text-zinc-900">{String(version)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!result && !computeMutation.isPending && !computeMutation.isError && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-zinc-500">
                  <p>Select an institution and major, then click &quot;Calculate ROI&quot; to see your results.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

