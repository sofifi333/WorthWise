"""
MySQL Loader
Loads reference data into MySQL tables
"""

import pandas as pd
from datetime import datetime
from tqdm import tqdm
from sqlalchemy import text

from etl.utils.database import get_db_session, create_db_engine, validate_table_schema


def load_states(institutions_df: pd.DataFrame):
    """
    Load unique states from institutions data
    """
    print("Loading states table...")
    
    # Extract unique states
    states = institutions_df[['state_code']].drop_duplicates()
    states = states[states['state_code'].notna()]
    
    # Add state names, FIPS codes, and regions (mapping)
    state_data = {
        'AL': ('Alabama', '01', 'South'), 'AK': ('Alaska', '02', 'West'), 'AZ': ('Arizona', '04', 'West'),
        'AR': ('Arkansas', '05', 'South'), 'CA': ('California', '06', 'West'), 'CO': ('Colorado', '08', 'West'),
        'CT': ('Connecticut', '09', 'Northeast'), 'DE': ('Delaware', '10', 'South'), 'DC': ('District of Columbia', '11', 'South'),
        'FL': ('Florida', '12', 'South'), 'GA': ('Georgia', '13', 'South'), 'HI': ('Hawaii', '15', 'West'),
        'ID': ('Idaho', '16', 'West'), 'IL': ('Illinois', '17', 'Midwest'), 'IN': ('Indiana', '18', 'Midwest'),
        'IA': ('Iowa', '19', 'Midwest'), 'KS': ('Kansas', '20', 'Midwest'), 'KY': ('Kentucky', '21', 'South'),
        'LA': ('Louisiana', '22', 'South'), 'ME': ('Maine', '23', 'Northeast'), 'MD': ('Maryland', '24', 'South'),
        'MA': ('Massachusetts', '25', 'Northeast'), 'MI': ('Michigan', '26', 'Midwest'), 'MN': ('Minnesota', '27', 'Midwest'),
        'MS': ('Mississippi', '28', 'South'), 'MO': ('Missouri', '29', 'Midwest'), 'MT': ('Montana', '30', 'West'),
        'NE': ('Nebraska', '31', 'Midwest'), 'NV': ('Nevada', '32', 'West'), 'NH': ('New Hampshire', '33', 'Northeast'),
        'NJ': ('New Jersey', '34', 'Northeast'), 'NM': ('New Mexico', '35', 'West'), 'NY': ('New York', '36', 'Northeast'),
        'NC': ('North Carolina', '37', 'South'), 'ND': ('North Dakota', '38', 'Midwest'), 'OH': ('Ohio', '39', 'Midwest'),
        'OK': ('Oklahoma', '40', 'South'), 'OR': ('Oregon', '41', 'West'), 'PA': ('Pennsylvania', '42', 'Northeast'),
        'RI': ('Rhode Island', '44', 'Northeast'), 'SC': ('South Carolina', '45', 'South'), 'SD': ('South Dakota', '46', 'Midwest'),
        'TN': ('Tennessee', '47', 'South'), 'TX': ('Texas', '48', 'South'), 'UT': ('Utah', '49', 'West'),
        'VT': ('Vermont', '50', 'Northeast'), 'VA': ('Virginia', '51', 'South'), 'WA': ('Washington', '53', 'West'),
        'WV': ('West Virginia', '54', 'South'), 'WI': ('Wisconsin', '55', 'Midwest'), 'WY': ('Wyoming', '56', 'West')
    }
    
    # Apply mappings
    states['state_name'] = states['state_code'].map(lambda x: state_data.get(x, (None, None, None))[0])
    states['state_fips'] = states['state_code'].map(lambda x: state_data.get(x, (None, None, None))[1])
    states['region'] = states['state_code'].map(lambda x: state_data.get(x, (None, None, None))[2])
    states['is_state'] = states['state_code'] != 'DC'  # DC is not a state
    
    # Filter out rows with missing required data (territories not in our mapping)
    states = states[states['state_name'].notna()]
    
    # Load to database
    engine = create_db_engine()
    
    # Use append mode to avoid foreign key constraint issues
    # First truncate the table to clear existing data
    with engine.connect() as conn:
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        conn.execute(text("TRUNCATE TABLE states"))
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
    
    states.to_sql('states', engine, if_exists='append', index=False, method='multi')
    
    print(f"Loaded {len(states)} states")


