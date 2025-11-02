"""
HUD Fair Market Rents (FMR) Extractor
Extracts ZIP-level rent data from multiple fiscal years
"""

import pandas as pd
from typing import List
from tqdm import tqdm

from etl.config import HUD_FMR_FILES
from etl.utils.cleaning import clean_zip_code, clean_integer, clean_string


def extract_fmr_data() -> pd.DataFrame:
    """
    Extract FMR data from all available fiscal years
    Returns consolidated DataFrame with rent by ZIP and bedroom count
    """
    print("Extracting HUD Fair Market Rent data...")
    
    all_fmr_data = []
    
    for fmr_file in tqdm(HUD_FMR_FILES, desc="Loading FMR files"):
        if not fmr_file.exists():
            print(f"Warning: FMR file not found: {fmr_file}")
            continue
        
        try:
            # Extract fiscal year from filename
            fy_year = int(str(fmr_file.stem).split('_')[0][2:])  # fy2026 -> 2026
            
            # Read Excel file
            df = pd.read_excel(fmr_file, engine='openpyxl')
            
            # Standardize column names - Excel has newlines in column headers!
            # Example: 'ZIP\nCode', 'SAFMR\n0BR', etc.
            df.columns = df.columns.str.replace('\n', ' ').str.strip()
            
            # Now find ZIP Code column
            zip_col = None
            for col in df.columns:
                if 'ZIP' in col.upper() and 'CODE' in col.upper():
                    zip_col = col
                    break
            
            if not zip_col:
                print(f"Warning: Could not find ZIP Code column in {fmr_file}")
                print(f"Available columns: {list(df.columns)}")
                continue
            
            # Extract relevant columns - find SAFMR columns by pattern matching
            # Using 'safmr_' prefix to match backend expectations
            safmr_0br = next((col for col in df.columns if 'SAFMR' in col and '0BR' in col and 'Payment' not in col), None)
            safmr_1br = next((col for col in df.columns if 'SAFMR' in col and '1BR' in col and 'Payment' not in col), None)
            safmr_2br = next((col for col in df.columns if 'SAFMR' in col and '2BR' in col and 'Payment' not in col), None)
            safmr_3br = next((col for col in df.columns if 'SAFMR' in col and '3BR' in col and 'Payment' not in col), None)
            safmr_4br = next((col for col in df.columns if 'SAFMR' in col and '4BR' in col and 'Payment' not in col), None)
            metro_col = next((col for col in df.columns if 'HUD' in col and 'Market Rent' in col), None)
            
            fmr_data = pd.DataFrame({
                'zip_code': df[zip_col].apply(clean_zip_code),
                'fiscal_year': fy_year,
                'safmr_0br': df[safmr_0br].apply(clean_integer) if safmr_0br else None,
                'safmr_1br': df[safmr_1br].apply(clean_integer) if safmr_1br else None,
                'safmr_2br': df[safmr_2br].apply(clean_integer) if safmr_2br else None,
                'safmr_3br': df[safmr_3br].apply(clean_integer) if safmr_3br else None,
                'safmr_4br': df[safmr_4br].apply(clean_integer) if safmr_4br else None,
                'metro_area': df[metro_col].apply(lambda x: clean_string(x, 255)) if metro_col else None,
            })
            
            # Remove rows with null ZIP codes
            fmr_data = fmr_data[fmr_data['zip_code'].notna()]
            
            all_fmr_data.append(fmr_data)
            print(f"  FY{fy_year}: {len(fmr_data)} ZIP codes")
            
        except Exception as e:
            print(f"Error loading {fmr_file}: {e}")
            continue
    
    if not all_fmr_data:
        raise ValueError("No FMR data was successfully loaded")
    
    # Concatenate all years
    fmr_combined = pd.concat(all_fmr_data, ignore_index=True)
    
    print(f"Total FMR records: {len(fmr_combined)}")
    print(f"Unique ZIP codes: {fmr_combined['zip_code'].nunique()}")
    print(f"Fiscal years: {sorted(fmr_combined['fiscal_year'].unique())}")
    
    return fmr_combined


def get_latest_fmr(fmr_df: pd.DataFrame) -> pd.DataFrame:
    """
    Get the latest FMR data for each ZIP code
    Returns DataFrame with most recent rent data per ZIP
    """
    print("Extracting latest FMR data per ZIP code...")
    
    # Sort by fiscal year descending and take first per ZIP
    latest_fmr = fmr_df.sort_values('fiscal_year', ascending=False).groupby('zip_code').first().reset_index()
    
    print(f"Latest FMR data: {len(latest_fmr)} ZIP codes")
    return latest_fmr

