-- =====================================================================
-- Migration 3A: DROPS CAMPUS TABLE
-- =====================================================================
-- Purpose: Drops Campus table to resolve RuntimeError: campuses table is 
-- missing required columns: {'id'}. Drop the table and recreate it using database/schema.sql
-- Date: 2025-11-21
-- Reason: Old Campus table doesn't include 'id' column. New Campus Table from Migration 3 does.

-- Run this query, then Migration 3
-- =====================================================================

DESCRIBE campuses;
DROP TABLE campuses;