def load_institutions(institutions_df: pd.DataFrame):
    """
    Load institutions reference data
    """
    print("Loading institutions table...")
    
    # Validate table schema has required columns (added in migrations)
    required_columns = [
        'id', 'ope8_id', 'ope6_id', 'name', 'city', 'state_code',
        'zip', 'latitude', 'longitude', 'ownership',
        'tuition_in_state', 'tuition_out_state',
        'avg_net_price_public', 'avg_net_price_private',
        'predominant_degree', 'highest_degree', 'locale',
        'main_campus', 'operating'
    ]
    validate_table_schema('institutions', required_columns)
    
    # Prepare data for database
    institutions_db = institutions_df[[
        'id', 'opeid', 'opeid6', 'name', 'city', 'state_code',
        'zip', 'latitude', 'longitude', 'control',
        'tuition_in_state', 'tuition_out_state', 
        'avg_net_price_public', 'avg_net_price_private',
        'predominant_degree', 'highest_degree', 'locale',
        'is_main_campus', 'is_operating'
    ]].copy()
    
    # Rename columns to match schema
    institutions_db.rename(columns={
        'control': 'ownership',
        'is_main_campus': 'main_campus',
        'is_operating': 'operating',
        'opeid': 'ope8_id',
        'opeid6': 'ope6_id'
    }, inplace=True)
    
    # Filter out institutions from territories that don't exist in states table
    # Get valid state codes from states table
    engine = create_db_engine()
    with engine.connect() as conn:
        result = conn.execute(text("SELECT state_code FROM states"))
        valid_state_codes = {row[0] for row in result}
    
    # Filter institutions to only include those with valid state codes
    institutions_db = institutions_db[institutions_db['state_code'].isin(valid_state_codes)]
    print(f"Filtered to {len(institutions_db)} institutions with valid state codes")
    
    # Validate UNSIGNED integer columns before database insert
    # Remove rows with invalid values (negative or out of range)
    initial_count = len(institutions_db)
    
    # Check for invalid values in UNSIGNED columns
    unsigned_columns = ['tuition_in_state', 'tuition_out_state', 'avg_net_price_public', 'avg_net_price_private']
    for col in unsigned_columns:
        if col in institutions_db.columns:
            # Filter out rows where value is negative or exceeds INT UNSIGNED max (4,294,967,295)
            invalid_mask = (
                institutions_db[col].notna() & 
                ((institutions_db[col] < 0) | (institutions_db[col] > 4294967295))
            )
            invalid_count = invalid_mask.sum()
            if invalid_count > 0:
                print(f"  Warning: Found {invalid_count} rows with invalid {col} values (negative or out of range)")
                institutions_db = institutions_db[~invalid_mask]
    
    if len(institutions_db) < initial_count:
        removed = initial_count - len(institutions_db)
        print(f"  Removed {removed} institutions with invalid UNSIGNED integer values")
        print(f"  Proceeding with {len(institutions_db)} valid institutions")
    
    # Load to database
    engine = create_db_engine()
    
    # Use append mode to avoid foreign key constraint issues
    # First truncate the table to clear existing data
    with engine.connect() as conn:
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        conn.execute(text("TRUNCATE TABLE institutions"))
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
    
    institutions_db.to_sql('institutions', engine, if_exists='append', index=False, method='multi', chunksize=100)
    
    print(f"Loaded {len(institutions_db)} institutions")


def load_cip_codes(cip_codes_df: pd.DataFrame):
    """
    Load CIP codes reference data
    """
    print("Loading cip_codes table...")
    
    # Prepare data
    cip_codes_db = cip_codes_df[[
        'cip_code', 'cip_description', 'cip_family_2digit', 'cip_family_4digit'
    ]].copy()
    
    # Rename columns to match schema
    cip_codes_db.rename(columns={
        'cip_description': 'cip_title',
        'cip_family_2digit': 'cip_2digit',
        'cip_family_4digit': 'cip_4digit'
    }, inplace=True)
    
    # Add placeholder titles for 2-digit and 4-digit (can be enhanced later)
    cip_codes_db['cip_2digit_title'] = None
    cip_codes_db['cip_4digit_title'] = None
    
    # Load to database
    engine = create_db_engine()
    
    # Use append mode to avoid foreign key constraint issues
    # First truncate the table to clear existing data
    with engine.connect() as conn:
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        conn.execute(text("TRUNCATE TABLE cip_codes"))
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
    
    cip_codes_db.to_sql('cip_codes', engine, if_exists='append', index=False, method='multi')
    
    print(f"Loaded {len(cip_codes_db)} CIP codes")


