/**
 * Methodology Page
 * Data sources, definitions, and limitations
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { optionsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/loading-spinner';
import { BookOpen, Database, GraduationCap, Home, DollarSign, Zap, TrendingUp, AlertTriangle, Info, FileText, Shield } from 'lucide-react';

export default function MethodologyPage() {
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['versions'],
    queryFn: () => optionsApi.getVersions(),
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 rounded-3xl blur-3xl opacity-50"></div>
        <div className="bg-gradient-to-br from-white/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl border-2 border-indigo-100 p-8 shadow-lg overflow-visible min-h-0">
          <Badge className="mb-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-0">
            <BookOpen className="w-3 h-3 mr-1" />
            Data & Methods
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 break-words overflow-visible">
            Methodology
          </h1>
          <p className="text-lg text-slate-600 mt-3 max-w-3xl">
            Understanding our data sources, calculations, and limitations. All information is derived from trusted U.S. government databases.
          </p>
        </div>
      </div>

      {/* Data Sources */}
      <Card className="border-2 border-blue-100 shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Data Sources</CardTitle>
              <CardDescription>All data comes from publicly available U.S. government sources</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">U.S. Department of Education — College Scorecard</h3>
                <p className="text-sm text-slate-700 mb-2">
                  Institution and field-of-study outcomes including earnings, debt, and completion rates.
                </p>
                <a
                  href="https://collegescorecard.ed.gov/data/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline inline-flex items-center gap-1"
                >
                  Visit Source →
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">HUD Fair Market Rents (FMR)</h3>
                <p className="text-sm text-slate-700 mb-2">
                  County and ZIP code-level rental cost estimates for housing calculations.
                </p>
                <a
                  href="https://www.huduser.gov/portal/datasets/fmr.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-700 font-medium hover:underline inline-flex items-center gap-1"
                >
                  Visit Source →
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">BEA Regional Price Parities (RPP)</h3>
                <p className="text-sm text-slate-700 mb-2">
                  Regional cost-of-living adjustments for post-graduation earnings.
                </p>
                <a
                  href="https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline inline-flex items-center gap-1"
                >
                  Visit Source →
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">EIA Residential Electricity Prices</h3>
                <p className="text-sm text-slate-700 mb-2">
                  State-level electricity rates for utility cost estimates.
                </p>
                <a
                  href="https://www.eia.gov/electricity/data/state/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline inline-flex items-center gap-1"
                >
                  Visit Source →
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Data Versions */}
      <Card className="border-2 border-indigo-100 shadow-lg bg-gradient-to-br from-white to-indigo-50/30 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Current Data Versions</CardTitle>
              <CardDescription>Dataset versions currently in use</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState message="Loading version information..." />
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div key={version.dataset_name} className="flex justify-between items-center py-4 px-5 bg-white rounded-xl shadow-sm border border-indigo-100">
                  <div>
                    <div className="font-bold text-slate-900 text-base">{version.dataset_name}</div>
                    {version.row_count && (
                      <div className="text-sm text-slate-500 mt-1">
                        <Database className="w-3 h-3 inline mr-1" />
                        {version.row_count.toLocaleString()} records
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm bg-indigo-100 text-indigo-900 px-3 py-1 rounded-lg font-semibold">{version.version_identifier}</div>
                    <div className="text-xs text-slate-500 mt-1">{new Date(version.version_date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI Definitions */}
      <Card className="border-2 border-green-100 shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Info className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">KPI Definitions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              True Yearly Cost
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              Total annual cost of attendance including tuition, fees, housing, utilities, food, transportation, books, and miscellaneous expenses. This represents the actual out-of-pocket cost per year.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              Expected Debt at Graduation
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              Projected total federal student loan debt at graduation, calculated as: (Yearly Cost - Aid - Cash Contribution) × Program Years, with interest accrued during school.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Earnings Projections
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              Median earnings for graduates of the selected program at 1, 3, and 5 years post-graduation, sourced from College Scorecard. May be adjusted for regional cost-of-living differences.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-purple-500">
            <h4 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
              Return on Investment (ROI)
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              Ratio of lifetime earnings increase to total educational investment. Calculated as: (Cumulative Earnings - Baseline Earnings) / (Total Cost + Opportunity Cost).
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-indigo-500">
            <h4 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600" />
              Payback Period
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              Estimated number of years to fully repay student loan debt based on a standard 10-year repayment plan with the specified APR.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-orange-500">
            <h4 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-orange-600" />
              Debt-to-Income Ratio (DTI)
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              Ratio of total student debt to first-year gross income. A DTI below 30% is generally considered manageable; above 50% may indicate financial stress.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-cyan-500">
            <h4 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-600" />
              Graduation Rate
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              Percentage of students who complete their degree within 150% of normal time (e.g., 6 years for a 4-year program). Sourced from institution-level College Scorecard data.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-pink-500">
            <h4 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-pink-600" />
              Comfort Index
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              Proprietary score (0-100) estimating financial comfort post-graduation, considering debt burden, earnings potential, and living costs. Higher scores indicate greater financial security.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Assumptions */}
      <Card className="border-2 border-cyan-100 shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Key Assumptions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-bold text-slate-900 mb-2">Program Duration</h4>
            <p className="text-sm text-slate-700">
              Bachelor&apos;s degree: 4 years; Associate&apos;s: 2 years; Certificate: 1 year; Master&apos;s: 2 years; Doctorate: 5 years.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-bold text-slate-900 mb-2">Default Budgets</h4>
            <p className="text-sm text-slate-700">
              When not specified: Food ($400/month), Utilities ($150/month), Transportation ($100/month), Books ($1,200/year), Miscellaneous ($200/month).
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-bold text-slate-900 mb-2">Loan Terms</h4>
            <p className="text-sm text-slate-700">
              Default federal student loan APR: 5.29%. Standard 10-year repayment plan. Interest accrues during school.
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
            <h4 className="font-bold text-slate-900 mb-2">Tax Rate</h4>
            <p className="text-sm text-slate-700">
              Default effective tax rate: 15%. This is applied to post-graduation income for net earnings calculations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Limitations */}
      <Card className="border-2 border-yellow-200 shadow-lg bg-gradient-to-br from-white to-yellow-50/30 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Known Limitations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-400 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Privacy Suppression
            </h4>
            <p className="text-sm text-slate-700">
              College Scorecard suppresses earnings and debt data for small programs (typically &lt;30 students). Institution-level aggregates may be used as fallbacks.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-400 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Earnings Coverage
            </h4>
            <p className="text-sm text-slate-700">
              Earnings data only captures students who filed FAFSA and are matched to IRS tax records. Does not include students who immediately pursued graduate school or informal employment.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-400 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Debt Reporting
            </h4>
            <p className="text-sm text-slate-700">
              Only federal student loans are included. Private loans, parent PLUS loans, and family contributions are not captured in the data.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-400 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Housing Costs
            </h4>
            <p className="text-sm text-slate-700">
              HUD Fair Market Rents are estimates based on survey data, not actual rents. Rural areas may have limited ZIP-level coverage.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-400 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Regional Granularity
            </h4>
            <p className="text-sm text-slate-700">
              Regional price parities are available at state and metro area levels only. Earnings adjustments may not capture hyper-local cost differences.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-400 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Data Lag
            </h4>
            <p className="text-sm text-slate-700">
              College Scorecard data typically lags by 1-2 years. Recent program changes or tuition updates may not be reflected.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-2 border-slate-300 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Disclaimer</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
            <p className="text-base text-slate-700 leading-relaxed">
              This tool provides educational estimates based on historical data and statistical averages. Actual costs, earnings, and outcomes will vary based on individual circumstances, economic conditions, career choices, and many other factors. These projections should not be considered financial advice. Always conduct thorough research and consult with financial advisors before making educational investment decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

