"""
Database utilities for ETL pipeline
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
from typing import Generator, Tuple, List
import pymysql

from etl.config import DATABASE_URL, MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE


def create_db_engine():
    """Create SQLAlchemy engine"""
    return create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False
    )


def get_session_factory():
    """Create session factory"""
    engine = create_db_engine()
    return sessionmaker(bind=engine)


@contextmanager
def get_db_session() -> Generator:
    """Get database session context manager"""
    Session = get_session_factory()
    session = Session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def execute_sql_file(sql_file_path: str):
    """Execute SQL file directly using pymysql"""
    print(f"Executing SQL file: {sql_file_path}")
    
    with open(sql_file_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Split by delimiter changes and execute
    connection = pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
        charset='utf8mb4'
    )
    
    try:
        with connection.cursor() as cursor:
            # Split on semicolons but handle DELIMITER changes
            statements = []
            current_statement = []
            delimiter = ';'
            
            for line in sql_content.split('\n'):
                line = line.strip()
                
                # Skip comments and empty lines
                if not line or line.startswith('--'):
                    continue
                
                # Check for DELIMITER change
                if line.upper().startswith('DELIMITER'):
                    if current_statement:
                        statements.append('\n'.join(current_statement))
                        current_statement = []
                    delimiter = line.split()[1]
                    continue
                
                current_statement.append(line)
                
                # Check if statement ends with current delimiter
                if line.endswith(delimiter) and delimiter != ';':
                    stmt = '\n'.join(current_statement)[:-len(delimiter)]
                    statements.append(stmt)
                    current_statement = []
                elif ';' in line and delimiter == ';':
                    # Multiple statements on same line
                    parts = '\n'.join(current_statement).split(';')
                    for part in parts[:-1]:
                        if part.strip():
                            statements.append(part.strip())
                    if parts[-1].strip():
                        current_statement = [parts[-1].strip()]
                    else:
                        current_statement = []
            
            if current_statement:
                statements.append('\n'.join(current_statement))
            
            # Execute each statement
            for stmt in statements:
                stmt = stmt.strip()
                if stmt and not stmt.startswith('--'):
                    try:
                        cursor.execute(stmt)
                    except Exception as e:
                        print(f"Error executing statement: {stmt[:100]}...")
                        raise e
        
        connection.commit()
        print(f"Successfully executed SQL file: {sql_file_path}")
    
    finally:
        connection.close()


def truncate_table(table_name: str):
    """Truncate a table"""
    engine = create_db_engine()
    with engine.connect() as conn:
        conn.execute(text(f"SET FOREIGN_KEY_CHECKS=0"))
        conn.execute(text(f"TRUNCATE TABLE {table_name}"))
        conn.execute(text(f"SET FOREIGN_KEY_CHECKS=1"))
        conn.commit()
    print(f"Truncated table: {table_name}")


def table_exists(table_name: str) -> bool:
    """Check if table exists"""
    engine = create_db_engine()
    with engine.connect() as conn:
        result = conn.execute(text(
            f"SELECT COUNT(*) FROM information_schema.tables "
            f"WHERE table_schema = '{MYSQL_DATABASE}' "
            f"AND table_name = '{table_name}'"
        ))
        return result.scalar() > 0


def table_columns_exist(table_name: str, required_columns: List[str]) -> Tuple[bool, List[str]]:
    """
    Validate that required columns exist in a table.
    
    Args:
        table_name: Name of the table to check
        required_columns: List of column names that must exist
        
    Returns:
        Tuple of (all_exist: bool, missing_columns: list)
    """
    engine = create_db_engine()
    with engine.connect() as conn:
        result = conn.execute(text(
            f"SELECT COLUMN_NAME FROM information_schema.columns "
            f"WHERE table_schema = '{MYSQL_DATABASE}' "
            f"AND table_name = '{table_name}'"
        ))
        existing_columns = {row[0] for row in result}
        
        missing = [col for col in required_columns if col not in existing_columns]
        return (len(missing) == 0, missing)


def validate_table_schema(table_name: str, required_columns: List[str]):
    """
    Validate that a table has all required columns.
    Raises RuntimeError with clear message if columns are missing.
    
    Args:
        table_name: Name of the table to validate
        required_columns: List of column names that must exist
        
    Raises:
        RuntimeError: If table doesn't exist or columns are missing
    """
    if not table_exists(table_name):
        raise RuntimeError(
            f"Table '{table_name}' does not exist. "
            f"Run database/schema.sql to create the table."
        )
    
    all_exist, missing = table_columns_exist(table_name, required_columns)
    
    if not all_exist:
        missing_str = ', '.join(missing)
        raise RuntimeError(
            f"Table '{table_name}' is missing required columns: {missing_str}. "
            f"These columns were added in database migrations. "
            f"Please run the following migrations:\n"
            f"  - database/migrations/migration_2.sql (adds tuition columns)\n"
            f"  - database/migrations/migration_1.sql (adds census_region enum)\n\n"
            f"To apply migrations, execute them in order using MySQL client or admin tool."
        )
