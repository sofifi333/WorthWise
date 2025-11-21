-- =====================================================================
-- Migration 2: Add Tuition Fields to Institutions Table
-- =====================================================================
-- Purpose: Add in-state and out-of-state tuition fields from College Scorecard
-- Date: 2025-10-31
-- =====================================================================

USE worthwise;

-- Add tuition columns to institutions table
ALTER TABLE institutions 
ADD COLUMN tuition_in_state INT UNSIGNED COMMENT 'In-state tuition and fees (USD/year)' AFTER ownership,
ADD COLUMN tuition_out_state INT UNSIGNED COMMENT 'Out-of-state tuition and fees (USD/year)' AFTER tuition_in_state,
ADD COLUMN avg_net_price_public INT UNSIGNED COMMENT 'Average net price for public institutions (USD/year)' AFTER tuition_out_state,
ADD COLUMN avg_net_price_private INT UNSIGNED COMMENT 'Average net price for private institutions (USD/year)' AFTER avg_net_price_public;

-- Add indexes
CREATE INDEX idx_tuition_in_state ON institutions(tuition_in_state);
CREATE INDEX idx_tuition_out_state ON institutions(tuition_out_state);


