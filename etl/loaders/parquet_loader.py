"""
Parquet File Generator
Creates compressed Parquet files for analytical queries
"""

import pandas as pd
from pathlib import Path
from tqdm import tqdm

from etl.config import PARQUET_DIR


def save_programs_parquet(programs_df: pd.DataFrame, institutions_df: pd.DataFrame):
    """
    Save programs data with institution info to Parquet
    Pre-joined for fast queries
    """
    print("Generating programs Parquet file...")
    
    # Join programs with institutions
    programs_enriched = programs_df.merge(
        institutions_df[[
            'id', 'name', 'city', 'state_code', 'zip',
            'control', 'avg_net_price_public', 'avg_net_price_private',
            'tuition_in_state', 'tuition_out_state', 'completion_rate'
        ]],
        left_on='institution_id',
        right_on='id',
        how='left'
    )
    
    # Drop the duplicate id column
    programs_enriched = programs_enriched.drop(columns=['id'])
    
    # Save to Parquet
    output_path = PARQUET_DIR / "programs.parquet"
    programs_enriched.to_parquet(
        output_path,
        engine='pyarrow',
        compression='snappy',
        index=False
    )
    
    print(f"Saved programs Parquet: {output_path} ({len(programs_enriched)} records)")
    return output_path


def save_fmr_parquet(fmr_df: pd.DataFrame):
    """
    Save FMR data to Parquet
    """
    print("Generating FMR Parquet file...")
    
    output_path = PARQUET_DIR / "fmr.parquet"
    fmr_df.to_parquet(
        output_path,
        engine='pyarrow',
        compression='snappy',
        index=False
    )
    
    print(f"Saved FMR Parquet: {output_path} ({len(fmr_df)} records)")
    return output_path


def save_rpp_parquet(rpp_df: pd.DataFrame):
    """
    Save RPP data to Parquet
    """
    print("Generating RPP Parquet file...")
    
    output_path = PARQUET_DIR / "rpp.parquet"
    rpp_df.to_parquet(
        output_path,
        engine='pyarrow',
        compression='snappy',
        index=False
    )
    
    print(f"Saved RPP Parquet: {output_path} ({len(rpp_df)} records)")
    return output_path


def save_electricity_parquet(electricity_df: pd.DataFrame):
    """
    Save electricity rates to Parquet
    """
    print("Generating electricity Parquet file...")
    
    output_path = PARQUET_DIR / "electricity.parquet"
    electricity_df.to_parquet(
        output_path,
        engine='pyarrow',
        compression='snappy',
        index=False
    )
    
    print(f"Saved electricity Parquet: {output_path} ({len(electricity_df)} records)")
    return output_path


def save_institutions_parquet(institutions_df: pd.DataFrame):
    """
    Save institutions reference data to Parquet
    """
    print("Generating institutions Parquet file...")
    
    output_path = PARQUET_DIR / "institutions.parquet"
    institutions_df.to_parquet(
        output_path,
        engine='pyarrow',
        compression='snappy',
        index=False
    )
    
    print(f"Saved institutions Parquet: {output_path} ({len(institutions_df)} records)")
    return output_path

