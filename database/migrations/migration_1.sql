-- Migration 1: Add 'census_region' to region_type ENUM
-- Date: 2025-10-27
-- Purpose: Fix 500 error on /api/v1/options/regions endpoint
--          ETL loads regions with type 'census_region' but it was missing from enum

-- Add 'census_region' to the region_type ENUM
ALTER TABLE regions 
MODIFY COLUMN region_type ENUM('national', 'state', 'metro', 'county', 'census_region') NOT NULL 
COMMENT 'Geographic level';

