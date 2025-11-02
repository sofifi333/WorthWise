"""
BEA Regional Price Parities (RPP) Extractor
Extracts cost-of-living adjustments by state and metro area
"""

import pandas as pd
from etl.config import BEA_RPP_FILE
from etl.utils.cleaning import clean_string, clean_numeric


def extract_rpp_data() -> pd.DataFrame:
    """
    Extract RPP data from BEA file
    Returns DataFrame with RPP index by geography and year
    """
    print("Extracting BEA Regional Price Parities data...")
    
    try:
        # Read CSV with latin-1 encoding to handle non-UTF8 characters
        df = pd.read_csv(BEA_RPP_FILE, encoding='latin-1', low_memory=False)
        
        # Strip whitespace from column names (defensive)
        df.columns = df.columns.str.strip()
        
        # The BEA file format has years as columns
        # Identify year columns (they're numeric column names)
        year_columns = [col for col in df.columns if col.isdigit() and int(col) >= 2000]
        
        # Keep geographic identifiers
        id_columns = ['GeoFIPS', 'GeoName', 'Region']
        available_id_cols = [col for col in id_columns if col in df.columns]
        
        if not available_id_cols:
            # Try alternative column names
            available_id_cols = [col for col in df.columns if any(x in col.lower() for x in ['fips', 'geo', 'area'])][:3]
        
        # Check if this file actually contains RPP data
        print(f"  Checking file contents...")
        print(f"  Sample description: {df['Description'].iloc[0] if 'Description' in df.columns and len(df) > 0 else 'N/A'}")
        
        # Filter for RPP data (Regional Price Parities)
        # The BEA file contains different data series - we want RPP specifically
        if 'LineCode' in df.columns:
            # Convert LineCode to string if it's not already
            df['LineCode'] = df['LineCode'].astype(str)
            # Look for RPP in LineCode or Description
            rpp_mask = (
                df['LineCode'].str.contains('RPP', na=False, case=False) |
                (df['Description'].str.contains('Regional Price Parity|Price Parity', na=False, case=False) if 'Description' in df.columns else False)
            )
            df_rpp = df[rpp_mask].copy()
            print(f"  Found {len(df_rpp)} RPP records out of {len(df)} total records")
            
            # If no RPP data found, this might be the wrong BEA file
            if len(df_rpp) == 0:
                print(f"  WARNING: This appears to be BEA income data (CAINC), not RPP data!")
                print(f"  RPP data should contain 'Regional Price Parity' in descriptions")
                print(f"  Continuing without RPP data - cost-of-living adjustments will not be available")
                
        elif 'TableName' in df.columns:
            # Convert TableName to string if it's not already
            df['TableName'] = df['TableName'].astype(str)
            df_rpp = df[df['TableName'].str.contains('RPP', na=False, case=False)].copy()
            print(f"  Found {len(df_rpp)} RPP records out of {len(df)} total records")
        else:
            # If no specific RPP indicator, this is likely not RPP data
            print(f"  WARNING: No RPP indicators found in file structure")
            print(f"  This file may not contain Regional Price Parity data")
            df_rpp = pd.DataFrame()  # Return empty instead of using wrong data
        
        if len(df_rpp) == 0:
            print("  ERROR: No RPP data found after filtering!")
            # Return empty DataFrame with required columns
            return pd.DataFrame(columns=['geo_fips', 'geo_name', 'year', 'rpp_index', 'is_state_level'])
        
        if len(year_columns) == 0:
            print("  ERROR: No year columns found!")
            # Return empty DataFrame with required columns
            return pd.DataFrame(columns=['geo_fips', 'geo_name', 'year', 'rpp_index', 'is_state_level'])
        
        print(f"  Melting {len(year_columns)} year columns: {year_columns[:5]}...")
        
        # Melt year columns to long format
        rpp_long = df_rpp.melt(
            id_vars=available_id_cols,
            value_vars=year_columns,
            var_name='year',
            value_name='rpp_index'
        )
        
        # Clean data
        rpp_data = pd.DataFrame({
            'geo_fips': rpp_long[available_id_cols[0]].apply(lambda x: clean_string(x, 20)) if len(available_id_cols) > 0 else None,
            'geo_name': rpp_long[available_id_cols[1]].apply(lambda x: clean_string(x, 255)) if len(available_id_cols) > 1 else None,
            'year': rpp_long['year'].astype(int),
            'rpp_index': rpp_long['rpp_index'].apply(clean_numeric),
        })
        
        # Remove rows with missing data
        rpp_data = rpp_data[rpp_data['rpp_index'].notna()]
        
        # Extract state codes from geo_name (for state-level data)
        # States typically have shorter names than metro areas
        if len(rpp_data) > 0:
            rpp_data['is_state_level'] = rpp_data['geo_name'].str.len() <= 30  # States have short names
        else:
            rpp_data['is_state_level'] = pd.Series([], dtype=bool)
        
        print(f"Extracted RPP data: {len(rpp_data)} records")
        print(f"Unique geographies: {rpp_data['geo_name'].nunique()}")
        print(f"Year range: {rpp_data['year'].min()} - {rpp_data['year'].max()}")
        
        return rpp_data
        
    except Exception as e:
        print(f"Error extracting RPP data: {e}")
        raise


def get_latest_state_rpp(rpp_df: pd.DataFrame) -> pd.DataFrame:
    """
    Get the latest RPP for each state
    Returns DataFrame with most recent RPP per state
    """
    print("Extracting latest state-level RPP data...")
    
    # Check if DataFrame is empty or missing required columns
    if len(rpp_df) == 0:
        print("  Warning: No RPP data available")
        return pd.DataFrame(columns=['geo_fips', 'geo_name', 'year', 'rpp_index', 'is_state_level'])
    
    if 'is_state_level' not in rpp_df.columns:
        print("  Error: is_state_level column missing from RPP data")
        return pd.DataFrame(columns=['geo_fips', 'geo_name', 'year', 'rpp_index', 'is_state_level'])
    
    # Filter for state-level data only
    state_rpp = rpp_df[rpp_df['is_state_level'] == True].copy()
    
    if len(state_rpp) == 0:
        print("  Warning: No state-level RPP data found")
        return pd.DataFrame(columns=['geo_fips', 'geo_name', 'year', 'rpp_index', 'is_state_level'])
    
    # Get latest year for each state
    latest_rpp = state_rpp.sort_values('year', ascending=False).groupby('geo_name').first().reset_index()
    
    print(f"Latest state RPP data: {len(latest_rpp)} states/regions")
    return latest_rpp

