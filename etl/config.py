"""
ETL Configuration
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
ARTIFACTS_DIR = PROJECT_ROOT / "backend" / "artifacts"
DATABASE_DIR = PROJECT_ROOT / "database"

# Ensure directories exist
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

# Database configuration
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
MYSQL_USER = os.getenv("MYSQL_USER", "worthwise_dev")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "dev_password_123")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "worthwise")

DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4"

# Data file paths
COLLEGE_SCORECARD_INSTITUTION = DATA_DIR / "Most-Recent-Cohorts-Institution.csv"
COLLEGE_SCORECARD_FIELD_OF_STUDY = DATA_DIR / "Most-Recent-Cohorts-Field-of-Study.csv"
COLLEGE_SCORECARD_DICTIONARY = DATA_DIR / "data.yaml"

HUD_FMR_FILES = [
    DATA_DIR / "fy2021_safmrs_revised.xlsx",
    DATA_DIR / "fy2022_safmrs_revised.xlsx",
    DATA_DIR / "fy2023_safmrs_revised.xlsx",
    DATA_DIR / "fy2024_safmrs_revised.xlsx",
    DATA_DIR / "fy2025_safmrs_revised.xlsx",
    DATA_DIR / "fy2026_safmrs_revised.xlsx",
]

BEA_RPP_FILE = DATA_DIR / "CAINC6N__ALL_AREAS_2001_2023.csv"
EIA_ELECTRICITY_FILE = DATA_DIR / "avgprice_annual.xlsx"

# Output paths
PARQUET_DIR = ARTIFACTS_DIR
DUCKDB_PATH = ARTIFACTS_DIR / "analytics.duckdb"
VERSIONS_JSON = PROJECT_ROOT / "backend" / "versions.json"

# Processing options
CHUNK_SIZE = 10000  # For large CSV processing
PRIVACY_SUPPRESSION_VALUES = ["NULL", "PrivacySuppressed", "PS", "NA", ""]