def load_campuses(institutions_df: pd.DataFrame):
    """
    Load campuses (for now, just main campuses from institutions)
    """
    print("Loading campuses table...")
    
    # Create campus records from institutions
    campuses = pd.DataFrame({
        'institution_id': institutions_df['id'],
        'campus_name': 'Main Campus',
        'city': institutions_df['city'],
        'state_code': institutions_df['state_code'],
        'zip': institutions_df['zip'],
        'is_main': True,
        'is_active': institutions_df['is_operating']
    })
    
    # Load to database
    engine = create_db_engine()
    campuses.to_sql('campuses', engine, if_exists='replace', index=False, method='multi', chunksize=1000)
    
    print(f"Loaded {len(campuses)} campuses")


def load_regions():
    """
    Load regions reference data (census regions for now)
    
    CRITICAL: regions table MUST be created by schema.sql first!
    This function only loads data, does NOT create the table.
    """
    print("Loading regions table...")
    
    engine = create_db_engine()
    
    # Verify table exists with proper schema
    with engine.connect() as conn:
        result = conn.execute(text("SHOW TABLES LIKE 'regions'"))
        if not result.fetchone():
            raise RuntimeError(
                "regions table does not exist! "
                "Run database/schema.sql first to create the table."
            )
        
        # Verify table has required columns
        result = conn.execute(text("DESCRIBE regions"))
        columns = {row[0] for row in result.fetchall()}
        required = {'id', 'region_name', 'region_type', 'display_order', 'is_active'}
        missing = required - columns
        if missing:
            raise RuntimeError(
                f"regions table is missing required columns: {missing}. "
                f"Drop the table and recreate it using database/schema.sql"
            )
    
    # Create regions DataFrame with ONLY the columns we want to populate
    # id is AUTO_INCREMENT, created_at/updated_at have defaults
    regions = pd.DataFrame({
        'region_name': ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'],
        'region_type': ['census_region'] * 5,  # Must exist in RegionType enum
        'display_order': [1, 2, 3, 4, 5],
        'is_active': [True] * 5,
        'parent_region_id': [None] * 5,  # NULL for top-level regions
        'geo_fips': [None] * 5,  # No FIPS for census regions
        'state_code': [None] * 5  # NULL for national-level regions
    })
    
    # Clear existing data
    with engine.connect() as conn:
        conn.execute(text("DELETE FROM regions"))
        conn.commit()
    
    # Load data using append mode (preserves schema)
    regions.to_sql('regions', engine, if_exists='append', index=False, method='multi')
    
    print(f"Loaded {len(regions)} regions")


def create_etl_run_record(run_type: str, status: str, records_processed: int, notes: str = None):
    """
    Create ETL run record in database
    """
    print(f"Recording ETL run: {run_type} - {status}")
    
    # Generate unique run_id
    import uuid
    run_id = str(uuid.uuid4())[:8]
    
    etl_run = pd.DataFrame([{
        'run_id': run_id,
        'run_type': run_type,
        'status': 'success' if status == 'completed' else status,
        'started_at': datetime.now(),
        'completed_at': datetime.now() if status == 'completed' else None,
        'total_rows_processed': records_processed,
        'error_summary': notes
    }])
    
    engine = create_db_engine()
    etl_run.to_sql('etl_runs', engine, if_exists='append', index=False)


def create_data_version_record(dataset_name: str, version: str, source_url: str = None):
    """
    Create data version record in database
    """
    print(f"Recording data version: {dataset_name} - {version}")
    
    data_version = pd.DataFrame([{
        'dataset_name': dataset_name,
        'version_identifier': version,
        'version_date': datetime.now().date(),
        'file_name': f"{dataset_name}.csv",
        'status': 'active',
        'loaded_at': datetime.now(),
        'activated_at': datetime.now()
    }])
    
    engine = create_db_engine()
    data_version.to_sql('data_versions', engine, if_exists='append', index=False)

