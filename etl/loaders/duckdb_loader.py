"""
DuckDB Database Creator
Creates analytical DuckDB database from Parquet files
"""

import duckdb
from pathlib import Path

from etl.config import DUCKDB_PATH, PARQUET_DIR


def create_duckdb_database(parquet_files: dict):
    """
    Create DuckDB database and load all Parquet files as tables
    
    Args:
        parquet_files: Dict mapping table names to parquet file paths
    """
    print(f"Creating DuckDB database at: {DUCKDB_PATH}")
    
    # Remove existing database
    if DUCKDB_PATH.exists():
        try:
            DUCKDB_PATH.unlink()
            print("Removed existing DuckDB database")
        except PermissionError:
            print("WARNING: Cannot delete existing DuckDB file (in use)")
            print("Attempting to overwrite by connecting directly...")
            # Continue anyway - connecting will attempt to reuse the file
    
    # Create new database
    conn = duckdb.connect(str(DUCKDB_PATH))
    
    try:
        # Load each Parquet file as a table
        for table_name, parquet_path in parquet_files.items():
            if not Path(parquet_path).exists():
                print(f"Warning: Parquet file not found: {parquet_path}")
                continue
            
            print(f"Loading {table_name} from {parquet_path}...")
            
            # Create table from Parquet
            conn.execute(f"""
                CREATE TABLE {table_name} AS 
                SELECT * FROM read_parquet('{parquet_path}')
            """)
            
            # Get row count
            count = conn.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]
            print(f"  Loaded {count} rows into {table_name}")
        
        # Create indexes for common queries
        print("Creating indexes...")
        
        # Programs table indexes
        if 'programs' in parquet_files:
            conn.execute("CREATE INDEX idx_programs_institution ON programs(institution_id)")
            conn.execute("CREATE INDEX idx_programs_cip ON programs(cip_code)")
            conn.execute("CREATE INDEX idx_programs_state ON programs(state_code)")
        
        # FMR table indexes
        if 'fmr' in parquet_files:
            conn.execute("CREATE INDEX idx_fmr_zip ON fmr(zip_code)")
            conn.execute("CREATE INDEX idx_fmr_year ON fmr(fiscal_year)")
        
        # RPP table indexes
        if 'rpp' in parquet_files:
            conn.execute("CREATE INDEX idx_rpp_geo ON rpp(geo_name)")
            conn.execute("CREATE INDEX idx_rpp_year ON rpp(year)")
        
        # Electricity table indexes
        if 'electricity' in parquet_files:
            conn.execute("CREATE INDEX idx_electricity_state ON electricity(state_code)")
        
        # Institutions table indexes
        if 'institutions' in parquet_files:
            conn.execute("CREATE INDEX idx_institutions_id ON institutions(id)")
            conn.execute("CREATE INDEX idx_institutions_state ON institutions(state_code)")
        
        print("Indexes created successfully")
        
        # Create analytical views
        print("Creating analytical views...")
        
        # View: Programs with all cost/earnings data
        conn.execute("""
            CREATE VIEW v_programs_complete AS
            SELECT 
                p.*,
                f.safmr_1br,
                f.safmr_2br,
                e.residential_rate as electricity_rate,
                r.rpp_index
            FROM programs p
            LEFT JOIN fmr f ON p.zip = f.zip_code
            LEFT JOIN electricity e ON CAST(p.state_code AS VARCHAR) = e.state_code
            LEFT JOIN (
                SELECT geo_name, rpp_index, 
                       ROW_NUMBER() OVER (PARTITION BY geo_name ORDER BY year DESC) as rn
                FROM rpp
                WHERE is_state_level = true
            ) r ON UPPER(CAST(p.state_code AS VARCHAR)) = UPPER(SUBSTR(CAST(r.geo_name AS VARCHAR), 1, 2)) AND r.rn = 1
        """)
        
        print("Analytical views created")
        
        # Verify database integrity
        print("\nDatabase Summary:")
        tables = conn.execute("SHOW TABLES").fetchall()
        for table in tables:
            table_name = table[0]
            count = conn.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]
            print(f"  {table_name}: {count:,} rows")
        
        conn.close()
        print(f"\nDuckDB database created successfully: {DUCKDB_PATH}")
        print(f"Database size: {DUCKDB_PATH.stat().st_size / 1024 / 1024:.2f} MB")
        
    except Exception as e:
        conn.close()
        print(f"Error creating DuckDB database: {e}")
        raise


def test_duckdb_queries():
    """
    Test basic queries against the DuckDB database
    """
    print("\nTesting DuckDB queries...")
    
    conn = duckdb.connect(str(DUCKDB_PATH), read_only=True)
    
    try:
        # Test 1: Count programs by state
        print("\nTest 1: Programs by state (top 10)")
        result = conn.execute("""
            SELECT state_code, COUNT(*) as program_count
            FROM programs
            WHERE state_code IS NOT NULL
            GROUP BY state_code
            ORDER BY program_count DESC
            LIMIT 10
        """).fetchall()
        for row in result:
            print(f"  {row[0]}: {row[1]:,} programs")
        
        # Test 2: Average earnings by CIP 2-digit family
        print("\nTest 2: Average earnings by major category (top 10)")
        result = conn.execute("""
            SELECT 
                SUBSTR(CAST(cip_code AS VARCHAR), 1, 2) as cip_family,
                cip_description,
                AVG(earnings_1yr) as avg_earnings_1yr,
                COUNT(*) as program_count
            FROM programs
            WHERE earnings_1yr IS NOT NULL
            GROUP BY cip_family, cip_description
            HAVING COUNT(*) >= 10
            ORDER BY avg_earnings_1yr DESC
            LIMIT 10
        """).fetchall()
        for row in result:
            print(f"  {row[0]} - {row[1]}: ${row[2]:,.0f} ({row[3]} programs)")
        
        # Test 3: FMR by ZIP
        print("\nTest 3: Sample FMR data")
        result = conn.execute("""
            SELECT zip_code, fiscal_year, safmr_1br, safmr_2br
            FROM fmr
            ORDER BY safmr_2br DESC
            LIMIT 5
        """).fetchall()
        for row in result:
            print(f"  ZIP {row[0]} (FY{row[1]}): 1BR=${row[2]}, 2BR=${row[3]}")
        
        print("\nDuckDB queries completed successfully")
        
    except Exception as e:
        print(f"Error testing DuckDB queries: {e}")
        raise
    finally:
        conn.close()

