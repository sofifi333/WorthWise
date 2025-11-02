"""
Data cleaning utilities
"""

import pandas as pd
import numpy as np
from typing import Any, List
from etl.config import PRIVACY_SUPPRESSION_VALUES


def clean_suppressed_values(value: Any) -> Any:
    """Convert privacy suppression codes to None"""
    if pd.isna(value):
        return None
    if isinstance(value, str) and value in PRIVACY_SUPPRESSION_VALUES:
        return None
    return value


def clean_numeric(value: Any) -> float:
    """Clean and convert to numeric, return None if invalid"""
    try:
        if pd.isna(value):
            return None
        if isinstance(value, str):
            if value in PRIVACY_SUPPRESSION_VALUES:
                return None
            # Remove any non-numeric characters except decimal point and minus
            value = value.replace(',', '').replace('$', '').strip()
        result = float(value)
        return result if not np.isnan(result) else None
    except (ValueError, TypeError):
        return None


def clean_integer(value: Any) -> int:
    """Clean and convert to integer, return None if invalid"""
    result = clean_numeric(value)
    if result is None:
        return None
    try:
        return int(result)
    except (ValueError, OverflowError):
        return None


def clean_unsigned_integer(value: Any, max_value: int = 4294967295) -> int:
    """
    Clean and convert to unsigned integer (for MySQL INT UNSIGNED).
    
    Args:
        value: Value to clean
        max_value: Maximum allowed value (default: 4,294,967,295 for INT UNSIGNED)
        
    Returns:
        Integer value if valid (0 to max_value), None if invalid or out of range
    """
    result = clean_numeric(value)
    if result is None:
        return None
    
    try:
        int_value = int(result)
        # Validate range for UNSIGNED: must be >= 0 and <= max_value
        if int_value < 0:
            return None  # Negative values not allowed for UNSIGNED
        if int_value > max_value:
            return None  # Exceeds maximum for INT UNSIGNED
        return int_value
    except (ValueError, OverflowError):
        return None


def clean_string(value: Any, max_length: int = None) -> str:
    """Clean string value"""
    if pd.isna(value):
        return None
    value = str(value).strip()
    if value in PRIVACY_SUPPRESSION_VALUES or value == '':
        return None
    if max_length and len(value) > max_length:
        value = value[:max_length]
    return value


def clean_zip_code(value: Any) -> str:
    """Clean and format ZIP code to 5 digits"""
    if pd.isna(value):
        return None
    value = str(value).strip().split('-')[0]  # Remove ZIP+4
    value = value.zfill(5)  # Pad with zeros
    return value if len(value) == 5 else None


def clean_state_code(value: Any) -> str:
    """Clean state code to 2-letter uppercase"""
    if pd.isna(value):
        return None
    value = str(value).strip().upper()
    return value if len(value) == 2 else None


def clean_cip_code(value: Any) -> str:
    """
    Clean CIP code to 6-digit format XX.XXXX
    
    College Scorecard stores CIP codes as 4-digit integers representing FF.PP
    where the last 00 is implied:
        100 -> "0100" -> "01.00" -> "01.0000"
        1107 -> "1107" -> "11.07" -> "11.0700"
        1101 -> "1101" -> "11.01" -> "11.0100"
    """
    if pd.isna(value):
        return None
    
    # Convert to string and clean
    value = str(value).strip()
    
    # Remove any dots first to get raw digits
    value = value.replace('.', '')
    
    # Check if it's all digits
    if not value.isdigit():
        return None
    
    # College Scorecard stores CIP codes as 4-digit integers (FFPP format)
    # Pad to 4 digits and add trailing "00" to get full 6-digit code
    if len(value) <= 4:
        # This is the College Scorecard format: pad to 4 digits, then add "00"
        value = value.zfill(4) + "00"
    else:
        # Already 6 digits or more, pad to 6
        value = value.zfill(6)
    
    # Format as XX.XXXX
    return f"{value[:2]}.{value[2:6]}"


def clean_dataframe_columns(df: pd.DataFrame, column_mappings: dict) -> pd.DataFrame:
    """
    Clean DataFrame by:
    1. Selecting only specified columns
    2. Renaming them
    3. Applying suppression cleaning
    """
    # Select and rename columns
    available_cols = {k: v for k, v in column_mappings.items() if k in df.columns}
    df_clean = df[list(available_cols.keys())].copy()
    df_clean.rename(columns=available_cols, inplace=True)
    
    # Apply suppression cleaning to all columns
    for col in df_clean.columns:
        df_clean[col] = df_clean[col].apply(clean_suppressed_values)
    
    return df_clean


def remove_duplicates(df: pd.DataFrame, subset: List[str] = None) -> pd.DataFrame:
    """Remove duplicate rows"""
    before = len(df)
    df = df.drop_duplicates(subset=subset)
    after = len(df)
    if before != after:
        print(f"Removed {before - after} duplicate rows")
    return df


def fill_missing_with_defaults(df: pd.DataFrame, defaults: dict) -> pd.DataFrame:
    """Fill missing values with defaults"""
    for col, default_value in defaults.items():
        if col in df.columns:
            df[col].fillna(default_value, inplace=True)
    return df

