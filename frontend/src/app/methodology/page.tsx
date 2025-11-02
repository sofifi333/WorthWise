/**
 * Methodology Page
 * Data sources, definitions, and limitations
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { optionsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingState } from '@/components/loading-spinner';

export default function MethodologyPage() {
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['versions'],
    queryFn: () => optionsApi.getVersions(),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Methodology</h1>
        <p className="text-zinc-600 mt-2">
          Understanding our data sources, calculations, and limitations.
        </p>
      </div>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
          <CardDescription>All data comes from publicly available U.S. government sources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-zinc-900 mb-2">U.S. Department of Education — College Scorecard</h3>
            <p className="text-sm text-zinc-600 mb-1">
              Institution and field-of-study outcomes including earnings, debt, and completion rates.
            </p>
            <a
              href="https://collegescorecard.ed.gov/data/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              https://collegescorecard.ed.gov/data/
            </a>
          </div>

          <div>
            <h3 className="font-semibold text-zinc-900 mb-2">HUD Fair Market Rents (FMR)</h3>
            <p className="text-sm text-zinc-600 mb-1">
              County and ZIP code-level rental cost estimates for housing calculations.
            </p>
            <a
              href="https://www.huduser.gov/portal/datasets/fmr.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              https://www.huduser.gov/portal/datasets/fmr.html
            </a>
          </div>

          <div>
            <h3 className="font-semibold text-zinc-900 mb-2">BEA Regional Price Parities (RPP)</h3>
            <p className="text-sm text-zinc-600 mb-1">
              Regional cost-of-living adjustments for post-graduation earnings.
            </p>
            <a
              href="https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area
            </a>
          </div>

          <div>
            <h3 className="font-semibold text-zinc-900 mb-2">EIA Residential Electricity Prices</h3>
            <p className="text-sm text-zinc-600 mb-1">
              State-level electricity rates for utility cost estimates.
            </p>
            <a
              href="https://www.eia.gov/electricity/data/state/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              https://www.eia.gov/electricity/data/state/
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Current Data Versions */}
      <Card>
        <CardHeader>
          <CardTitle>Current Data Versions</CardTitle>
          <CardDescription>Dataset versions currently in use</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState message="Loading version information..." />
          ) : (
            <div className="space-y-2">
              {versions.map((version) => (
                <div key={version.dataset_name} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium text-zinc-900">{version.dataset_name}</div>
                    {version.row_count && (
                      <div className="text-xs text-zinc-500">{version.row_count.toLocaleString()} records</div>
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="font-mono text-zinc-900">{version.version_identifier}</div>
                    <div className="text-xs text-zinc-500">{new Date(version.version_date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI Definitions */}
      <Card>
        <CardHeader>
          <CardTitle>KPI Definitions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-zinc-900">True Yearly Cost</h4>
            <p className="text-sm text-zinc-600">
              Total annual cost of attendance including tuition, fees, housing, utilities, food, transportation, books, and miscellaneous expenses. This represents the actual out-of-pocket cost per year.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900">Expected Debt at Graduation</h4>
            <p className="text-sm text-zinc-600">
              Projected total federal student loan debt at graduation, calculated as: (Yearly Cost - Aid - Cash Contribution) × Program Years, with interest accrued during school.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900">Earnings Projections</h4>
            <p className="text-sm text-zinc-600">
              Median earnings for graduates of the selected program at 1, 3, and 5 years post-graduation, sourced from College Scorecard. May be adjusted for regional cost-of-living differences.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900">Return on Investment (ROI)</h4>
            <p className="text-sm text-zinc-600">
              Ratio of lifetime earnings increase to total educational investment. Calculated as: (Cumulative Earnings - Baseline Earnings) / (Total Cost + Opportunity Cost).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900">Payback Period</h4>
            <p className="text-sm text-zinc-600">
              Estimated number of years to fully repay student loan debt based on a standard 10-year repayment plan with the specified APR.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900">Debt-to-Income Ratio (DTI)</h4>
            <p className="text-sm text-zinc-600">
              Ratio of total student debt to first-year gross income. A DTI below 30% is generally considered manageable; above 50% may indicate financial stress.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900">Graduation Rate</h4>
            <p className="text-sm text-zinc-600">
              Percentage of students who complete their degree within 150% of normal time (e.g., 6 years for a 4-year program). Sourced from institution-level College Scorecard data.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900">Comfort Index</h4>
            <p className="text-sm text-zinc-600">
              Proprietary score (0-100) estimating financial comfort post-graduation, considering debt burden, earnings potential, and living costs. Higher scores indicate greater financial security.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Assumptions */}
      <Card>
        <CardHeader>
          <CardTitle>Key Assumptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-zinc-900">Program Duration</h4>
            <p className="text-sm text-zinc-600">
              Bachelor&apos;s degree: 4 years; Associate&apos;s: 2 years; Certificate: 1 year; Master&apos;s: 2 years; Doctorate: 5 years.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900">Default Budgets</h4>
            <p className="text-sm text-zinc-600">
              When not specified: Food ($400/month), Utilities ($150/month), Transportation ($100/month), Books ($1,200/year), Miscellaneous ($200/month).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900">Loan Terms</h4>
            <p className="text-sm text-zinc-600">
              Default federal student loan APR: 5.29%. Standard 10-year repayment plan. Interest accrues during school.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900">Tax Rate</h4>
            <p className="text-sm text-zinc-600">
              Default effective tax rate: 15%. This is applied to post-graduation income for net earnings calculations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Limitations */}
      <Card>
        <CardHeader>
          <CardTitle>Known Limitations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-zinc-900">Privacy Suppression</h4>
            <p className="text-sm text-zinc-600">
              College Scorecard suppresses earnings and debt data for small programs (typically &lt;30 students). Institution-level aggregates may be used as fallbacks.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900">Earnings Coverage</h4>
            <p className="text-sm text-zinc-600">
              Earnings data only captures students who filed FAFSA and are matched to IRS tax records. Does not include students who immediately pursued graduate school or informal employment.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900">Debt Reporting</h4>
            <p className="text-sm text-zinc-600">
              Only federal student loans are included. Private loans, parent PLUS loans, and family contributions are not captured in the data.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900">Housing Costs</h4>
            <p className="text-sm text-zinc-600">
              HUD Fair Market Rents are estimates based on survey data, not actual rents. Rural areas may have limited ZIP-level coverage.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900">Regional Granularity</h4>
            <p className="text-sm text-zinc-600">
              Regional price parities are available at state and metro area levels only. Earnings adjustments may not capture hyper-local cost differences.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900">Data Lag</h4>
            <p className="text-sm text-zinc-600">
              College Scorecard data typically lags by 1-2 years. Recent program changes or tuition updates may not be reflected.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card>
        <CardHeader>
          <CardTitle>Disclaimer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-600">
            This tool provides educational estimates based on historical data and statistical averages. Actual costs, earnings, and outcomes will vary based on individual circumstances, economic conditions, career choices, and many other factors. These projections should not be considered financial advice. Always conduct thorough research and consult with financial advisors before making educational investment decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

