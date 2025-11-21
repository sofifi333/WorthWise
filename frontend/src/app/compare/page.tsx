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
import { Badge } from '@/components/ui/badge';
import { FormField } from '@/components/form-field';
import { LoadingState } from '@/components/loading-spinner';
import { ErrorState } from '@/components/error-state';
import { ComparisonChart } from '@/components/charts/comparison-chart';
import { InstitutionSelector } from '@/components/institution-selector';
import { formatCurrency, formatPercent, formatNumber, formatRatio } from '@/lib/utils';
import { GitCompare, Plus, X, Download, BarChart3, TrendingUp, DollarSign, Sparkles, Award, Target, Percent, Clock } from 'lucide-react';
import { MultiMetricChart } from '@/components/charts/multi-metric-chart';
import { PercentageChart } from '@/components/charts/percentage-chart';
import { NumericChart } from '@/components/charts/numeric-chart';

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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-3xl blur-3xl opacity-50"></div>
        <div className="bg-gradient-to-br from-white/80 to-purple-50/80 backdrop-blur-sm rounded-2xl border-2 border-purple-100 p-8 shadow-lg overflow-visible min-h-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                <GitCompare className="w-3 h-3 mr-1" />
                Side-by-Side Analysis
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 break-words overflow-visible">
                Compare Scenarios
              </h1>
              <p className="text-lg text-slate-600 mt-3 max-w-2xl">
                Add up to 4 scenarios to compare side-by-side. See how different institutions and majors stack up.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button 
                onClick={addScenario} 
                disabled={scenarios.length >= 4} 
                variant="outline"
                className="border-2 hover:border-purple-400 hover:bg-purple-50 h-12 px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Scenario ({scenarios.length}/4)
              </Button>
              <Button 
                onClick={handleCompare} 
                disabled={!canCompare || compareMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all h-12 px-6"
              >
                <GitCompare className="w-4 h-4 mr-2" />
                {compareMutation.isPending ? 'Comparing...' : 'Compare'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Builder */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {scenarios.map((scenario, idx) => {
          const colors = [
            { border: 'border-blue-200', bg: 'from-blue-500 to-blue-600', hover: 'hover:border-blue-300' },
            { border: 'border-green-200', bg: 'from-green-500 to-green-600', hover: 'hover:border-green-300' },
            { border: 'border-purple-200', bg: 'from-purple-500 to-purple-600', hover: 'hover:border-purple-300' },
            { border: 'border-orange-200', bg: 'from-orange-500 to-orange-600', hover: 'hover:border-orange-300' },
          ];
          const color = colors[idx % colors.length];
          
          return (
            <Card key={idx} className={`border-2 ${color.border} ${color.hover} transition-all shadow-md hover:shadow-lg bg-white/80 backdrop-blur`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${color.bg} rounded-xl flex items-center justify-center text-white font-bold`}>
                      {idx + 1}
                    </div>
                    <CardTitle className="text-lg">Scenario {idx + 1}</CardTitle>
                  </div>
                  {scenarios.length > 1 && (
                    <Button
                      onClick={() => removeScenario(idx)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
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
          );
        })}
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
          {/* Overview Stats */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Comparing {result.comparisons.length} Scenario{result.comparisons.length > 1 ? 's' : ''}
            </h3>
            <p className="text-slate-600">
              Review the comprehensive analysis below. All metrics are calculated based on your specific inputs and current market data.
            </p>
          </div>

          {/* Main Cost & Debt Analysis */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-7 h-7 text-blue-600" />
              Financial Overview
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-2 border-blue-100 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    Annual Cost Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ComparisonChart comparisons={result.comparisons} metric="cost" />
                </CardContent>
              </Card>

              <Card className="border-2 border-red-100 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-red-600" />
                    Total Debt at Graduation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ComparisonChart comparisons={result.comparisons} metric="debt" />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-purple-600" />
              Cost Breakdown Analysis
            </h3>
            <Card className="border-2 border-purple-100 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Cost Components by Scenario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MultiMetricChart
                  comparisons={result.comparisons}
                  metrics={[
                    { key: 'tuition_fees', label: 'Tuition & Fees', color: '#3b82f6', formatter: formatCurrency },
                    { key: 'housing_annual', label: 'Housing', color: '#8b5cf6', formatter: formatCurrency },
                    { key: 'other_expenses', label: 'Other Expenses', color: '#06b6d4', formatter: formatCurrency },
                  ]}
                  height={350}
                />
              </CardContent>
            </Card>
          </div>

          {/* Earnings Analysis */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-green-600" />
              Earnings Potential
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-2 border-green-100 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Year 1 Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ComparisonChart comparisons={result.comparisons} metric="earnings" />
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-100 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Earnings Growth (3 & 5 Years)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MultiMetricChart
                    comparisons={result.comparisons}
                    metrics={[
                      { key: 'earnings_year_3', label: 'Year 3', color: '#10b981', formatter: formatCurrency },
                      { key: 'earnings_year_5', label: 'Year 5', color: '#059669', formatter: formatCurrency },
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ROI & Performance Metrics */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-7 h-7 text-indigo-600" />
              Return on Investment
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-2 border-indigo-100 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    ROI Ratio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NumericChart
                    comparisons={result.comparisons}
                    metricKey="roi"
                    metricLabel="ROI"
                    unit="x"
                    colors={['#6366f1', '#8b5cf6', '#a855f7', '#c026d3']}
                  />
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-100 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Payback Period
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NumericChart
                    comparisons={result.comparisons}
                    metricKey="payback_years"
                    metricLabel="Years"
                    unit=" yrs"
                    colors={['#f97316', '#fb923c', '#fdba74', '#fed7aa']}
                  />
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-100 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    Comfort Index
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NumericChart
                    comparisons={result.comparisons}
                    metricKey="comfort_index"
                    metricLabel="Score (0-100)"
                    colors={['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a']}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Risk & Success Metrics */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Percent className="w-7 h-7 text-cyan-600" />
              Success & Risk Indicators
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-2 border-cyan-100 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Award className="w-5 h-5 text-cyan-600" />
                    Graduation Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PercentageChart
                    comparisons={result.comparisons}
                    metricKey="graduation_rate"
                    metricLabel="Graduation Rate"
                    colors={['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc']}
                  />
                </CardContent>
              </Card>

              <Card className="border-2 border-rose-100 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Percent className="w-5 h-5 text-rose-600" />
                    Debt-to-Income (Year 1)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PercentageChart
                    comparisons={result.comparisons}
                    metricKey="dti_year_1"
                    metricLabel="DTI Ratio"
                    colors={['#f43f5e', '#fb7185', '#fda4af', '#fecdd3']}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="space-y-4 mt-12">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <GitCompare className="w-7 h-7 text-slate-700" />
              Detailed Metrics Table
            </h3>
            <Card className="border-2 border-slate-200 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <p className="text-slate-600">Complete side-by-side comparison of all key metrics</p>
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
          </div>

          {/* Warnings */}
          {result.comparisons.some(c => c.warnings.length > 0) && (
            <Card className="border-2 border-yellow-200 bg-yellow-50/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-yellow-900">
                  <Sparkles className="w-5 h-5" />
                  Warnings
                </CardTitle>
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
          <div className="pt-8 border-t border-slate-200">
            <Button onClick={handleExport} variant="outline" className="w-full border-2 hover:border-purple-400 hover:bg-purple-50 h-14 text-lg font-semibold group">
              <Download className="w-5 h-5 mr-2 group-hover:translate-y-0.5 transition-transform" />
              Export Complete Comparison to CSV
            </Button>
          </div>
        </>
      )}

      {!result && !compareMutation.isPending && !compareMutation.isError && (
        <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GitCompare className="w-10 h-10 text-purple-600" />
              </div>
              <p className="text-slate-600 text-lg">Add scenarios above and click <span className="font-semibold">&quot;Compare&quot;</span> to see side-by-side results.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

