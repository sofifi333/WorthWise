"""
ETL Pipeline Main Orchestrator
Coordinates data extraction, transformation, and loading
"""

import sys
import json
import pandas as pd
from datetime import datetime
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from etl.config import DATABASE_DIR, VERSIONS_JSON
from etl.utils.database import execute_sql_file, table_exists
from etl.extractors.college_scorecard import extract_institutions, extract_programs, extract_cip_codes
from etl.extractors.hud_fmr import extract_fmr_data, get_latest_fmr
from etl.extractors.bea_rpp import extract_rpp_data, get_latest_state_rpp
from etl.extractors.eia_electricity import extract_electricity_data, get_latest_electricity_rates
from etl.loaders.mysql_loader import (
    load_states, load_institutions, load_cip_codes,
    load_campuses, load_regions, create_etl_run_record,
    create_data_version_record
)
from etl.loaders.parquet_loader import (
    save_programs_parquet, save_fmr_parquet,
    save_rpp_parquet, save_electricity_parquet, save_institutions_parquet
)
from etl.loaders.duckdb_loader import create_duckdb_database, test_duckdb_queries


def initialize_database():
    """Initialize MySQL database with schema"""
    print("="*80)
    print("STEP 1: Initializing Database Schema")
    print("="*80)
    
    schema_file = DATABASE_DIR / "schema.sql"
    
    if not schema_file.exists():
        raise FileNotFoundError(f"Schema file not found: {schema_file}")
    
    # Check if tables already exist
    if table_exists('institutions'):
        print("Database tables already exist - skipping initialization")
        print("(To recreate tables, drop database manually and re-run)")
        return
    
    # Execute schema file
    execute_sql_file(str(schema_file))
    print("Database schema initialized successfully\n")


def extract_all_data():
    """Extract data from all sources"""
    print("="*80)
    print("STEP 2: Extracting Data from Sources")
    print("="*80)
    
    data = {}
    
    # Extract College Scorecard
    print("\n[1/5] College Scorecard")
    data['institutions'] = extract_institutions()
    data['programs'] = extract_programs()
    data['cip_codes'] = extract_cip_codes(data['programs'])
    
    # Extract HUD FMR
    print("\n[2/5] HUD Fair Market Rents")
    data['fmr'] = extract_fmr_data()
    data['fmr_latest'] = get_latest_fmr(data['fmr'])
    
    # Extract BEA RPP
    print("\n[3/5] BEA Regional Price Parities")
    try:
        data['rpp'] = extract_rpp_data()
        data['rpp_latest'] = get_latest_state_rpp(data['rpp'])
        if len(data['rpp']) == 0:
            print("  WARNING: No RPP data available - cost-of-living adjustments disabled")
    except Exception as e:
        print(f"  ERROR extracting RPP data: {e}")
        print("  Continuing without RPP data - cost-of-living adjustments disabled")
        data['rpp'] = pd.DataFrame(columns=['geo_fips', 'geo_name', 'year', 'rpp_index', 'is_state_level'])
        data['rpp_latest'] = pd.DataFrame(columns=['geo_fips', 'geo_name', 'year', 'rpp_index', 'is_state_level'])
    
    # Extract EIA Electricity
    print("\n[4/5] EIA Electricity Prices")
    data['electricity'] = extract_electricity_data()
    data['electricity_latest'] = get_latest_electricity_rates(data['electricity'])
    
    print("\n[5/5] Data extraction complete!")
    print(f"\nExtracted data summary:")
    print(f"  Institutions: {len(data['institutions']):,}")
    print(f"  Programs: {len(data['programs']):,}")
    print(f"  CIP Codes: {len(data['cip_codes']):,}")
    print(f"  FMR Records: {len(data['fmr']):,}")
    print(f"  RPP Records: {len(data['rpp']):,}")
    print(f"  Electricity Records: {len(data['electricity']):,}")
    
    return data


def load_mysql_data(data):
    """Load reference data into MySQL"""
    print("\n" + "="*80)
    print("STEP 3: Loading Reference Data to MySQL")
    print("="*80)
    
    # Load in dependency order
    print("\n[1/5] Loading states...")
    load_states(data['institutions'])
    
    print("\n[2/5] Loading institutions...")
    load_institutions(data['institutions'])
    
    print("\n[3/5] Loading CIP codes...")
    load_cip_codes(data['cip_codes'])
    
    print("\n[4/5] Loading campuses...")
    load_campuses(data['institutions'])
    
    print("\n[5/5] Loading regions...")
    load_regions()
    
    print("\nMySQL reference data loaded successfully")


