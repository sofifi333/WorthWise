/**
 * Compare Page
 * Side-by-side comparison of up to 4 scenarios
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { optionsApi, computeApi, exportApi } from '@/lib/api';
import type { ComputeRequest, CompareResponse } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/form-field';
import { LoadingState } from '@/components/loading-spinner';
import { ErrorState } from '@/components/error-state';
import { ComparisonChart } from '@/components/charts/comparison-chart';
import { InstitutionSelector } from '@/components/institution-selector';
import { formatCurrency, formatPercent, formatNumber, formatRatio } from '@/lib/utils';

export default function ComparePage() {
  const [scenarios, setScenarios] = useState<ComputeRequest[]>([
    {
      institution_id: 0,
      cip_code: '',
      credential_level: 3,
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
    },
  ]);

  const [result, setResult] = useState<CompareResponse | null>(null);

  // Note: Institution fetching is now handled by InstitutionSelector component

  // Fetch majors for each scenario based on their institution_id
  // Fixed number of queries (max 4 scenarios per PRD) to comply with Rules of Hooks
  const majorsQuery0 = useQuery({
    queryKey: ['majors', scenarios[0]?.institution_id, 0],
    queryFn: () => optionsApi.getMajors({ 
      institution_id: scenarios[0]?.institution_id || undefined,
      limit: 500 
    }),
    enabled: !!scenarios[0] && scenarios[0].institution_id > 0,
  });

  const majorsQuery1 = useQuery({
    queryKey: ['majors', scenarios[1]?.institution_id, 1],
    queryFn: () => optionsApi.getMajors({ 
      institution_id: scenarios[1]?.institution_id || undefined,
      limit: 500 
    }),
    enabled: !!scenarios[1] && scenarios[1].institution_id > 0,
  });

  const majorsQuery2 = useQuery({
    queryKey: ['majors', scenarios[2]?.institution_id, 2],
    queryFn: () => optionsApi.getMajors({ 
      institution_id: scenarios[2]?.institution_id || undefined,
      limit: 500 
    }),
    enabled: !!scenarios[2] && scenarios[2].institution_id > 0,
  });

  const majorsQuery3 = useQuery({
    queryKey: ['majors', scenarios[3]?.institution_id, 3],
    queryFn: () => optionsApi.getMajors({ 
      institution_id: scenarios[3]?.institution_id || undefined,
      limit: 500 
    }),
    enabled: !!scenarios[3] && scenarios[3].institution_id > 0,
  });

  // Array for easy indexing (maintaining same interface)
  const majorsQueries = [majorsQuery0, majorsQuery1, majorsQuery2, majorsQuery3];

  // Compare mutation
  const compareMutation = useMutation({
    mutationFn: (request: { scenarios: ComputeRequest[] }) => computeApi.compareScenarios(request),
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const addScenario = () => {
    if (scenarios.length < 4) {
      setScenarios([
        ...scenarios,
        {
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
        },
      ]);
    }
  };

  const removeScenario = (index: number) => {
    setScenarios(scenarios.filter((_, idx) => idx !== index));
  };

  const updateScenario = (index: number, field: keyof ComputeRequest, value: number | string | boolean | null) => {
    const updated = [...scenarios];
    // Clear major selection when institution changes
    if (field === 'institution_id' && value !== updated[index].institution_id) {
      updated[index] = { ...updated[index], institution_id: value as number, cip_code: '' };
    } else {
      updated[index] = { ...updated[index], [field]: value } as ComputeRequest;
    }
    setScenarios(updated);
  };

  const handleCompare = () => {
    const validScenarios = scenarios.filter(s => s.institution_id > 0 && s.cip_code !== '');
    if (validScenarios.length > 0) {
      compareMutation.mutate({ scenarios: validScenarios });
    }
  };

  const handleExport = async () => {
    if (result) {
      const validScenarios = scenarios.filter(s => s.institution_id > 0 && s.cip_code !== '');
      await exportApi.exportComparison({ scenarios: validScenarios });
    }
  };

  const canCompare = scenarios.some(s => s.institution_id > 0 && s.cip_code !== '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Compare Scenarios</h1>
          <p className="text-zinc-600 mt-2">
            Add up to 4 scenarios to compare side-by-side. See how different institutions and majors stack up.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addScenario} disabled={scenarios.length >= 4} variant="outline">
            Add Scenario ({scenarios.length}/4)
          </Button>
          <Button onClick={handleCompare} disabled={!canCompare || compareMutation.isPending}>
            {compareMutation.isPending ? 'Comparing...' : 'Compare'}
          </Button>
        </div>
      </div>

      {/* Scenario Builder */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {scenarios.map((scenario, idx) => (
          <Card key={idx}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Scenario {idx + 1}</CardTitle>
                {scenarios.length > 1 && (
                  <Button
                    onClick={() => removeScenario(idx)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Institution" required>
                <InstitutionSelector
                  value={scenario.institution_id || undefined}
                  onValueChange={(value) => updateScenario(idx, 'institution_id', value)}
                  placeholder="Search for an institution..."
                />
              </FormField>

              <FormField label="Major" required>
                {!scenario.institution_id ? (
                  <Select disabled>
                    <option>Select institution first...</option>
                  </Select>
                ) : majorsQueries[idx].isLoading ? (
                  <Select disabled>
                    <option>Loading majors...</option>
                  </Select>
                ) : (majorsQueries[idx].data || []).length === 0 ? (
                  <Select disabled>
                    <option>No majors available</option>
                  </Select>
                ) : (
                  <Select
                    value={scenario.cip_code || ''}
                    onChange={(e) => updateScenario(idx, 'cip_code', e.target.value)}
                  >
                    <option value="">Select...</option>
                    {(majorsQueries[idx].data || []).map((major) => (
                      <option key={major.cip_code} value={major.cip_code}>
                        {major.cip_title.length > 30 ? major.cip_title.substring(0, 30) + '...' : major.cip_title}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>

              <FormField label="Housing">
                <Select
                  value={scenario.housing_type}
                  onChange={(e) => updateScenario(idx, 'housing_type', e.target.value)}
                >
                  <option value="none">No Housing (Living at Home)</option>
                  <option value="studio">Studio</option>
                  <option value="1BR">1BR</option>
                  <option value="2BR">2BR</option>
                  <option value="3BR">3BR</option>
                  <option value="4BR">4BR</option>
                </Select>
              </FormField>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results */}
      {compareMutation.isPending && <LoadingState message="Comparing scenarios..." />}

      {compareMutation.isError && (
        <ErrorState
          message={
            (compareMutation.error instanceof Error && 'response' in compareMutation.error 
              ? (compareMutation.error.response as { data?: { detail?: string } })?.data?.detail 
              : undefined) || 'Failed to compare scenarios'
          }
          onRetry={handleCompare}
        />
      )}

      {result && (
        <>
          {/* Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonChart comparisons={result.comparisons} metric="cost" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Debt Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonChart comparisons={result.comparisons} metric="debt" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earnings Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonChart comparisons={result.comparisons} metric="earnings" />
              </CardContent>
            </Card>
          </div>

          {/* Detailed Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Side-by-Side Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Metric</th>
                      {result.comparisons.map((comp, idx) => (
                        <th key={idx} className="text-left py-2 px-3">
                          <div className="font-semibold">Scenario {idx + 1}</div>
                          <div className="text-xs font-normal text-zinc-600">
                            {comp.institution_name.substring(0, 25)}
                            {comp.institution_name.length > 25 ? '...' : ''}
                          </div>
                          <div className="text-xs font-normal text-zinc-500">
                            {comp.major_name.substring(0, 25)}
                            {comp.major_name.length > 25 ? '...' : ''}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-2 px-3 font-medium">Yearly Cost</td>
                      {result.comparisons.map((comp, idx) => (
                        <td key={idx} className="py-2 px-3">
                          {comp.kpis ? formatCurrency(comp.kpis.true_yearly_cost) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Expected Debt</td>
                      {result.comparisons.map((comp, idx) => (
                        <td key={idx} className="py-2 px-3">
                          {comp.kpis ? formatCurrency(comp.kpis.expected_debt_at_grad) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Year 1 Earnings</td>
                      {result.comparisons.map((comp, idx) => (
                        <td key={idx} className="py-2 px-3">
                          {comp.kpis ? formatCurrency(comp.kpis.earnings_year_1) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Year 3 Earnings</td>
                      {result.comparisons.map((comp, idx) => (
                        <td key={idx} className="py-2 px-3">
                          {comp.kpis ? formatCurrency(comp.kpis.earnings_year_3) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Year 5 Earnings</td>
                      {result.comparisons.map((comp, idx) => (
                        <td key={idx} className="py-2 px-3">
                          {comp.kpis ? formatCurrency(comp.kpis.earnings_year_5) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">ROI</td>
                      {result.comparisons.map((comp, idx) => (
                        <td key={idx} className="py-2 px-3">
                          {comp.kpis?.roi !== null && comp.kpis?.roi !== undefined ? formatRatio(comp.kpis.roi) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Payback Years</td>
                      {result.comparisons.map((comp, idx) => (
                        <td key={idx} className="py-2 px-3">
                          {comp.kpis?.payback_years ? formatNumber(comp.kpis.payback_years) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">DTI Year 1</td>
                      {result.comparisons.map((comp, idx) => (
                        <td key={idx} className="py-2 px-3">
                          {comp.kpis && comp.kpis.dti_year_1 !== null ? formatPercent(comp.kpis.dti_year_1) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Graduation Rate</td>
                      {result.comparisons.map((comp, idx) => (
                        <td key={idx} className="py-2 px-3">
                          {comp.kpis && comp.kpis.graduation_rate !== null ? formatPercent(comp.kpis.graduation_rate) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Comfort Index</td>
                      {result.comparisons.map((comp, idx) => (
                        <td key={idx} className="py-2 px-3">
                          {comp.kpis?.comfort_index ? formatNumber(comp.kpis.comfort_index, 0) : 'N/A'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Warnings */}
          {result.comparisons.some(c => c.warnings.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Warnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.comparisons.map((comp, idx) => (
                    comp.warnings.length > 0 && (
                      <div key={idx}>
                        <h4 className="font-semibold mb-1">Scenario {idx + 1}:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-zinc-600">
                          {comp.warnings.map((warning, wIdx) => (
                            <li key={wIdx}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export */}
          <Button onClick={handleExport} variant="outline" className="w-full">
            Export Comparison to CSV
          </Button>
        </>
      )}

      {!result && !compareMutation.isPending && !compareMutation.isError && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-zinc-500">
              <p>Add scenarios above and click &quot;Compare&quot; to see side-by-side results.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

