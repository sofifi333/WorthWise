"""
College Scorecard Data Extractor
Extracts institution and field of study data
"""

import pandas as pd
from typing import Tuple
from tqdm import tqdm

from etl.config import COLLEGE_SCORECARD_INSTITUTION, COLLEGE_SCORECARD_FIELD_OF_STUDY
from etl.utils.cleaning import (
    clean_numeric, clean_integer, clean_unsigned_integer, clean_string,
    clean_zip_code, clean_state_code, clean_cip_code
)


def extract_institutions() -> pd.DataFrame:
    """
    Extract institution data from College Scorecard
    Returns DataFrame with cleaned institution data
    """
    print("Extracting College Scorecard Institution data...")
    
    # Only read columns we need (College Scorecard has 2000+ columns)
    columns_to_read = [
        # Identifiers
        'UNITID', 'OPEID', 'OPEID6', 'INSTNM', 'CITY', 'STABBR', 'ZIP',
        'LATITUDE', 'LONGITUDE',
        # Characteristics
        'CONTROL', 'PREDDEG', 'HIGHDEG', 'LOCALE', 'MAIN', 'CURROPER',
        # Costs
        'NPT4_PUB', 'NPT4_PRIV', 'TUITIONFEE_IN', 'TUITIONFEE_OUT',
        'NPT41_PUB', 'NPT42_PUB', 'NPT43_PUB', 'NPT44_PUB', 'NPT45_PUB',
        'NPT41_PRIV', 'NPT42_PRIV', 'NPT43_PRIV', 'NPT44_PRIV', 'NPT45_PRIV',
        # Earnings
        'MD_EARN_WNE_P10', 'MD_EARN_WNE_P6', 'MD_EARN_WNE_P3', 'MD_EARN_WNE_P1',
        # Completion
        'C150_4', 'C150_L4',
        # Student body
        'UGDS', 'ADM_RATE'
    ]
    
    try:
        # Read CSV with only necessary columns
        # Use latin-1 encoding to avoid Unicode errors (some files have non-UTF8 characters)
        df = pd.read_csv(
            COLLEGE_SCORECARD_INSTITUTION,
            low_memory=False,
            encoding='latin-1'  # More permissive than UTF-8
        )
        
        # Strip whitespace from column names (defensive)
        df.columns = df.columns.str.strip()
        
        # Handle BOM in first column - map the actual column name to expected name
        if len(df.columns) > 0 and df.columns[0].endswith('UNITID'):
            df.columns = ['UNITID' if col.endswith('UNITID') else col for col in df.columns]
        
        # Filter to only columns we need that actually exist
        available_cols = [col for col in columns_to_read if col in df.columns]
        df = df[available_cols]
        
        print(f"Loaded {len(df)} institutions")
        
        # Filter for currently operating, main campuses with bachelor's degrees
        df_filtered = df[
            (df['CURROPER'] == 1) &  # Currently operating
            (df['MAIN'] == 1) &      # Main campus
            (df['PREDDEG'].isin([1, 3]))  # Certificate or Bachelor's predominant
        ].copy()
        
        print(f"Filtered to {len(df_filtered)} relevant institutions")
        
        # Clean and transform
        institutions = pd.DataFrame({
            'id': df_filtered['UNITID'].apply(clean_integer),
            'opeid': df_filtered['OPEID'].apply(clean_string),
            'opeid6': df_filtered['OPEID6'].apply(clean_string),
            'name': df_filtered['INSTNM'].apply(lambda x: clean_string(x, 255)),
            'city': df_filtered['CITY'].apply(lambda x: clean_string(x, 100)),
            'state_code': df_filtered['STABBR'].apply(clean_state_code),
            'zip': df_filtered['ZIP'].apply(clean_zip_code),
            'latitude': df_filtered['LATITUDE'].apply(clean_numeric),
            'longitude': df_filtered['LONGITUDE'].apply(clean_numeric),
            'control': df_filtered['CONTROL'].apply(clean_integer),  # 1=public, 2=private nonprofit, 3=private for-profit
            'predominant_degree': df_filtered['PREDDEG'].apply(clean_integer),
            'highest_degree': df_filtered['HIGHDEG'].apply(clean_integer),
            'locale': df_filtered['LOCALE'].apply(clean_integer),
            'is_main_campus': True,  # Filtered to main campuses
            'is_operating': True,    # Filtered to operating
            # Use clean_unsigned_integer for UNSIGNED columns (INT UNSIGNED in MySQL)
            'avg_net_price_public': df_filtered['NPT4_PUB'].apply(clean_unsigned_integer),
            'avg_net_price_private': df_filtered['NPT4_PRIV'].apply(clean_unsigned_integer),
            'tuition_in_state': df_filtered['TUITIONFEE_IN'].apply(clean_unsigned_integer),
            'tuition_out_state': df_filtered['TUITIONFEE_OUT'].apply(clean_unsigned_integer),
            'median_earnings_10yr': df_filtered['MD_EARN_WNE_P10'].apply(clean_integer),
            'median_earnings_6yr': df_filtered['MD_EARN_WNE_P6'].apply(clean_integer),
            'completion_rate': df_filtered['C150_4'].apply(clean_numeric),
            'undergrad_enrollment': df_filtered['UGDS'].apply(clean_integer),
            'admission_rate': df_filtered['ADM_RATE'].apply(clean_numeric),
        })
        
        # Remove rows with null IDs
        institutions = institutions[institutions['id'].notna()]
        
        print(f"Extracted {len(institutions)} institutions with valid data")
        return institutions
        
    except Exception as e:
        print(f"Error extracting institutions: {e}")
        raise