def generate_analytical_artifacts(data):
    """Generate Parquet files and DuckDB database"""
    print("\n" + "="*80)
    print("STEP 4: Generating Analytical Artifacts")
    print("="*80)
    
    parquet_files = {}
    
    # Generate Parquet files
    print("\n[1/5] Generating Parquet files...")
    parquet_files['programs'] = save_programs_parquet(data['programs'], data['institutions'])
    parquet_files['fmr'] = save_fmr_parquet(data['fmr'])
    parquet_files['rpp'] = save_rpp_parquet(data['rpp'])
    parquet_files['electricity'] = save_electricity_parquet(data['electricity'])
    parquet_files['institutions'] = save_institutions_parquet(data['institutions'])
    
    # Create DuckDB database
    print("\n[2/5] Creating DuckDB database...")
    create_duckdb_database(parquet_files)
    
    # Test queries
    print("\n[3/5] Testing DuckDB...")
    test_duckdb_queries()
    
    print("\nAnalytical artifacts generated successfully")
    
    return parquet_files


def generate_version_manifest(data):
    """Generate versions.json manifest"""
    print("\n" + "="*80)
    print("STEP 5: Generating Version Manifest")
    print("="*80)
    
    versions = {
        "generated_at": datetime.now().isoformat(),
        "datasets": {
            "college_scorecard_institution": {
                "date": "2024-09",
                "records": len(data['institutions']),
                "source": "https://collegescorecard.ed.gov/data/"
            },
            "college_scorecard_field_of_study": {
                "date": "2024-09",
                "records": len(data['programs']),
                "source": "https://collegescorecard.ed.gov/data/"
            },
            "hud_fmr": {
                "date": "FY2026",
                "records": len(data['fmr']),
                "source": "https://www.huduser.gov/portal/datasets/fmr.html"
            },
            "bea_rpp": {
                "date": f"2001-{data['rpp']['year'].max()}",
                "records": len(data['rpp']),
                "source": "https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area"
            },
            "eia_electricity": {
                "date": f"{data['electricity']['year'].min()}-{data['electricity']['year'].max()}",
                "records": len(data['electricity']),
                "source": "https://www.eia.gov/electricity/data/state/avgprice_annual.xlsx"
            }
        }
    }
    
    # Write to file
    with open(VERSIONS_JSON, 'w') as f:
        json.dump(versions, f, indent=2)
    
    print(f"Version manifest written to: {VERSIONS_JSON}")
    print(json.dumps(versions, indent=2))


def record_etl_metadata(data):
    """Record ETL run and data version metadata"""
    print("\n" + "="*80)
    print("STEP 6: Recording ETL Metadata")
    print("="*80)
    
    # Record ETL run
    total_records = sum([
        len(data['institutions']),
        len(data['programs']),
        len(data['fmr']),
        len(data['rpp']),
        len(data['electricity'])
    ])
    
    create_etl_run_record(
        run_type='full',
        status='completed',
        records_processed=total_records,
        notes='Full ETL pipeline execution'
    )
    
    # Record data versions
    create_data_version_record(
        dataset_name='college_scorecard',
        version='2024-09',
        source_url='https://collegescorecard.ed.gov/data/'
    )
    
    create_data_version_record(
        dataset_name='hud_fmr',
        version='FY2026',
        source_url='https://www.huduser.gov/portal/datasets/fmr.html'
    )
    
    print("ETL metadata recorded successfully")


def run_full_pipeline():
    """Run complete ETL pipeline"""
    print("\n" + "="*80)
    print("COLLEGE ROI PLANNER - ETL PIPELINE")
    print("="*80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    start_time = datetime.now()
    
    try:
        # Step 1: Initialize database
        initialize_database()
        
        # Step 2: Extract all data
        data = extract_all_data()
        
        # Step 3: Load MySQL
        load_mysql_data(data)
        
        # Step 4: Generate analytical artifacts
        generate_analytical_artifacts(data)
        
        # Step 5: Generate version manifest
        generate_version_manifest(data)
        
        # Step 6: Record metadata
        record_etl_metadata(data)
        
        # Success
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print("\n" + "="*80)
        print("ETL PIPELINE COMPLETED SUCCESSFULLY")
        print("="*80)
        print(f"Duration: {duration:.2f} seconds ({duration/60:.2f} minutes)")
        print(f"Completed at: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print("\nYou can now run the backend with: cd backend && uvicorn main:app --reload")
        
    except Exception as e:
        print(f"\n\nERROR: ETL pipeline failed")
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    run_full_pipeline()

