# WorthWise Frontend

College ROI Planner - Next.js 15 + TypeScript + Tailwind CSS + Shadcn UI

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Shadcn UI (custom implementation)
- **Data Fetching:** TanStack Query (React Query)
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod (ready to use)

## Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx              # Planner page (home)
│   │   ├── compare/page.tsx      # Compare scenarios page
│   │   ├── methodology/page.tsx  # Methodology & data sources
│   │   ├── layout.tsx            # Root layout with navigation
│   │   └── globals.css           # Global styles
│   ├── components/               # Reusable components
│   │   ├── ui/                   # Base UI components (Card, Button, Input, etc.)
│   │   ├── charts/               # Chart components (Recharts)
│   │   ├── navigation.tsx        # Main navigation
│   │   ├── kpi-card.tsx          # KPI display card
│   │   ├── form-field.tsx        # Form field wrapper
│   │   ├── loading-spinner.tsx   # Loading states
│   │   └── error-state.tsx       # Error states
│   ├── lib/                      # Utilities and configs
│   │   ├── api/                  # API service layer
│   │   │   └── index.ts          # All API functions
│   │   ├── api-client.ts         # Axios instance
│   │   └── utils.ts              # Helper functions (formatting, cn)
│   ├── providers/                # React context providers
│   │   └── query-provider.tsx   # TanStack Query provider
│   └── types/                    # TypeScript types
│       └── api.ts                # API types matching backend schemas
├── .env.local                    # Local environment variables
├── .env.example                  # Environment variables template
└── package.json                  # Dependencies
```

## Environment Setup

Create `.env.local` file:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

For production (Vercel):
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Features Implemented

### 1. Planner Page (/)
- **Institution & Program Selection:**
  - School dropdown (filterable by state/search)
  - Major dropdown (filterable by category/search)
  - Credential level selector (Certificate to Doctorate)
  
- **Housing Controls:**
  - Housing type selection (Studio to 4BR)
  - Roommate count
  - Optional rent override
  
- **Expense Inputs:**
  - Monthly utilities, food, transportation, miscellaneous
  - Annual books cost
  - All with defaults from backend
  
- **Financial Aid:**
  - Annual grants/scholarships
  - Annual cash contribution
  - Loan APR configuration
  - Effective tax rate
  
- **Post-Graduation:**
  - Region selector for cost-of-living adjustment
  
- **Results Display:**
  - 10 KPI cards (cost, debt, earnings, ROI, payback, DTI, grad rate, comfort index)
  - Cost breakdown chart (bar chart)
  - Earnings progression chart (line chart)
  - Data version information
  - Warnings display
  - CSV export functionality

### 2. Compare Page (/compare)
- **Scenario Management:**
  - Add up to 4 scenarios
  - Remove scenarios dynamically
  - Quick configuration per scenario (school, major, housing)
  
- **Results Display:**
  - 3 comparison charts (cost, debt, earnings)
  - Side-by-side table with all KPIs
  - Individual warnings per scenario
  - CSV export for all scenarios

### 3. Methodology Page (/methodology)
- **Data Sources:**
  - Links to all government data sources
  - Current data versions with dates and row counts
  
- **Documentation:**
  - KPI definitions (9 metrics explained)
  - Key assumptions
  - Known limitations
  - Disclaimer

## API Integration

All API calls are centralized in `src/lib/api/index.ts`:

- **Options API:**
  - `getSchools()` - List institutions
  - `getCampuses()` - List campuses per institution
  - `getMajors()` - List majors/CIP codes
  - `getRegions()` - List regions for post-grad location
  - `getVersions()` - Get data versions

- **Compute API:**
  - `computeScenario()` - Calculate ROI for single scenario
  - `compareScenarios()` - Calculate ROI for multiple scenarios

- **Export API:**
  - `exportScenario()` - Download single scenario CSV
  - `exportComparison()` - Download comparison CSV

All API types are fully typed to match backend Pydantic schemas.

## UI Components

### Base Components (Shadcn-style)
- `Card` - Container component
- `Button` - Action buttons with variants
- `Input` - Text/number inputs
- `Select` - Dropdown selectors
- `Label` - Form labels

### Custom Components
- `KPICard` - Display metric with value, title, description, and trend
- `FormField` - Label + input wrapper
- `LoadingSpinner` / `LoadingState` - Loading indicators
- `ErrorState` - Error display with retry

### Charts
- `CostBreakdownChart` - Bar chart for cost components
- `EarningsChart` - Line chart for earnings progression
- `ComparisonChart` - Grouped bar chart for scenario comparison

## Utilities

### Formatting Functions (`src/lib/utils.ts`)
- `formatCurrency(value)` - Format as USD ($50,000)
- `formatPercent(value)` - Format as percentage (15.0%)
- `formatNumber(value)` - Format decimal numbers
- `formatRatio(value)` - Format ROI ratios
- `cn()` - Tailwind class merging utility

## Data Flow

1. **User Input** → Form controls update local state
2. **User Action** → Click "Calculate ROI" or "Compare"
3. **API Call** → TanStack Query sends request via Axios
4. **Backend Processing** → FastAPI computes KPIs
5. **Response** → TanStack Query caches and provides data
6. **Render** → Components display KPIs, charts, and results

## Security

- All API calls use environment variables for base URL
- CORS configured in backend (see `backend/app/config.py`)
- No client-side secrets or API keys
- Input validation at form level
- TypeScript type safety throughout

## Performance

- TanStack Query caching (1 minute stale time)
- Static page generation where possible
- Optimized bundle with Next.js webpack
- Lazy loading for charts (client-side only)

## Production Deployment (Vercel)

1. **Connect GitHub repo to Vercel**
2. **Set environment variables:**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app
   ```
3. **Deploy:**
   - Vercel auto-deploys on push to main
   - Build command: `npm run build`
   - Output directory: `.next`

## Known Limitations

- No authentication (per PRD)
- No caching layer like Redis (per PRD)
- No saved scenarios (future feature)
- Desktop-optimized (mobile responsive but not optimized)

## Future Enhancements (Not in V3)

- Map-based affordability visualizations
- Saved scenarios with shareable links
- Sensitivity analysis (tornado charts)
- PDF report generation
- User profiles and authentication

## License

Proprietary - WorthWise College ROI Planner