def extract_programs() -> pd.DataFrame:
    """
    Extract field of study (program) data from College Scorecard
    Returns DataFrame with cleaned program-level data
    """
    print("Extracting College Scorecard Field of Study data...")
    
    # NOTE: Actual columns available are EARN_MDN_1YR, EARN_MDN_4YR, EARN_MDN_5YR
    columns_to_read = [
        # Identifiers
        'UNITID', 'OPEID6', 'INSTNM', 'CIPCODE', 'CIPDESC', 'CREDLEV',
        # Earnings by year (only 1, 4, 5 years available)
        'EARN_MDN_1YR', 'EARN_MDN_4YR', 'EARN_MDN_5YR',
        'EARN_COUNT_NWNE_1YR', 'EARN_COUNT_WNE_1YR',
        # Debt (using ALL students, STGP group, ANY debt)
        'DEBT_ALL_STGP_ANY_MDN', 'DEBT_ALL_STGP_ANY_MEAN', 'DEBT_ALL_STGP_ANY_N',
        # Completion
        'IPEDSCOUNT1', 'IPEDSCOUNT2'
    ]
    
    try:
        # Read in chunks due to large file size
        chunks = []
        chunk_iter = pd.read_csv(
            COLLEGE_SCORECARD_FIELD_OF_STUDY,
            chunksize=50000,
            low_memory=False,
            encoding='utf-8'
        )
        
        for chunk in tqdm(chunk_iter, desc="Loading program chunks"):
            # Strip whitespace from column names
            chunk.columns = chunk.columns.str.strip()
            
            # Filter to only columns we need that actually exist
            available_cols = [col for col in columns_to_read if col in chunk.columns]
            chunk = chunk[available_cols]
            
            # Filter for bachelor's degrees only (CREDLEV=3)
            if 'CREDLEV' in chunk.columns:
                chunk_filtered = chunk[chunk['CREDLEV'] == 3].copy()
                if len(chunk_filtered) > 0:  # Only append non-empty chunks
                    chunks.append(chunk_filtered)
                    print(f"  Chunk: {len(chunk_filtered)} bachelor's programs")
            else:
                print("  Warning: CREDLEV column not found in chunk")
        
        if chunks:
            df = pd.concat(chunks, ignore_index=True)
            print(f"Loaded {len(df)} bachelor's degree programs")
        else:
            print("ERROR: No bachelor's degree programs found!")
            df = pd.DataFrame()  # Return empty DataFrame
        
        # Clean and transform
        programs = pd.DataFrame({
            'institution_id': df['UNITID'].apply(clean_integer),
            'cip_code': df['CIPCODE'].apply(clean_cip_code),
            'cip_description': df['CIPDESC'].apply(lambda x: clean_string(x, 255)),
            'credential_level': df['CREDLEV'].apply(clean_integer),
            # Earnings (only 1, 4, 5 years available in dataset)
            'earnings_1yr': df['EARN_MDN_1YR'].apply(clean_integer),
            'earnings_4yr': df['EARN_MDN_4YR'].apply(clean_integer),
            'earnings_5yr': df['EARN_MDN_5YR'].apply(clean_integer),
            # Debt
            'debt_median': df['DEBT_ALL_STGP_ANY_MDN'].apply(clean_integer),
            'debt_mean': df['DEBT_ALL_STGP_ANY_MEAN'].apply(clean_integer),
            'debt_count': df['DEBT_ALL_STGP_ANY_N'].apply(clean_integer),
            # Counts
            'earners_count': df['EARN_COUNT_WNE_1YR'].apply(clean_integer),
            'awards_count': df['IPEDSCOUNT1'].apply(clean_integer),
        })
        
        # Remove rows with essential nulls
        programs = programs[
            programs['institution_id'].notna() &
            programs['cip_code'].notna()
        ]
        
        print(f"Extracted {len(programs)} programs with valid data")
        return programs
        
    except Exception as e:
        print(f"Error extracting programs: {e}")
        raise


def extract_cip_codes(programs_df: pd.DataFrame) -> pd.DataFrame:
    """
    Extract unique CIP codes from programs data
    Returns DataFrame with CIP code reference data
    """
    print("Extracting CIP codes...")
    
    cip_codes = programs_df[['cip_code', 'cip_description']].drop_duplicates()
    cip_codes = cip_codes[cip_codes['cip_code'].notna()]
    
    # Extract 2-digit and 4-digit families
    cip_codes['cip_family_2digit'] = cip_codes['cip_code'].str[:2]
    cip_codes['cip_family_4digit'] = cip_codes['cip_code'].str[:5]
    
    print(f"Extracted {len(cip_codes)} unique CIP codes")
    return cip_codes

