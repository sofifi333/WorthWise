"""
EIA Electricity Prices Extractor
Extracts residential electricity rates by state
"""

import pandas as pd
from etl.config import EIA_ELECTRICITY_FILE
from etl.utils.cleaning import clean_state_code, clean_integer, clean_numeric


def extract_electricity_data() -> pd.DataFrame:
    """
    Extract electricity price data from EIA file
    Returns DataFrame with residential rates by state and year
    """
    print("Extracting EIA Electricity Price data...")
    
    try:
        # Read Excel file - first row is title, second row has headers
        # Read first few rows to find where data starts
        df_peek = pd.read_excel(EIA_ELECTRICITY_FILE, engine='openpyxl', nrows=5)
        
        # Find the row that contains 'Year' - that's the header row
        header_row = None
        for idx, row in df_peek.iterrows():
            row_str = str(row.values).lower()
            if 'year' in row_str:
                header_row = idx
                break
        
        if header_row is None:
            header_row = 0
        
        # Read with correct header
        df = pd.read_excel(EIA_ELECTRICITY_FILE, engine='openpyxl', header=header_row)
        
        # Standardize column names and strip whitespace
        df.columns = df.columns.str.strip().str.replace('\n', ' ')
        
        # Find year column (may be 'Year' or first numeric column)
        year_col = 'Year' if 'Year' in df.columns else df.columns[0]
        state_col = 'State' if 'State' in df.columns else df.columns[1]
        residential_col = 'Residential' if 'Residential' in df.columns else df.columns[3]
        
        # Extract relevant data
        electricity_data = pd.DataFrame({
            'year': df[year_col].apply(clean_integer),
            'state_code': df[state_col].apply(clean_state_code),
            'residential_rate': df[residential_col].apply(clean_numeric),  # cents per kWh
        })
        
        # Remove rows with nulls
        electricity_data = electricity_data[
            electricity_data['state_code'].notna() &
            electricity_data['residential_rate'].notna()
        ]
        
        # Filter out non-state rows (like "U.S. Average")
        valid_states = set(['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                           'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                           'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                           'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                           'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'])
        
        electricity_data = electricity_data[electricity_data['state_code'].isin(valid_states)]
        
        print(f"Extracted electricity data: {len(electricity_data)} records")
        print(f"States: {electricity_data['state_code'].nunique()}")
        print(f"Years: {sorted(electricity_data['year'].unique())}")
        
        return electricity_data
        
    except Exception as e:
        print(f"Error extracting electricity data: {e}")
        raise


def get_latest_electricity_rates(electricity_df: pd.DataFrame) -> pd.DataFrame:
    """
    Get the latest electricity rate for each state
    Returns DataFrame with most recent rate per state
    """
    print("Extracting latest electricity rates per state...")
    
    # Get latest year for each state
    latest_rates = electricity_df.sort_values('year', ascending=False).groupby('state_code').first().reset_index()
    
    print(f"Latest electricity rates: {len(latest_rates)} states")
    return latest_rates

