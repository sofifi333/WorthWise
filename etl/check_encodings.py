"""Check encoding of all data files"""
import os

files = [
    '../data/Most-Recent-Cohorts-Institution.csv',
    '../data/Most-Recent-Cohorts-Field-of-Study.csv',
    '../data/cu.data.1.AllItems.csv',
    '../data/CAINC6N__ALL_AREAS_2001_2023.csv'
]

for filepath in files:
    print(f"\n{filepath}:")
    
    # Try UTF-8
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            f.read(100000)
        print("  [OK] UTF-8 works")
    except UnicodeDecodeError as e:
        print(f"  [FAIL] UTF-8 fails: {str(e)[:100]}")
        
        # Try Latin-1
        try:
            with open(filepath, 'r', encoding='latin-1') as f:
                f.read(100000)
            print("  [OK] Latin-1 works")
        except Exception as e2:
            print(f"  [FAIL] Latin-1 fails: {str(e2)[:100]}")
        
        # Try Windows-1252
        try:
            with open(filepath, 'r', encoding='windows-1252') as f:
                f.read(100000)
            print("  [OK] Windows-1252 works")
        except Exception as e3:
            print(f"  [FAIL] Windows-1252 fails: {str(e3)[:100]}")

