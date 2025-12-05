CREATE DATABASE  IF NOT EXISTS `worthwise` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `worthwise`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: worthwise
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `campuses`
--

DROP TABLE IF EXISTS `campuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campuses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `institution_id` int unsigned NOT NULL COMMENT 'Parent institution UNITID',
  `campus_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Campus or branch name',
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state_code` char(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zip` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(11,7) DEFAULT NULL,
  `is_main` tinyint(1) DEFAULT '0' COMMENT 'Is this the main campus',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Campus currently operating',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_institution` (`institution_id`),
  KEY `idx_campus_name` (`campus_name`(50)),
  KEY `idx_state` (`state_code`),
  KEY `idx_location` (`latitude`,`longitude`),
  CONSTRAINT `campuses_ibfk_1` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `campuses_ibfk_2` FOREIGN KEY (`state_code`) REFERENCES `states` (`state_code`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3790 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Branch campus and location data';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cip_codes`
--

DROP TABLE IF EXISTS `cip_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cip_codes` (
  `cip_code` char(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '6-digit CIP code (e.g., 11.0701)',
  `cip_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'CIP program title',
  `cip_2digit` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '2-digit broad field code',
  `cip_2digit_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '2-digit field title',
  `cip_4digit` char(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '4-digit intermediate code',
  `cip_4digit_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '4-digit field title',
  `cip_definition` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Full CIP definition',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cip_code`),
  KEY `idx_cip_2digit` (`cip_2digit`),
  KEY `idx_cip_4digit` (`cip_4digit`),
  KEY `idx_cip_title` (`cip_title`(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CIP codes (Classification of Instructional Programs)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `data_quality_checks`
--

DROP TABLE IF EXISTS `data_quality_checks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_quality_checks` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `etl_run_id` int unsigned DEFAULT NULL COMMENT 'Associated ETL run',
  `dataset_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `check_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Name of quality check (e.g., row_count, null_check)',
  `check_type` enum('count','null','range','uniqueness','referential_integrity','custom') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expected_value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Expected value or range',
  `actual_value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Actual value found',
  `status` enum('pass','fail','warning','skipped') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `records_checked` int unsigned DEFAULT NULL,
  `records_failed` int unsigned DEFAULT NULL,
  `failure_rate` decimal(5,2) DEFAULT NULL COMMENT 'Percentage of failures',
  `check_sql` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'SQL query used for check',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Error or warning message',
  `severity` enum('critical','high','medium','low','info') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `checked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_etl_run` (`etl_run_id`),
  KEY `idx_dataset_name` (`dataset_name`),
  KEY `idx_status` (`status`),
  KEY `idx_severity` (`severity`),
  KEY `idx_checked_at` (`checked_at`),
  CONSTRAINT `data_quality_checks_ibfk_1` FOREIGN KEY (`etl_run_id`) REFERENCES `etl_runs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Data quality validation results';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `data_versions`
--

DROP TABLE IF EXISTS `data_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_versions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `dataset_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Dataset identifier (e.g., college_scorecard_institution)',
  `version_identifier` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Version string (e.g., 2024-09-15, FY2026)',
  `version_date` date DEFAULT NULL COMMENT 'Official version date',
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Source file name',
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Path to source file',
  `file_size_bytes` bigint unsigned DEFAULT NULL COMMENT 'File size in bytes',
  `row_count` int unsigned DEFAULT NULL COMMENT 'Number of rows processed',
  `status` enum('pending','processing','loaded','active','archived','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `loaded_at` timestamp NULL DEFAULT NULL COMMENT 'When data was loaded',
  `activated_at` timestamp NULL DEFAULT NULL COMMENT 'When version became active',
  `archived_at` timestamp NULL DEFAULT NULL COMMENT 'When version was archived',
  `checksum` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'SHA256 checksum of source file',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Version notes, changes, or issues',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_dataset_version` (`dataset_name`,`version_identifier`),
  KEY `idx_dataset_name` (`dataset_name`),
  KEY `idx_version_date` (`version_date`),
  KEY `idx_status` (`status`),
  KEY `idx_loaded_at` (`loaded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dataset version tracking for data provenance';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `etl_runs`
--

DROP TABLE IF EXISTS `etl_runs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `etl_runs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `run_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique run identifier (UUID)',
  `run_type` enum('full_refresh','incremental','backfill','validation','manual') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `started_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `duration_seconds` int unsigned DEFAULT NULL COMMENT 'Total run duration',
  `status` enum('running','success','partial_success','failed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'running',
  `datasets_processed` json DEFAULT NULL COMMENT 'List of datasets processed with row counts',
  `datasets_failed` json DEFAULT NULL COMMENT 'List of failed datasets with error messages',
  `total_rows_processed` int unsigned DEFAULT '0',
  `total_rows_inserted` int unsigned DEFAULT '0',
  `total_rows_updated` int unsigned DEFAULT '0',
  `total_rows_failed` int unsigned DEFAULT '0',
  `error_count` int unsigned DEFAULT '0',
  `error_summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Summary of errors encountered',
  `error_log` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Detailed error log',
  `executed_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User or system that executed ETL',
  `execution_environment` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'e.g., local, ci, production',
  `git_commit_hash` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Git commit hash of ETL code',
  `config_used` json DEFAULT NULL COMMENT 'ETL configuration parameters',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Run notes or special conditions',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `run_id` (`run_id`),
  KEY `idx_run_id` (`run_id`),
  KEY `idx_status` (`status`),
  KEY `idx_started_at` (`started_at`),
  KEY `idx_run_type` (`run_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ETL execution history and audit log';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `institution_search_cache`
--

DROP TABLE IF EXISTS `institution_search_cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `institution_search_cache` (
  `institution_id` int unsigned NOT NULL,
  `search_text` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Concatenated searchable text',
  `display_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Formatted display name',
  `state_code` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ownership_label` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `programs_count` int unsigned DEFAULT '0' COMMENT 'Number of programs offered',
  `has_data` tinyint(1) DEFAULT '1' COMMENT 'Has sufficient data for calculations',
  `sort_priority` int unsigned DEFAULT '999' COMMENT 'Search result ranking',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`institution_id`),
  KEY `idx_state` (`state_code`),
  KEY `idx_priority` (`sort_priority`),
  FULLTEXT KEY `ft_search` (`search_text`,`display_text`),
  CONSTRAINT `institution_search_cache_ibfk_1` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pre-computed search data for institution autocomplete';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `institutions`
--

DROP TABLE IF EXISTS `institutions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `institutions` (
  `id` int unsigned NOT NULL COMMENT 'UNITID from IPEDS',
  `ope8_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '8-digit OPE ID',
  `ope6_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '6-digit OPE ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Institution name',
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'City location',
  `state_code` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'State postal code',
  `zip` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ZIP code (5 or 9 digits)',
  `latitude` decimal(10,7) DEFAULT NULL COMMENT 'Latitude coordinate',
  `longitude` decimal(11,7) DEFAULT NULL COMMENT 'Longitude coordinate',
  `ownership` tinyint unsigned DEFAULT NULL COMMENT '1=Public, 2=Private nonprofit, 3=Private for-profit',
  `tuition_in_state` int unsigned DEFAULT NULL COMMENT 'In-state tuition and fees (USD/year)',
  `tuition_out_state` int unsigned DEFAULT NULL COMMENT 'Out-of-state tuition and fees (USD/year)',
  `avg_net_price_public` int unsigned DEFAULT NULL COMMENT 'Average net price for public institutions (USD/year)',
  `avg_net_price_private` int unsigned DEFAULT NULL COMMENT 'Average net price for private institutions (USD/year)',
  `main_campus` tinyint(1) DEFAULT '1' COMMENT 'TRUE if main campus, FALSE if branch',
  `branch_count` tinyint unsigned DEFAULT '0' COMMENT 'Number of branch campuses',
  `operating` tinyint(1) DEFAULT '1' COMMENT 'TRUE if currently operating',
  `predominant_degree` tinyint unsigned DEFAULT NULL COMMENT '0=Not classified, 1=Certificate, 2=Associate, 3=Bachelor, 4=Graduate',
  `highest_degree` tinyint unsigned DEFAULT NULL COMMENT '0=Non-degree, 1=Certificate, 2=Associate, 3=Bachelor, 4=Graduate',
  `school_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Institution homepage URL',
  `price_calculator_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Net price calculator URL',
  `locale` tinyint unsigned DEFAULT NULL COMMENT 'Locale code (urban/suburban/rural)',
  `region_id` tinyint unsigned DEFAULT NULL COMMENT 'IPEDS region code',
  `carnegie_basic` tinyint unsigned DEFAULT NULL COMMENT 'Carnegie Classification basic',
  `under_investigation` tinyint(1) DEFAULT '0' COMMENT 'Heightened Cash Monitoring flag',
  `hbcu` tinyint(1) DEFAULT '0' COMMENT 'Historically Black College/University',
  `tribal` tinyint(1) DEFAULT '0' COMMENT 'Tribal college',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`(50)),
  KEY `idx_state` (`state_code`),
  KEY `idx_zip` (`zip`),
  KEY `idx_operating` (`operating`),
  KEY `idx_main_campus` (`main_campus`),
  KEY `idx_ownership` (`ownership`),
  KEY `idx_predominant_degree` (`predominant_degree`),
  KEY `idx_location` (`latitude`,`longitude`),
  KEY `idx_tuition_in_state` (`tuition_in_state`),
  KEY `idx_tuition_out_state` (`tuition_out_state`),
  CONSTRAINT `institutions_ibfk_1` FOREIGN KEY (`state_code`) REFERENCES `states` (`state_code`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Institution reference data from College Scorecard';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `major_search_cache`
--

DROP TABLE IF EXISTS `major_search_cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `major_search_cache` (
  `cip_code` char(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `search_text` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Searchable text',
  `display_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Formatted display name',
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '2-digit CIP category name',
  `institutions_count` int unsigned DEFAULT '0' COMMENT 'Number of institutions offering this major',
  `programs_count` int unsigned DEFAULT '0' COMMENT 'Total program count',
  `avg_median_earnings` int unsigned DEFAULT NULL COMMENT 'Average median earnings across programs',
  `sort_priority` int unsigned DEFAULT '999',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cip_code`),
  KEY `idx_category` (`category`),
  KEY `idx_priority` (`sort_priority`),
  FULLTEXT KEY `ft_search` (`search_text`,`display_text`),
  CONSTRAINT `major_search_cache_ibfk_1` FOREIGN KEY (`cip_code`) REFERENCES `cip_codes` (`cip_code`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pre-computed search data for major selection';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `regions`
--

DROP TABLE IF EXISTS `regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `geo_fips` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'FIPS code for geography',
  `region_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Region display name',
  `region_type` enum('national','state','metro','county','census_region') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Geographic level',
  `state_code` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Associated state code (if applicable)',
  `parent_region_id` int unsigned DEFAULT NULL COMMENT 'Parent region (for hierarchical structure)',
  `display_order` int unsigned DEFAULT '999' COMMENT 'Sort order for UI dropdowns',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Show in UI selectors',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_region` (`region_name`,`region_type`),
  KEY `idx_geo_fips` (`geo_fips`),
  KEY `idx_region_type` (`region_type`),
  KEY `idx_state_code` (`state_code`),
  KEY `idx_active` (`is_active`),
  KEY `idx_display_order` (`display_order`),
  KEY `parent_region_id` (`parent_region_id`),
  CONSTRAINT `regions_ibfk_1` FOREIGN KEY (`state_code`) REFERENCES `states` (`state_code`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `regions_ibfk_2` FOREIGN KEY (`parent_region_id`) REFERENCES `regions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Geographic regions for cost-of-living adjustments';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `states`
--

DROP TABLE IF EXISTS `states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `states` (
  `state_code` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Two-letter state postal code (e.g., CA, NY)',
  `state_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Full state name',
  `state_fips` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'FIPS state code',
  `region` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Census region (e.g., West, Northeast)',
  `division` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Census division',
  `is_state` tinyint(1) DEFAULT '1' COMMENT 'TRUE for states, FALSE for territories',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`state_code`),
  KEY `idx_state_fips` (`state_fips`),
  KEY `idx_region` (`region`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='U.S. states and territories reference data';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `system_config`
--

DROP TABLE IF EXISTS `system_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_config` (
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value_type` enum('string','integer','float','boolean','json') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'string',
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Config category (e.g., ui, etl, api)',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Configuration description',
  `is_secret` tinyint(1) DEFAULT '0' COMMENT 'Sensitive data flag',
  `is_editable` tinyint(1) DEFAULT '1' COMMENT 'Can be modified via UI/API',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`config_key`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='System configuration and feature flags';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `v_active_institutions`
--

DROP TABLE IF EXISTS `v_active_institutions`;
/*!50001 DROP VIEW IF EXISTS `v_active_institutions`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_active_institutions` AS SELECT 
 1 AS `id`,
 1 AS `name`,
 1 AS `city`,
 1 AS `state_code`,
 1 AS `state_name`,
 1 AS `zip`,
 1 AS `latitude`,
 1 AS `longitude`,
 1 AS `ownership`,
 1 AS `ownership_label`,
 1 AS `main_campus`,
 1 AS `predominant_degree`,
 1 AS `operating`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_data_versions_active`
--

DROP TABLE IF EXISTS `v_data_versions_active`;
/*!50001 DROP VIEW IF EXISTS `v_data_versions_active`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_data_versions_active` AS SELECT 
 1 AS `dataset_name`,
 1 AS `version_identifier`,
 1 AS `version_date`,
 1 AS `row_count`,
 1 AS `loaded_at`,
 1 AS `activated_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_latest_etl_runs`
--

DROP TABLE IF EXISTS `v_latest_etl_runs`;
/*!50001 DROP VIEW IF EXISTS `v_latest_etl_runs`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_latest_etl_runs` AS SELECT 
 1 AS `run_id`,
 1 AS `run_type`,
 1 AS `status`,
 1 AS `started_at`,
 1 AS `completed_at`,
 1 AS `duration_seconds`,
 1 AS `total_rows_processed`,
 1 AS `error_count`,
 1 AS `executed_by`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'worthwise'
--

--
-- Dumping routines for database 'worthwise'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_activate_data_version` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_activate_data_version`(
    IN p_dataset_name VARCHAR(100),
    IN p_version_identifier VARCHAR(100)
)
BEGIN
    -- Deactivate all previous versions
    UPDATE data_versions 
    SET status = 'archived', archived_at = NOW()
    WHERE dataset_name = p_dataset_name AND status = 'active';
    
    -- Activate new version
    UPDATE data_versions 
    SET status = 'active', activated_at = NOW()
    WHERE dataset_name = p_dataset_name AND version_identifier = p_version_identifier;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_complete_etl_run` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_complete_etl_run`(
    IN p_run_id VARCHAR(50),
    IN p_status VARCHAR(50),
    IN p_error_summary TEXT
)
BEGIN
    UPDATE etl_runs 
    SET 
        status = p_status,
        completed_at = NOW(),
        duration_seconds = TIMESTAMPDIFF(SECOND, started_at, NOW()),
        error_summary = p_error_summary
    WHERE run_id = p_run_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_start_etl_run` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_start_etl_run`(
    IN p_run_id VARCHAR(50),
    IN p_run_type VARCHAR(50),
    IN p_executed_by VARCHAR(100)
)
BEGIN
    INSERT INTO etl_runs (run_id, run_type, executed_by, status, started_at)
    VALUES (p_run_id, p_run_type, p_executed_by, 'running', NOW());
    
    SELECT LAST_INSERT_ID() as etl_run_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `v_active_institutions`
--

/*!50001 DROP VIEW IF EXISTS `v_active_institutions`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_active_institutions` AS select `i`.`id` AS `id`,`i`.`name` AS `name`,`i`.`city` AS `city`,`i`.`state_code` AS `state_code`,`s`.`state_name` AS `state_name`,`i`.`zip` AS `zip`,`i`.`latitude` AS `latitude`,`i`.`longitude` AS `longitude`,`i`.`ownership` AS `ownership`,(case `i`.`ownership` when 1 then 'Public' when 2 then 'Private Nonprofit' when 3 then 'Private For-Profit' else 'Unknown' end) AS `ownership_label`,`i`.`main_campus` AS `main_campus`,`i`.`predominant_degree` AS `predominant_degree`,`i`.`operating` AS `operating` from (`institutions` `i` left join `states` `s` on((`i`.`state_code` = `s`.`state_code`))) where (`i`.`operating` = true) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_data_versions_active`
--

/*!50001 DROP VIEW IF EXISTS `v_data_versions_active`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_data_versions_active` AS select `data_versions`.`dataset_name` AS `dataset_name`,`data_versions`.`version_identifier` AS `version_identifier`,`data_versions`.`version_date` AS `version_date`,`data_versions`.`row_count` AS `row_count`,`data_versions`.`loaded_at` AS `loaded_at`,`data_versions`.`activated_at` AS `activated_at` from `data_versions` where (`data_versions`.`status` = 'active') order by `data_versions`.`dataset_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_latest_etl_runs`
--

/*!50001 DROP VIEW IF EXISTS `v_latest_etl_runs`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_latest_etl_runs` AS select `etl_runs`.`run_id` AS `run_id`,`etl_runs`.`run_type` AS `run_type`,`etl_runs`.`status` AS `status`,`etl_runs`.`started_at` AS `started_at`,`etl_runs`.`completed_at` AS `completed_at`,`etl_runs`.`duration_seconds` AS `duration_seconds`,`etl_runs`.`total_rows_processed` AS `total_rows_processed`,`etl_runs`.`error_count` AS `error_count`,`etl_runs`.`executed_by` AS `executed_by` from `etl_runs` order by `etl_runs`.`started_at` desc limit 10 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
