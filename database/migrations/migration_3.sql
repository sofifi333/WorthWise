-- =====================================================================
-- Migration 3: Create Campuses Table
-- =====================================================================
-- Purpose: Create campuses table with proper PRIMARY KEY for Aiven compatibility
-- Date: 2025-11-09
-- Reason: Table missing from initial schema deployment on Aiven
-- =====================================================================

USE worthwise;

-- Create campuses table if it doesn't exist
CREATE TABLE IF NOT EXISTS campuses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    institution_id INT UNSIGNED NOT NULL COMMENT 'Parent institution UNITID',
    campus_name VARCHAR(255) NOT NULL COMMENT 'Campus or branch name',
    city VARCHAR(100),
    state_code CHAR(2),
    zip VARCHAR(10),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(11, 7),
    is_main BOOLEAN DEFAULT FALSE COMMENT 'Is this the main campus',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Campus currently operating',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_institution (institution_id),
    INDEX idx_campus_name (campus_name(50)),
    INDEX idx_state (state_code),
    INDEX idx_location (latitude, longitude),
    
    -- Foreign Keys
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (state_code) REFERENCES states(state_code) ON DELETE SET NULL ON UPDATE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Branch campus and location data';


SELECT 'Campuses table created successfully' AS status;
SHOW CREATE TABLE campuses;

