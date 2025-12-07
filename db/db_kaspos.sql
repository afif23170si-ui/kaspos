-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 19, 2025 at 05:32 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_kaspos`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `log_name` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `subject_type` varchar(255) DEFAULT NULL,
  `event` varchar(255) DEFAULT NULL,
  `subject_id` bigint(20) UNSIGNED DEFAULT NULL,
  `causer_type` varchar(255) DEFAULT NULL,
  `causer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `properties` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`properties`)),
  `batch_uuid` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `event`, `subject_id`, `causer_type`, `causer_id`, `properties`, `batch_uuid`, `created_at`, `updated_at`) VALUES
(1, 'user', 'created', 'App\\Models\\User', 'created', 1, NULL, NULL, '{\"attributes\":{\"name\":\"Superadmin\",\"username\":\"superadmin\",\"email\":\"superadmin@gmail.com\",\"password\":\"$2y$12$nz2jTjr9TOZoFC9ENKZITuEVRr77aR9mwgQZGLYKODrk8v0e5f.Iq\"}}', NULL, '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(2, 'user', 'created', 'App\\Models\\User', 'created', 2, NULL, NULL, '{\"attributes\":{\"name\":\"Cashier-dev\",\"username\":\"cashier-dev\",\"email\":\"cashier@dev.com\",\"password\":\"$2y$12$TV6cD0X.P0oAdkiie4DIuedFu\\/7BhaXKgidxHqz8rNxO0w8fLaaKS\"}}', NULL, '2025-11-18 10:22:21', '2025-11-18 10:22:21'),
(3, 'setting', 'created', 'App\\Models\\Setting', 'created', 1, 'App\\Models\\User', 1, '{\"attributes\":{\"name\":\"Nama Toko\",\"code\":\"NAME\",\"value\":\"KasPos\",\"is_active\":1}}', NULL, '2025-11-18 10:23:54', '2025-11-18 10:23:54');

-- --------------------------------------------------------

--
-- Table structure for table `bank_accounts`
--

CREATE TABLE `bank_accounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `bank_name` varchar(255) NOT NULL,
  `account_number` varchar(255) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('wioos_cache_spatie.permission.cache', 'a:3:{s:5:\"alias\";a:4:{s:1:\"a\";s:2:\"id\";s:1:\"b\";s:4:\"name\";s:1:\"c\";s:10:\"guard_name\";s:1:\"r\";s:5:\"roles\";}s:11:\"permissions\";a:112:{i:0;a:4:{s:1:\"a\";i:1;s:1:\"b\";s:10:\"users-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:1;a:4:{s:1:\"a\";i:2;s:1:\"b\";s:12:\"users-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:2;a:4:{s:1:\"a\";i:3;s:1:\"b\";s:12:\"users-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:3;a:4:{s:1:\"a\";i:4;s:1:\"b\";s:12:\"users-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:4;a:4:{s:1:\"a\";i:5;s:1:\"b\";s:10:\"users-show\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:5;a:4:{s:1:\"a\";i:6;s:1:\"b\";s:10:\"roles-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:2;}}i:6;a:4:{s:1:\"a\";i:7;s:1:\"b\";s:12:\"roles-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:2;}}i:7;a:4:{s:1:\"a\";i:8;s:1:\"b\";s:12:\"roles-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:2;}}i:8;a:4:{s:1:\"a\";i:9;s:1:\"b\";s:12:\"roles-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:2;}}i:9;a:4:{s:1:\"a\";i:10;s:1:\"b\";s:16:\"permissions-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:3;}}i:10;a:4:{s:1:\"a\";i:11;s:1:\"b\";s:18:\"permissions-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:3;}}i:11;a:4:{s:1:\"a\";i:12;s:1:\"b\";s:18:\"permissions-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:3;}}i:12;a:4:{s:1:\"a\";i:13;s:1:\"b\";s:18:\"permissions-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:3;}}i:13;a:4:{s:1:\"a\";i:14;s:1:\"b\";s:14:\"materials-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:5;}}i:14;a:4:{s:1:\"a\";i:15;s:1:\"b\";s:16:\"materials-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:5;}}i:15;a:4:{s:1:\"a\";i:16;s:1:\"b\";s:16:\"materials-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:5;}}i:16;a:4:{s:1:\"a\";i:17;s:1:\"b\";s:16:\"materials-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:5;}}i:17;a:4:{s:1:\"a\";i:18;s:1:\"b\";s:14:\"materials-show\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:5;}}i:18;a:4:{s:1:\"a\";i:19;s:1:\"b\";s:10:\"units-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:6;}}i:19;a:4:{s:1:\"a\";i:20;s:1:\"b\";s:12:\"units-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:6;}}i:20;a:4:{s:1:\"a\";i:21;s:1:\"b\";s:12:\"units-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:6;}}i:21;a:4:{s:1:\"a\";i:22;s:1:\"b\";s:12:\"units-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:6;}}i:22;a:4:{s:1:\"a\";i:23;s:1:\"b\";s:8:\"pos-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:7;}}i:23;a:4:{s:1:\"a\";i:24;s:1:\"b\";s:20:\"checking-stocks-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:9;}}i:24;a:4:{s:1:\"a\";i:25;s:1:\"b\";s:22:\"checking-stocks-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:9;}}i:25;a:4:{s:1:\"a\";i:26;s:1:\"b\";s:22:\"checking-stocks-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:9;}}i:26;a:4:{s:1:\"a\";i:27;s:1:\"b\";s:22:\"checking-stocks-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:9;}}i:27;a:4:{s:1:\"a\";i:28;s:1:\"b\";s:20:\"checking-stocks-show\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:9;}}i:28;a:4:{s:1:\"a\";i:29;s:1:\"b\";s:12:\"coupons-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:10;}}i:29;a:4:{s:1:\"a\";i:30;s:1:\"b\";s:14:\"coupons-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:10;}}i:30;a:4:{s:1:\"a\";i:31;s:1:\"b\";s:14:\"coupons-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:10;}}i:31;a:4:{s:1:\"a\";i:32;s:1:\"b\";s:14:\"coupons-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:10;}}i:32;a:4:{s:1:\"a\";i:33;s:1:\"b\";s:12:\"coupons-show\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:10;}}i:33;a:4:{s:1:\"a\";i:34;s:1:\"b\";s:14:\"customers-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:11;}}i:34;a:4:{s:1:\"a\";i:35;s:1:\"b\";s:16:\"customers-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:11;}}i:35;a:4:{s:1:\"a\";i:36;s:1:\"b\";s:16:\"customers-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:11;}}i:36;a:4:{s:1:\"a\";i:37;s:1:\"b\";s:16:\"customers-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:11;}}i:37;a:4:{s:1:\"a\";i:38;s:1:\"b\";s:14:\"customers-show\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:11;}}i:38;a:4:{s:1:\"a\";i:39;s:1:\"b\";s:22:\"discount-packages-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:12;}}i:39;a:4:{s:1:\"a\";i:40;s:1:\"b\";s:24:\"discount-packages-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:12;}}i:40;a:4:{s:1:\"a\";i:41;s:1:\"b\";s:24:\"discount-packages-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:12;}}i:41;a:4:{s:1:\"a\";i:42;s:1:\"b\";s:24:\"discount-packages-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:12;}}i:42;a:4:{s:1:\"a\";i:43;s:1:\"b\";s:22:\"discount-packages-show\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:12;}}i:43;a:4:{s:1:\"a\";i:44;s:1:\"b\";s:22:\"discount-products-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:13;}}i:44;a:4:{s:1:\"a\";i:45;s:1:\"b\";s:24:\"discount-products-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:13;}}i:45;a:4:{s:1:\"a\";i:46;s:1:\"b\";s:24:\"discount-products-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:13;}}i:46;a:4:{s:1:\"a\";i:47;s:1:\"b\";s:24:\"discount-products-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:13;}}i:47;a:4:{s:1:\"a\";i:48;s:1:\"b\";s:22:\"discount-products-show\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:13;}}i:48;a:4:{s:1:\"a\";i:49;s:1:\"b\";s:23:\"expense-categories-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:14;i:1;i:29;}}i:49;a:4:{s:1:\"a\";i:50;s:1:\"b\";s:25:\"expense-categories-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:14;i:1;i:29;}}i:50;a:4:{s:1:\"a\";i:51;s:1:\"b\";s:25:\"expense-categories-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:14;i:1;i:29;}}i:51;a:4:{s:1:\"a\";i:52;s:1:\"b\";s:25:\"expense-categories-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:14;i:1;i:29;}}i:52;a:4:{s:1:\"a\";i:53;s:1:\"b\";s:13:\"expenses-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:15;}}i:53;a:4:{s:1:\"a\";i:54;s:1:\"b\";s:15:\"expenses-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:15;}}i:54;a:4:{s:1:\"a\";i:55;s:1:\"b\";s:15:\"expenses-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:15;}}i:55;a:4:{s:1:\"a\";i:56;s:1:\"b\";s:15:\"expenses-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:15;}}i:56;a:4:{s:1:\"a\";i:57;s:1:\"b\";s:13:\"expenses-show\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:15;}}i:57;a:4:{s:1:\"a\";i:58;s:1:\"b\";s:26:\"expense-subcategories-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:16;i:1;i:29;}}i:58;a:4:{s:1:\"a\";i:59;s:1:\"b\";s:28:\"expense-subcategories-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:16;i:1;i:29;}}i:59;a:4:{s:1:\"a\";i:60;s:1:\"b\";s:28:\"expense-subcategories-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:16;i:1;i:29;}}i:60;a:4:{s:1:\"a\";i:61;s:1:\"b\";s:28:\"expense-subcategories-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:16;i:1;i:29;}}i:61;a:4:{s:1:\"a\";i:62;s:1:\"b\";s:10:\"menus-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:17;}}i:62;a:4:{s:1:\"a\";i:63;s:1:\"b\";s:12:\"menus-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:17;}}i:63;a:4:{s:1:\"a\";i:64;s:1:\"b\";s:12:\"menus-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:17;}}i:64;a:4:{s:1:\"a\";i:65;s:1:\"b\";s:12:\"menus-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:17;}}i:65;a:4:{s:1:\"a\";i:66;s:1:\"b\";s:11:\"orders-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:18;}}i:66;a:4:{s:1:\"a\";i:67;s:1:\"b\";s:13:\"orders-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:18;}}i:67;a:4:{s:1:\"a\";i:68;s:1:\"b\";s:13:\"orders-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:18;}}i:68;a:4:{s:1:\"a\";i:69;s:1:\"b\";s:13:\"orders-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:18;}}i:69;a:4:{s:1:\"a\";i:70;s:1:\"b\";s:13:\"products-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:19;}}i:70;a:4:{s:1:\"a\";i:71;s:1:\"b\";s:15:\"products-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:19;}}i:71;a:4:{s:1:\"a\";i:72;s:1:\"b\";s:15:\"products-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:19;}}i:72;a:4:{s:1:\"a\";i:73;s:1:\"b\";s:15:\"products-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:19;}}i:73;a:4:{s:1:\"a\";i:74;s:1:\"b\";s:13:\"products-show\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:19;}}i:74;a:4:{s:1:\"a\";i:75;s:1:\"b\";s:21:\"purchase-returns-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:20;}}i:75;a:4:{s:1:\"a\";i:76;s:1:\"b\";s:23:\"purchase-returns-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:20;}}i:76;a:4:{s:1:\"a\";i:77;s:1:\"b\";s:23:\"purchase-returns-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:20;}}i:77;a:4:{s:1:\"a\";i:78;s:1:\"b\";s:23:\"purchase-returns-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:20;}}i:78;a:4:{s:1:\"a\";i:79;s:1:\"b\";s:21:\"purchase-returns-show\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:20;}}i:79;a:4:{s:1:\"a\";i:80;s:1:\"b\";s:16:\"report-cash-flow\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:21;}}i:80;a:4:{s:1:\"a\";i:81;s:1:\"b\";s:15:\"report-purchase\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:21;}}i:81;a:4:{s:1:\"a\";i:82;s:1:\"b\";s:11:\"report-sale\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:21;}}i:82;a:4:{s:1:\"a\";i:83;s:1:\"b\";s:12:\"report-stock\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:21;}}i:83;a:4:{s:1:\"a\";i:84;s:1:\"b\";s:17:\"report-card-stock\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:21;}}i:84;a:4:{s:1:\"a\";i:85;s:1:\"b\";s:18:\"report-profit-loss\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:21;}}i:85;a:4:{s:1:\"a\";i:86;s:1:\"b\";s:14:\"suppliers-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:22;}}i:86;a:4:{s:1:\"a\";i:87;s:1:\"b\";s:16:\"suppliers-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:22;}}i:87;a:4:{s:1:\"a\";i:88;s:1:\"b\";s:16:\"suppliers-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:22;}}i:88;a:4:{s:1:\"a\";i:89;s:1:\"b\";s:16:\"suppliers-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:22;}}i:89;a:4:{s:1:\"a\";i:90;s:1:\"b\";s:14:\"suppliers-show\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:22;}}i:90;a:4:{s:1:\"a\";i:91;s:1:\"b\";s:25:\"transaction-kitchens-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:23;}}i:91;a:4:{s:1:\"a\";i:92;s:1:\"b\";s:27:\"transaction-kitchens-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:23;}}i:92;a:4:{s:1:\"a\";i:93;s:1:\"b\";s:24:\"transaction-returns-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:24;}}i:93;a:4:{s:1:\"a\";i:94;s:1:\"b\";s:26:\"transaction-returns-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:24;}}i:94;a:4:{s:1:\"a\";i:95;s:1:\"b\";s:26:\"transaction-returns-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:24;}}i:95;a:4:{s:1:\"a\";i:96;s:1:\"b\";s:26:\"transaction-returns-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:24;}}i:96;a:4:{s:1:\"a\";i:97;s:1:\"b\";s:24:\"transaction-returns-show\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:24;}}i:97;a:4:{s:1:\"a\";i:98;s:1:\"b\";s:17:\"transactions-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:25;}}i:98;a:4:{s:1:\"a\";i:99;s:1:\"b\";s:20:\"transactions-payment\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:25;}}i:99;a:4:{s:1:\"a\";i:100;s:1:\"b\";s:20:\"transactions-receipt\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:25;}}i:100;a:4:{s:1:\"a\";i:101;s:1:\"b\";s:20:\"transactions-invoice\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:25;}}i:101;a:4:{s:1:\"a\";i:102;s:1:\"b\";s:13:\"settings-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:26;}}i:102;a:4:{s:1:\"a\";i:103;s:1:\"b\";s:13:\"settings-bank\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:26;}}i:103;a:4:{s:1:\"a\";i:104;s:1:\"b\";s:15:\"settings-shifts\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:26;}}i:104;a:4:{s:1:\"a\";i:105;s:1:\"b\";s:16:\"settings-setting\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:26;}}i:105;a:4:{s:1:\"a\";i:106;s:1:\"b\";s:16:\"settings-loyalty\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:26;}}i:106;a:4:{s:1:\"a\";i:107;s:1:\"b\";s:14:\"dashboard-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:27;}}i:107;a:4:{s:1:\"a\";i:108;s:1:\"b\";s:11:\"tables-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:28;}}i:108;a:4:{s:1:\"a\";i:109;s:1:\"b\";s:13:\"tables-create\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:28;}}i:109;a:4:{s:1:\"a\";i:110;s:1:\"b\";s:13:\"tables-update\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:28;}}i:110;a:4:{s:1:\"a\";i:111;s:1:\"b\";s:13:\"tables-delete\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:28;}}i:111;a:4:{s:1:\"a\";i:112;s:1:\"b\";s:17:\"report-audit-logs\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:21;}}}s:5:\"roles\";a:27:{i:0;a:3:{s:1:\"a\";i:1;s:1:\"b\";s:12:\"users-access\";s:1:\"c\";s:3:\"web\";}i:1;a:3:{s:1:\"a\";i:2;s:1:\"b\";s:12:\"roles-access\";s:1:\"c\";s:3:\"web\";}i:2;a:3:{s:1:\"a\";i:3;s:1:\"b\";s:17:\"permission-access\";s:1:\"c\";s:3:\"web\";}i:3;a:3:{s:1:\"a\";i:5;s:1:\"b\";s:21:\"materials-full-access\";s:1:\"c\";s:3:\"web\";}i:4;a:3:{s:1:\"a\";i:6;s:1:\"b\";s:17:\"units-full-access\";s:1:\"c\";s:3:\"web\";}i:5;a:3:{s:1:\"a\";i:7;s:1:\"b\";s:7:\"cashier\";s:1:\"c\";s:3:\"web\";}i:6;a:3:{s:1:\"a\";i:9;s:1:\"b\";s:27:\"checking-stocks-full-access\";s:1:\"c\";s:3:\"web\";}i:7;a:3:{s:1:\"a\";i:10;s:1:\"b\";s:19:\"coupons-full-access\";s:1:\"c\";s:3:\"web\";}i:8;a:3:{s:1:\"a\";i:11;s:1:\"b\";s:21:\"customers-full-access\";s:1:\"c\";s:3:\"web\";}i:9;a:3:{s:1:\"a\";i:12;s:1:\"b\";s:29:\"discount-packages-full-access\";s:1:\"c\";s:3:\"web\";}i:10;a:3:{s:1:\"a\";i:13;s:1:\"b\";s:29:\"discount-products-full-access\";s:1:\"c\";s:3:\"web\";}i:11;a:3:{s:1:\"a\";i:14;s:1:\"b\";s:30:\"expense-categories-full-access\";s:1:\"c\";s:3:\"web\";}i:12;a:3:{s:1:\"a\";i:29;s:1:\"b\";s:22:\"categories-full-access\";s:1:\"c\";s:3:\"web\";}i:13;a:3:{s:1:\"a\";i:15;s:1:\"b\";s:20:\"expenses-full-access\";s:1:\"c\";s:3:\"web\";}i:14;a:3:{s:1:\"a\";i:16;s:1:\"b\";s:33:\"expense-subcategories-full-access\";s:1:\"c\";s:3:\"web\";}i:15;a:3:{s:1:\"a\";i:17;s:1:\"b\";s:17:\"menus-full-access\";s:1:\"c\";s:3:\"web\";}i:16;a:3:{s:1:\"a\";i:18;s:1:\"b\";s:18:\"orders-full-access\";s:1:\"c\";s:3:\"web\";}i:17;a:3:{s:1:\"a\";i:19;s:1:\"b\";s:20:\"products-full-access\";s:1:\"c\";s:3:\"web\";}i:18;a:3:{s:1:\"a\";i:20;s:1:\"b\";s:28:\"purchase-returns-full-access\";s:1:\"c\";s:3:\"web\";}i:19;a:3:{s:1:\"a\";i:21;s:1:\"b\";s:19:\"reports-full-access\";s:1:\"c\";s:3:\"web\";}i:20;a:3:{s:1:\"a\";i:22;s:1:\"b\";s:21:\"suppliers-full-access\";s:1:\"c\";s:3:\"web\";}i:21;a:3:{s:1:\"a\";i:23;s:1:\"b\";s:32:\"transaction-kitchens-full-access\";s:1:\"c\";s:3:\"web\";}i:22;a:3:{s:1:\"a\";i:24;s:1:\"b\";s:31:\"transaction-returns-full-access\";s:1:\"c\";s:3:\"web\";}i:23;a:3:{s:1:\"a\";i:25;s:1:\"b\";s:24:\"transactions-full-access\";s:1:\"c\";s:3:\"web\";}i:24;a:3:{s:1:\"a\";i:26;s:1:\"b\";s:20:\"settings-full-access\";s:1:\"c\";s:3:\"web\";}i:25;a:3:{s:1:\"a\";i:27;s:1:\"b\";s:21:\"dashboard-full-access\";s:1:\"c\";s:3:\"web\";}i:26;a:3:{s:1:\"a\";i:28;s:1:\"b\";s:18:\"tables-full-access\";s:1:\"c\";s:3:\"web\";}}}', 1763613026);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cashier_shifts`
--

CREATE TABLE `cashier_shifts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `shift_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `starting_cash` double NOT NULL DEFAULT 0,
  `ending_cash` double NOT NULL DEFAULT 0,
  `opened_at` datetime DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL,
  `status` enum('open','closed') NOT NULL DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `checking_stocks`
--

CREATE TABLE `checking_stocks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `no_ref` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `due_date` date NOT NULL,
  `type` enum('materials','products') NOT NULL,
  `status` enum('draft','done') NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `checking_stock_details`
--

CREATE TABLE `checking_stock_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `checking_stock_id` bigint(20) UNSIGNED NOT NULL,
  `items_type` varchar(255) NOT NULL,
  `items_id` bigint(20) UNSIGNED NOT NULL,
  `stock` double NOT NULL,
  `quantity` double NOT NULL,
  `price` double NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `type` enum('percentage','rupiah') NOT NULL,
  `value` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_points`
--

CREATE TABLE `customer_points` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transaction_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `point` double NOT NULL DEFAULT 0,
  `status` enum('expired','active','redeem') NOT NULL,
  `expired_date` date DEFAULT NULL,
  `change_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_point_settings`
--

CREATE TABLE `customer_point_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `spend_amount` double NOT NULL,
  `point_earned` int(11) NOT NULL,
  `expired_in_days` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discount_packages`
--

CREATE TABLE `discount_packages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `total_price` double NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discount_package_items`
--

CREATE TABLE `discount_package_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `discount_package_id` bigint(20) UNSIGNED NOT NULL,
  `items_type` varchar(255) NOT NULL,
  `items_id` bigint(20) UNSIGNED NOT NULL,
  `estimate_price` double NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discount_products`
--

CREATE TABLE `discount_products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `discount_name` varchar(255) NOT NULL,
  `discount_type` enum('nominal','percentage') NOT NULL,
  `discount_value` double NOT NULL,
  `discount_quantity` int(11) NOT NULL,
  `all_products` tinyint(1) NOT NULL DEFAULT 0,
  `all_customers` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discount_product_customers`
--

CREATE TABLE `discount_product_customers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `discount_product_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discount_product_items`
--

CREATE TABLE `discount_product_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `discount_product_id` bigint(20) UNSIGNED NOT NULL,
  `items_type` varchar(255) NOT NULL,
  `items_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `expensee_number` varchar(255) NOT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `expense_category_id` bigint(20) UNSIGNED NOT NULL,
  `expense_subcategory_id` bigint(20) UNSIGNED NOT NULL,
  `amount` double NOT NULL,
  `payment_status` enum('paid','unpaid','partial') NOT NULL DEFAULT 'unpaid',
  `description` text DEFAULT NULL,
  `file` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expense_categories`
--

CREATE TABLE `expense_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expense_payments`
--

CREATE TABLE `expense_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `expense_id` bigint(20) UNSIGNED NOT NULL,
  `bank_account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `paid_at` date NOT NULL,
  `amount` double NOT NULL,
  `payment_method` enum('cash','transfer') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expense_subcategories`
--

CREATE TABLE `expense_subcategories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `expense_category_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `unit_id` bigint(20) UNSIGNED NOT NULL,
  `minimum_qty` double NOT NULL,
  `price` double NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

CREATE TABLE `menus` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `capital_price` double DEFAULT NULL,
  `selling_price` double NOT NULL,
  `margin` double DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_04_07_004546_create_permission_tables', 1),
(5, '2025_04_09_074147_create_units_table', 1),
(6, '2025_04_10_002106_create_categories_table', 1),
(7, '2025_04_10_021710_create_tables_table', 1),
(8, '2025_04_14_022939_create_suppliers_table', 1),
(9, '2025_04_14_052939_create_materials_table', 1),
(10, '2025_04_17_002727_create_menus_table', 1),
(11, '2025_04_17_024538_create_receipes_table', 1),
(12, '2025_04_21_074228_create_products_table', 1),
(13, '2025_04_21_074411_create_product_variants_table', 1),
(14, '2025_04_24_071237_create_variant_options_table', 1),
(15, '2025_04_24_071254_create_variant_values_table', 1),
(16, '2025_04_24_071406_create_product_variant_values_table', 1),
(17, '2025_04_27_235544_create_stocks_table', 1),
(18, '2025_04_28_000207_create_stock_movements_table', 1),
(19, '2025_04_28_235325_add_has_stock_to_products_table', 1),
(20, '2025_05_03_024722_create_orders_table', 1),
(21, '2025_05_03_024728_create_order_details_table', 1),
(22, '2025_05_12_003731_add_capital_price_to_product_variants_table', 1),
(23, '2025_05_16_030901_add_payment_method_to_orders_table', 1),
(24, '2025_05_17_010344_create_bank_accounts_table', 1),
(25, '2025_05_17_053725_add_discount_to_orders_table', 1),
(26, '2025_05_17_055147_create_order_payments_table', 1),
(27, '2025_05_20_063834_add_notes_to_orders_table', 1),
(28, '2025_05_24_010031_create_purchase_returns_table', 1),
(29, '2025_05_24_010231_create_purchase_return_details_table', 1),
(30, '2025_06_02_053145_add_expired_at_to_purchase_return_details_table', 1),
(31, '2025_06_06_002916_create_checking_stocks_table', 1),
(32, '2025_06_06_002923_create_checking_stock_details_table', 1),
(33, '2025_06_11_003522_add_note_to_checking_stocks_table', 1),
(34, '2025_06_11_005710_create_expense_categories_table', 1),
(35, '2025_06_11_005719_create_expense_subcategories_table', 1),
(36, '2025_06_11_005729_create_expenses_table', 1),
(37, '2025_06_11_011417_create_expense_payments_table', 1),
(38, '2025_06_16_005807_add_file_to_expenses_table', 1),
(39, '2025_06_16_133525_add_created_by_to_expenses_table', 1),
(40, '2025_06_28_044012_create_shifts_table', 1),
(41, '2025_06_28_045511_create_customers_table', 1),
(42, '2025_07_05_060755_create_settings_table', 1),
(43, '2025_07_06_235828_create_coupons_table', 1),
(44, '2025_07_13_063202_create_customer_point_settings_table', 1),
(45, '2025_07_14_122244_create_discount_packages_table', 1),
(46, '2025_07_14_122341_create_discount_package_items_table', 1),
(47, '2025_07_18_022710_add_image_to_discount_packages_table', 1),
(48, '2025_07_20_094638_create_cashier_shifts_table', 1),
(49, '2025_07_20_103459_create_transactions_table', 1),
(50, '2025_07_20_103507_create_transaction_details_table', 1),
(51, '2025_07_25_080638_update_enum_transaction_type_on_transactions_table', 1),
(52, '2025_07_29_074629_add_transaction_date_to_transactions_table', 1),
(53, '2025_08_01_074431_add_bank_account_id_to_transactions_table', 1),
(54, '2025_08_03_022021_create_transaction_returns_table', 1),
(55, '2025_08_03_022027_create_transaction_return_details_table', 1),
(56, '2025_08_10_010351_create_discount_products_table', 1),
(57, '2025_08_10_010401_create_discount_product_items_table', 1),
(58, '2025_08_10_010627_create_discount_product_customers_table', 1),
(59, '2025_08_13_062827_create_customer_points_table', 1),
(60, '2025_08_15_132828_add_expired_date_to_customer_points_table', 1),
(61, '2025_08_19_005907_add_minimum_quantity_to_product_variants_table', 1),
(62, '2025_08_19_032903_create_transaction_payments_table', 1),
(63, '2025_09_08_142615_create_transaction_taxes_table', 1),
(64, '2025_09_11_193724_add_code_to_transaction_taxes_table', 1),
(65, '2025_09_12_081818_create_transaction_kitchens_table', 1),
(66, '2025_09_12_081829_create_transaction_kitchen_items_table', 1),
(67, '2025_09_29_083624_create_activity_log_table', 1),
(68, '2025_09_29_083625_add_event_column_to_activity_log_table', 1),
(69, '2025_09_29_083626_add_batch_uuid_column_to_activity_log_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(4, 'App\\Models\\User', 1),
(7, 'App\\Models\\User', 2);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_code` varchar(255) NOT NULL,
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `order_date` date NOT NULL,
  `type` enum('materials','products') NOT NULL,
  `subtotal` double NOT NULL,
  `discount` double DEFAULT NULL,
  `discount_type` enum('percentage','rupiah') DEFAULT NULL,
  `grand_total` double NOT NULL,
  `payment_method` enum('cash','transfer','credit') NOT NULL,
  `payment_status` enum('paid','unpaid','partial') NOT NULL DEFAULT 'unpaid',
  `order_status` enum('confirmed','received','pending') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_details`
--

CREATE TABLE `order_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `items_type` varchar(255) NOT NULL,
  `items_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` double NOT NULL,
  `price` double NOT NULL,
  `expired_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_payments`
--

CREATE TABLE `order_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `bank_account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `paid_at` date NOT NULL,
  `amount` double NOT NULL,
  `payment_method` enum('cash','transfer','retur') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'users-data', 'web', '2025-11-18 10:22:19', '2025-11-18 10:22:19'),
(2, 'users-create', 'web', '2025-11-18 10:22:19', '2025-11-18 10:22:19'),
(3, 'users-update', 'web', '2025-11-18 10:22:19', '2025-11-18 10:22:19'),
(4, 'users-delete', 'web', '2025-11-18 10:22:19', '2025-11-18 10:22:19'),
(5, 'users-show', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(6, 'roles-data', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(7, 'roles-create', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(8, 'roles-update', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(9, 'roles-delete', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(10, 'permissions-data', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(11, 'permissions-create', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(12, 'permissions-update', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(13, 'permissions-delete', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(14, 'materials-data', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(15, 'materials-create', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(16, 'materials-update', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(17, 'materials-delete', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(18, 'materials-show', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(19, 'units-data', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(20, 'units-create', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(21, 'units-update', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(22, 'units-delete', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(23, 'pos-data', 'web', '2025-11-18 10:22:21', '2025-11-18 10:22:21'),
(24, 'checking-stocks-data', 'web', '2025-11-18 10:22:22', '2025-11-18 10:22:22'),
(25, 'checking-stocks-create', 'web', '2025-11-18 10:22:22', '2025-11-18 10:22:22'),
(26, 'checking-stocks-update', 'web', '2025-11-18 10:22:22', '2025-11-18 10:22:22'),
(27, 'checking-stocks-delete', 'web', '2025-11-18 10:22:22', '2025-11-18 10:22:22'),
(28, 'checking-stocks-show', 'web', '2025-11-18 10:22:22', '2025-11-18 10:22:22'),
(29, 'coupons-data', 'web', '2025-11-18 10:22:22', '2025-11-18 10:22:22'),
(30, 'coupons-create', 'web', '2025-11-18 10:22:22', '2025-11-18 10:22:22'),
(31, 'coupons-update', 'web', '2025-11-18 10:22:22', '2025-11-18 10:22:22'),
(32, 'coupons-delete', 'web', '2025-11-18 10:22:22', '2025-11-18 10:22:22'),
(33, 'coupons-show', 'web', '2025-11-18 10:22:22', '2025-11-18 10:22:22'),
(34, 'customers-data', 'web', '2025-11-18 10:22:23', '2025-11-18 10:22:23'),
(35, 'customers-create', 'web', '2025-11-18 10:22:23', '2025-11-18 10:22:23'),
(36, 'customers-update', 'web', '2025-11-18 10:22:23', '2025-11-18 10:22:23'),
(37, 'customers-delete', 'web', '2025-11-18 10:22:23', '2025-11-18 10:22:23'),
(38, 'customers-show', 'web', '2025-11-18 10:22:23', '2025-11-18 10:22:23'),
(39, 'discount-packages-data', 'web', '2025-11-18 10:22:24', '2025-11-18 10:22:24'),
(40, 'discount-packages-create', 'web', '2025-11-18 10:22:24', '2025-11-18 10:22:24'),
(41, 'discount-packages-update', 'web', '2025-11-18 10:22:24', '2025-11-18 10:22:24'),
(42, 'discount-packages-delete', 'web', '2025-11-18 10:22:24', '2025-11-18 10:22:24'),
(43, 'discount-packages-show', 'web', '2025-11-18 10:22:24', '2025-11-18 10:22:24'),
(44, 'discount-products-data', 'web', '2025-11-18 10:22:24', '2025-11-18 10:22:24'),
(45, 'discount-products-create', 'web', '2025-11-18 10:22:24', '2025-11-18 10:22:24'),
(46, 'discount-products-update', 'web', '2025-11-18 10:22:24', '2025-11-18 10:22:24'),
(47, 'discount-products-delete', 'web', '2025-11-18 10:22:24', '2025-11-18 10:22:24'),
(48, 'discount-products-show', 'web', '2025-11-18 10:22:24', '2025-11-18 10:22:24'),
(49, 'expense-categories-data', 'web', '2025-11-18 10:22:25', '2025-11-18 10:22:25'),
(50, 'expense-categories-create', 'web', '2025-11-18 10:22:25', '2025-11-18 10:22:25'),
(51, 'expense-categories-update', 'web', '2025-11-18 10:22:25', '2025-11-18 10:22:25'),
(52, 'expense-categories-delete', 'web', '2025-11-18 10:22:25', '2025-11-18 10:22:25'),
(53, 'expenses-data', 'web', '2025-11-18 10:22:25', '2025-11-18 10:22:25'),
(54, 'expenses-create', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(55, 'expenses-update', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(56, 'expenses-delete', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(57, 'expenses-show', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(58, 'expense-subcategories-data', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(59, 'expense-subcategories-create', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(60, 'expense-subcategories-update', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(61, 'expense-subcategories-delete', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(62, 'menus-data', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(63, 'menus-create', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(64, 'menus-update', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(65, 'menus-delete', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(66, 'orders-data', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(67, 'orders-create', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(68, 'orders-update', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(69, 'orders-delete', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(70, 'products-data', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(71, 'products-create', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(72, 'products-update', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(73, 'products-delete', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(74, 'products-show', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(75, 'purchase-returns-data', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(76, 'purchase-returns-create', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(77, 'purchase-returns-update', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(78, 'purchase-returns-delete', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(79, 'purchase-returns-show', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(80, 'report-cash-flow', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(81, 'report-purchase', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(82, 'report-sale', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(83, 'report-stock', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(84, 'report-card-stock', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(85, 'report-profit-loss', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(86, 'suppliers-data', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(87, 'suppliers-create', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(88, 'suppliers-update', 'web', '2025-11-18 10:22:28', '2025-11-18 10:22:28'),
(89, 'suppliers-delete', 'web', '2025-11-18 10:22:28', '2025-11-18 10:22:28'),
(90, 'suppliers-show', 'web', '2025-11-18 10:22:28', '2025-11-18 10:22:28'),
(91, 'transaction-kitchens-data', 'web', '2025-11-18 10:22:28', '2025-11-18 10:22:28'),
(92, 'transaction-kitchens-update', 'web', '2025-11-18 10:22:28', '2025-11-18 10:22:28'),
(93, 'transaction-returns-data', 'web', '2025-11-18 10:22:28', '2025-11-18 10:22:28'),
(94, 'transaction-returns-create', 'web', '2025-11-18 10:22:28', '2025-11-18 10:22:28'),
(95, 'transaction-returns-update', 'web', '2025-11-18 10:22:28', '2025-11-18 10:22:28'),
(96, 'transaction-returns-delete', 'web', '2025-11-18 10:22:28', '2025-11-18 10:22:28'),
(97, 'transaction-returns-show', 'web', '2025-11-18 10:22:28', '2025-11-18 10:22:28'),
(98, 'transactions-data', 'web', '2025-11-18 10:22:28', '2025-11-18 10:22:28'),
(99, 'transactions-payment', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(100, 'transactions-receipt', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(101, 'transactions-invoice', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(102, 'settings-data', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(103, 'settings-bank', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(104, 'settings-shifts', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(105, 'settings-setting', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(106, 'settings-loyalty', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(107, 'dashboard-data', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(108, 'tables-data', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(109, 'tables-create', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(110, 'tables-update', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(111, 'tables-delete', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(112, 'report-audit-logs', 'web', '2025-11-18 10:22:30', '2025-11-18 10:22:30');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sku` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `has_variant` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `has_stock` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `barcode` varchar(255) NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `unit_id` bigint(20) UNSIGNED NOT NULL,
  `price` double NOT NULL,
  `capital_price` double NOT NULL,
  `minimum_quantity` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_variant_values`
--

CREATE TABLE `product_variant_values` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` bigint(20) UNSIGNED NOT NULL,
  `variant_value_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_returns`
--

CREATE TABLE `purchase_returns` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `return_code` varchar(255) NOT NULL,
  `return_date` date NOT NULL,
  `grand_total` text DEFAULT NULL,
  `refund_method` enum('refund','replacement','debt_reduction') NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','confirmed') NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_return_details`
--

CREATE TABLE `purchase_return_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_return_id` bigint(20) UNSIGNED NOT NULL,
  `order_detail_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` double NOT NULL,
  `reason` text DEFAULT NULL,
  `expired_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `receipes`
--

CREATE TABLE `receipes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `menu_id` bigint(20) UNSIGNED NOT NULL,
  `material_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` double NOT NULL,
  `price` double NOT NULL,
  `total_price` double NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'users-access', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(2, 'roles-access', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(3, 'permission-access', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(4, 'super-admin', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(5, 'materials-full-access', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(6, 'units-full-access', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(7, 'cashier', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(8, 'waiter', 'web', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(9, 'checking-stocks-full-access', 'web', '2025-11-18 10:22:22', '2025-11-18 10:22:22'),
(10, 'coupons-full-access', 'web', '2025-11-18 10:22:22', '2025-11-18 10:22:22'),
(11, 'customers-full-access', 'web', '2025-11-18 10:22:23', '2025-11-18 10:22:23'),
(12, 'discount-packages-full-access', 'web', '2025-11-18 10:22:24', '2025-11-18 10:22:24'),
(13, 'discount-products-full-access', 'web', '2025-11-18 10:22:24', '2025-11-18 10:22:24'),
(14, 'expense-categories-full-access', 'web', '2025-11-18 10:22:25', '2025-11-18 10:22:25'),
(15, 'expenses-full-access', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(16, 'expense-subcategories-full-access', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(17, 'menus-full-access', 'web', '2025-11-18 10:22:26', '2025-11-18 10:22:26'),
(18, 'orders-full-access', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(19, 'products-full-access', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(20, 'purchase-returns-full-access', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(21, 'reports-full-access', 'web', '2025-11-18 10:22:27', '2025-11-18 10:22:27'),
(22, 'suppliers-full-access', 'web', '2025-11-18 10:22:28', '2025-11-18 10:22:28'),
(23, 'transaction-kitchens-full-access', 'web', '2025-11-18 10:22:28', '2025-11-18 10:22:28'),
(24, 'transaction-returns-full-access', 'web', '2025-11-18 10:22:28', '2025-11-18 10:22:28'),
(25, 'transactions-full-access', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(26, 'settings-full-access', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(27, 'dashboard-full-access', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(28, 'tables-full-access', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29'),
(29, 'categories-full-access', 'web', '2025-11-18 10:22:29', '2025-11-18 10:22:29');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 2),
(7, 2),
(8, 2),
(9, 2),
(10, 3),
(11, 3),
(12, 3),
(13, 3),
(14, 5),
(15, 5),
(16, 5),
(17, 5),
(18, 5),
(19, 6),
(20, 6),
(21, 6),
(22, 6),
(23, 7),
(24, 9),
(25, 9),
(26, 9),
(27, 9),
(28, 9),
(29, 10),
(30, 10),
(31, 10),
(32, 10),
(33, 10),
(34, 11),
(35, 11),
(36, 11),
(37, 11),
(38, 11),
(39, 12),
(40, 12),
(41, 12),
(42, 12),
(43, 12),
(44, 13),
(45, 13),
(46, 13),
(47, 13),
(48, 13),
(49, 14),
(49, 29),
(50, 14),
(50, 29),
(51, 14),
(51, 29),
(52, 14),
(52, 29),
(53, 15),
(54, 15),
(55, 15),
(56, 15),
(57, 15),
(58, 16),
(58, 29),
(59, 16),
(59, 29),
(60, 16),
(60, 29),
(61, 16),
(61, 29),
(62, 17),
(63, 17),
(64, 17),
(65, 17),
(66, 18),
(67, 18),
(68, 18),
(69, 18),
(70, 19),
(71, 19),
(72, 19),
(73, 19),
(74, 19),
(75, 20),
(76, 20),
(77, 20),
(78, 20),
(79, 20),
(80, 21),
(81, 21),
(82, 21),
(83, 21),
(84, 21),
(85, 21),
(86, 22),
(87, 22),
(88, 22),
(89, 22),
(90, 22),
(91, 23),
(92, 23),
(93, 24),
(94, 24),
(95, 24),
(96, 24),
(97, 24),
(98, 25),
(99, 25),
(100, 25),
(101, 25),
(102, 26),
(103, 26),
(104, 26),
(105, 26),
(106, 26),
(107, 27),
(108, 28),
(109, 28),
(110, 28),
(111, 28),
(112, 21);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('dIwP5Yloia8Uoar5MdxjjR2dWYZAAmiAxf1dztSL', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoienJsMUFoS0hldFY5ODB1TWMzZHNyaTNieFRPMGNwQjBPUGhmSHM0NyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1763457839),
('EKhyoGMUhuzupoQ6uYUVfO8SRE8mzt51bjzEOcnW', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiY0xxWHNSN0ZiY3BVQ2xyM2VSMXNGZ0xWcEFCdXVwdnVMa0tnN2JPQSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1763526699);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `name`, `code`, `value`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Nama Toko', 'NAME', 'KasPos', 1, '2025-11-18 10:23:54', '2025-11-18 10:23:54');

-- --------------------------------------------------------

--
-- Table structure for table `shifts`
--

CREATE TABLE `shifts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stocks`
--

CREATE TABLE `stocks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `stockable_type` varchar(255) NOT NULL,
  `stockable_id` bigint(20) UNSIGNED NOT NULL,
  `batch_code` varchar(255) NOT NULL,
  `quantity` double NOT NULL,
  `expired_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `stock_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('in','out') NOT NULL,
  `quantity` double NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tables`
--

CREATE TABLE `tables` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `number` varchar(255) NOT NULL,
  `capacity` int(11) NOT NULL,
  `status` enum('available','occupied','reserved') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice` varchar(255) NOT NULL,
  `cashier_shift_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `waiter_id` bigint(20) UNSIGNED DEFAULT NULL,
  `transaction_type` enum('dine_in','takeaway','platform') NOT NULL,
  `table_id` bigint(20) UNSIGNED DEFAULT NULL,
  `platform` varchar(255) DEFAULT NULL,
  `coupon_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('unpaid','pending','paid','partial') NOT NULL DEFAULT 'pending',
  `notes_noref` varchar(255) DEFAULT NULL,
  `notes_transaction_source` varchar(255) DEFAULT NULL,
  `notes_note` varchar(255) DEFAULT NULL,
  `shipping_name` varchar(255) DEFAULT NULL,
  `shipping_ref` varchar(255) DEFAULT NULL,
  `shipping_address` varchar(255) DEFAULT NULL,
  `shipping_note` varchar(255) DEFAULT NULL,
  `shipping_status` enum('pending','shipped','delivered','cancelled') DEFAULT 'pending',
  `payment_method` enum('cash','transfer') DEFAULT 'cash',
  `bank_account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subtotal` double NOT NULL DEFAULT 0,
  `discount` double NOT NULL DEFAULT 0,
  `pay` double NOT NULL DEFAULT 0,
  `change` double NOT NULL DEFAULT 0,
  `grand_total` double NOT NULL DEFAULT 0,
  `transaction_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_details`
--

CREATE TABLE `transaction_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transaction_id` bigint(20) UNSIGNED NOT NULL,
  `items_type` varchar(255) NOT NULL,
  `items_id` bigint(20) UNSIGNED NOT NULL,
  `price` double NOT NULL,
  `quantity` double NOT NULL,
  `discount_type` enum('percentage','rupiah') DEFAULT NULL,
  `discount` double DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_kitchens`
--

CREATE TABLE `transaction_kitchens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transaction_id` bigint(20) UNSIGNED NOT NULL,
  `transaction_date` datetime NOT NULL,
  `status` enum('pending','onprogress','success') NOT NULL,
  `transaction_finish` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_kitchen_items`
--

CREATE TABLE `transaction_kitchen_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transaction_kitchen_id` bigint(20) UNSIGNED NOT NULL,
  `transaction_detail_id` bigint(20) UNSIGNED NOT NULL,
  `is_done` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_payments`
--

CREATE TABLE `transaction_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transaction_id` bigint(20) UNSIGNED NOT NULL,
  `bank_account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `paid_at` date NOT NULL,
  `amount` double NOT NULL,
  `payment_method` enum('cash','transfer') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_returns`
--

CREATE TABLE `transaction_returns` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transaction_id` bigint(20) UNSIGNED NOT NULL,
  `return_code` varchar(255) NOT NULL,
  `return_date` date NOT NULL,
  `grand_total` text DEFAULT NULL,
  `refund_method` enum('refund','replacement') NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','confirmed') NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_return_details`
--

CREATE TABLE `transaction_return_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transaction_return_id` bigint(20) UNSIGNED NOT NULL,
  `transaction_detail_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` double NOT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_taxes`
--

CREATE TABLE `transaction_taxes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `transaction_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'pcs', 'Pieces / buah', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(2, 'kg', 'Kilogram', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(3, 'g', 'Gram', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(4, 'liter', 'Liter', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(5, 'ml', 'Milliliter', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(6, 'bungkus', 'Bungkus / pack', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(7, 'botol', 'Botol', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(8, 'kaleng', 'Kaleng', '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(9, 'pak', 'Pack', '2025-11-18 10:22:20', '2025-11-18 10:22:20');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Superadmin', 'superadmin', 'superadmin@gmail.com', NULL, '$2y$12$nz2jTjr9TOZoFC9ENKZITuEVRr77aR9mwgQZGLYKODrk8v0e5f.Iq', NULL, '2025-11-18 10:22:20', '2025-11-18 10:22:20'),
(2, 'Cashier-dev', 'cashier-dev', 'cashier@dev.com', NULL, '$2y$12$TV6cD0X.P0oAdkiie4DIuedFu/7BhaXKgidxHqz8rNxO0w8fLaaKS', NULL, '2025-11-18 10:22:21', '2025-11-18 10:22:21');

-- --------------------------------------------------------

--
-- Table structure for table `variant_options`
--

CREATE TABLE `variant_options` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `variant_values`
--

CREATE TABLE `variant_values` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `variant_option_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject` (`subject_type`,`subject_id`),
  ADD KEY `causer` (`causer_type`,`causer_id`),
  ADD KEY `activity_log_log_name_index` (`log_name`);

--
-- Indexes for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cashier_shifts`
--
ALTER TABLE `cashier_shifts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cashier_shifts_shift_id_foreign` (`shift_id`),
  ADD KEY `cashier_shifts_user_id_foreign` (`user_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `checking_stocks`
--
ALTER TABLE `checking_stocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `checking_stocks_user_id_foreign` (`user_id`);

--
-- Indexes for table `checking_stock_details`
--
ALTER TABLE `checking_stock_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `checking_stock_details_checking_stock_id_foreign` (`checking_stock_id`),
  ADD KEY `checking_stock_details_items_type_items_id_index` (`items_type`,`items_id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer_points`
--
ALTER TABLE `customer_points`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_points_transaction_id_foreign` (`transaction_id`),
  ADD KEY `customer_points_customer_id_foreign` (`customer_id`);

--
-- Indexes for table `customer_point_settings`
--
ALTER TABLE `customer_point_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `discount_packages`
--
ALTER TABLE `discount_packages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `discount_package_items`
--
ALTER TABLE `discount_package_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `discount_package_items_discount_package_id_foreign` (`discount_package_id`),
  ADD KEY `discount_package_items_items_type_items_id_index` (`items_type`,`items_id`);

--
-- Indexes for table `discount_products`
--
ALTER TABLE `discount_products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `discount_product_customers`
--
ALTER TABLE `discount_product_customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `discount_product_customers_discount_product_id_foreign` (`discount_product_id`),
  ADD KEY `discount_product_customers_customer_id_foreign` (`customer_id`);

--
-- Indexes for table `discount_product_items`
--
ALTER TABLE `discount_product_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `discount_product_items_discount_product_id_foreign` (`discount_product_id`),
  ADD KEY `discount_product_items_items_type_items_id_index` (`items_type`,`items_id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expenses_expense_category_id_foreign` (`expense_category_id`),
  ADD KEY `expenses_expense_subcategory_id_foreign` (`expense_subcategory_id`),
  ADD KEY `expenses_created_by_foreign` (`created_by`);

--
-- Indexes for table `expense_categories`
--
ALTER TABLE `expense_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expense_payments`
--
ALTER TABLE `expense_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expense_payments_expense_id_foreign` (`expense_id`),
  ADD KEY `expense_payments_bank_account_id_foreign` (`bank_account_id`);

--
-- Indexes for table `expense_subcategories`
--
ALTER TABLE `expense_subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expense_subcategories_expense_category_id_foreign` (`expense_category_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `materials_unit_id_foreign` (`unit_id`);

--
-- Indexes for table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `menus_category_id_foreign` (`category_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_supplier_id_foreign` (`supplier_id`),
  ADD KEY `orders_created_by_foreign` (`created_by`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_details_order_id_foreign` (`order_id`),
  ADD KEY `order_details_items_type_items_id_index` (`items_type`,`items_id`);

--
-- Indexes for table `order_payments`
--
ALTER TABLE `order_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_payments_order_id_foreign` (`order_id`),
  ADD KEY `order_payments_bank_account_id_foreign` (`bank_account_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_category_id_foreign` (`category_id`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_variants_product_id_foreign` (`product_id`),
  ADD KEY `product_variants_unit_id_foreign` (`unit_id`);

--
-- Indexes for table `product_variant_values`
--
ALTER TABLE `product_variant_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_variant_values_product_variant_id_foreign` (`product_variant_id`),
  ADD KEY `product_variant_values_variant_value_id_foreign` (`variant_value_id`);

--
-- Indexes for table `purchase_returns`
--
ALTER TABLE `purchase_returns`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_returns_return_code_unique` (`return_code`),
  ADD KEY `purchase_returns_order_id_foreign` (`order_id`),
  ADD KEY `purchase_returns_created_by_foreign` (`created_by`);

--
-- Indexes for table `purchase_return_details`
--
ALTER TABLE `purchase_return_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_return_details_purchase_return_id_foreign` (`purchase_return_id`),
  ADD KEY `purchase_return_details_order_detail_id_foreign` (`order_detail_id`);

--
-- Indexes for table `receipes`
--
ALTER TABLE `receipes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `receipes_menu_id_foreign` (`menu_id`),
  ADD KEY `receipes_material_id_foreign` (`material_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `shifts`
--
ALTER TABLE `shifts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stocks_stockable_type_stockable_id_index` (`stockable_type`,`stockable_id`),
  ADD KEY `stocks_batch_code_index` (`batch_code`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_movements_stock_id_foreign` (`stock_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tables`
--
ALTER TABLE `tables`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tables_number_unique` (`number`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transactions_cashier_shift_id_foreign` (`cashier_shift_id`),
  ADD KEY `transactions_customer_id_foreign` (`customer_id`),
  ADD KEY `transactions_waiter_id_foreign` (`waiter_id`),
  ADD KEY `transactions_table_id_foreign` (`table_id`),
  ADD KEY `transactions_coupon_id_foreign` (`coupon_id`),
  ADD KEY `transactions_bank_account_id_foreign` (`bank_account_id`);

--
-- Indexes for table `transaction_details`
--
ALTER TABLE `transaction_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_details_items_type_items_id_index` (`items_type`,`items_id`);

--
-- Indexes for table `transaction_kitchens`
--
ALTER TABLE `transaction_kitchens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_kitchens_transaction_id_foreign` (`transaction_id`);

--
-- Indexes for table `transaction_kitchen_items`
--
ALTER TABLE `transaction_kitchen_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_kitchen_items_transaction_kitchen_id_foreign` (`transaction_kitchen_id`),
  ADD KEY `transaction_kitchen_items_transaction_detail_id_foreign` (`transaction_detail_id`);

--
-- Indexes for table `transaction_payments`
--
ALTER TABLE `transaction_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_payments_transaction_id_foreign` (`transaction_id`),
  ADD KEY `transaction_payments_bank_account_id_foreign` (`bank_account_id`);

--
-- Indexes for table `transaction_returns`
--
ALTER TABLE `transaction_returns`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_returns_return_code_unique` (`return_code`),
  ADD KEY `transaction_returns_transaction_id_foreign` (`transaction_id`),
  ADD KEY `transaction_returns_created_by_foreign` (`created_by`);

--
-- Indexes for table `transaction_return_details`
--
ALTER TABLE `transaction_return_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_return_details_transaction_return_id_foreign` (`transaction_return_id`),
  ADD KEY `transaction_return_details_transaction_detail_id_foreign` (`transaction_detail_id`);

--
-- Indexes for table `transaction_taxes`
--
ALTER TABLE `transaction_taxes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `variant_options`
--
ALTER TABLE `variant_options`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `variant_values`
--
ALTER TABLE `variant_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `variant_values_variant_option_id_foreign` (`variant_option_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cashier_shifts`
--
ALTER TABLE `cashier_shifts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `checking_stocks`
--
ALTER TABLE `checking_stocks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `checking_stock_details`
--
ALTER TABLE `checking_stock_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customer_points`
--
ALTER TABLE `customer_points`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customer_point_settings`
--
ALTER TABLE `customer_point_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discount_packages`
--
ALTER TABLE `discount_packages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discount_package_items`
--
ALTER TABLE `discount_package_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discount_products`
--
ALTER TABLE `discount_products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discount_product_customers`
--
ALTER TABLE `discount_product_customers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discount_product_items`
--
ALTER TABLE `discount_product_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense_categories`
--
ALTER TABLE `expense_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense_payments`
--
ALTER TABLE `expense_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense_subcategories`
--
ALTER TABLE `expense_subcategories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menus`
--
ALTER TABLE `menus`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_details`
--
ALTER TABLE `order_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_payments`
--
ALTER TABLE `order_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_variant_values`
--
ALTER TABLE `product_variant_values`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_returns`
--
ALTER TABLE `purchase_returns`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_return_details`
--
ALTER TABLE `purchase_return_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `receipes`
--
ALTER TABLE `receipes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `shifts`
--
ALTER TABLE `shifts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stocks`
--
ALTER TABLE `stocks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tables`
--
ALTER TABLE `tables`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction_details`
--
ALTER TABLE `transaction_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction_kitchens`
--
ALTER TABLE `transaction_kitchens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction_kitchen_items`
--
ALTER TABLE `transaction_kitchen_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction_payments`
--
ALTER TABLE `transaction_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction_returns`
--
ALTER TABLE `transaction_returns`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction_return_details`
--
ALTER TABLE `transaction_return_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction_taxes`
--
ALTER TABLE `transaction_taxes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `variant_options`
--
ALTER TABLE `variant_options`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `variant_values`
--
ALTER TABLE `variant_values`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cashier_shifts`
--
ALTER TABLE `cashier_shifts`
  ADD CONSTRAINT `cashier_shifts_shift_id_foreign` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cashier_shifts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `checking_stocks`
--
ALTER TABLE `checking_stocks`
  ADD CONSTRAINT `checking_stocks_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `checking_stock_details`
--
ALTER TABLE `checking_stock_details`
  ADD CONSTRAINT `checking_stock_details_checking_stock_id_foreign` FOREIGN KEY (`checking_stock_id`) REFERENCES `checking_stocks` (`id`);

--
-- Constraints for table `customer_points`
--
ALTER TABLE `customer_points`
  ADD CONSTRAINT `customer_points_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `customer_points_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `discount_package_items`
--
ALTER TABLE `discount_package_items`
  ADD CONSTRAINT `discount_package_items_discount_package_id_foreign` FOREIGN KEY (`discount_package_id`) REFERENCES `discount_packages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `discount_product_customers`
--
ALTER TABLE `discount_product_customers`
  ADD CONSTRAINT `discount_product_customers_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `discount_product_customers_discount_product_id_foreign` FOREIGN KEY (`discount_product_id`) REFERENCES `discount_products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `discount_product_items`
--
ALTER TABLE `discount_product_items`
  ADD CONSTRAINT `discount_product_items_discount_product_id_foreign` FOREIGN KEY (`discount_product_id`) REFERENCES `discount_products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `expenses_expense_category_id_foreign` FOREIGN KEY (`expense_category_id`) REFERENCES `expense_categories` (`id`),
  ADD CONSTRAINT `expenses_expense_subcategory_id_foreign` FOREIGN KEY (`expense_subcategory_id`) REFERENCES `expense_subcategories` (`id`);

--
-- Constraints for table `expense_payments`
--
ALTER TABLE `expense_payments`
  ADD CONSTRAINT `expense_payments_bank_account_id_foreign` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expense_payments_expense_id_foreign` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `expense_subcategories`
--
ALTER TABLE `expense_subcategories`
  ADD CONSTRAINT `expense_subcategories_expense_category_id_foreign` FOREIGN KEY (`expense_category_id`) REFERENCES `expense_categories` (`id`);

--
-- Constraints for table `materials`
--
ALTER TABLE `materials`
  ADD CONSTRAINT `materials_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `menus`
--
ALTER TABLE `menus`
  ADD CONSTRAINT `menus_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order_details`
--
ALTER TABLE `order_details`
  ADD CONSTRAINT `order_details_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order_payments`
--
ALTER TABLE `order_payments`
  ADD CONSTRAINT `order_payments_bank_account_id_foreign` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_payments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_variants_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variant_values`
--
ALTER TABLE `product_variant_values`
  ADD CONSTRAINT `product_variant_values_product_variant_id_foreign` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_variant_values_variant_value_id_foreign` FOREIGN KEY (`variant_value_id`) REFERENCES `variant_values` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `purchase_returns`
--
ALTER TABLE `purchase_returns`
  ADD CONSTRAINT `purchase_returns_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `purchase_returns_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Constraints for table `purchase_return_details`
--
ALTER TABLE `purchase_return_details`
  ADD CONSTRAINT `purchase_return_details_order_detail_id_foreign` FOREIGN KEY (`order_detail_id`) REFERENCES `order_details` (`id`),
  ADD CONSTRAINT `purchase_return_details_purchase_return_id_foreign` FOREIGN KEY (`purchase_return_id`) REFERENCES `purchase_returns` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `receipes`
--
ALTER TABLE `receipes`
  ADD CONSTRAINT `receipes_material_id_foreign` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `receipes_menu_id_foreign` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_stock_id_foreign` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_bank_account_id_foreign` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_cashier_shift_id_foreign` FOREIGN KEY (`cashier_shift_id`) REFERENCES `cashier_shifts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_coupon_id_foreign` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_table_id_foreign` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transactions_waiter_id_foreign` FOREIGN KEY (`waiter_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `transaction_kitchens`
--
ALTER TABLE `transaction_kitchens`
  ADD CONSTRAINT `transaction_kitchens_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transaction_kitchen_items`
--
ALTER TABLE `transaction_kitchen_items`
  ADD CONSTRAINT `transaction_kitchen_items_transaction_detail_id_foreign` FOREIGN KEY (`transaction_detail_id`) REFERENCES `transaction_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transaction_kitchen_items_transaction_kitchen_id_foreign` FOREIGN KEY (`transaction_kitchen_id`) REFERENCES `transaction_kitchens` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transaction_payments`
--
ALTER TABLE `transaction_payments`
  ADD CONSTRAINT `transaction_payments_bank_account_id_foreign` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaction_payments_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transaction_returns`
--
ALTER TABLE `transaction_returns`
  ADD CONSTRAINT `transaction_returns_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `transaction_returns_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`);

--
-- Constraints for table `transaction_return_details`
--
ALTER TABLE `transaction_return_details`
  ADD CONSTRAINT `transaction_return_details_transaction_detail_id_foreign` FOREIGN KEY (`transaction_detail_id`) REFERENCES `transaction_details` (`id`),
  ADD CONSTRAINT `transaction_return_details_transaction_return_id_foreign` FOREIGN KEY (`transaction_return_id`) REFERENCES `transaction_returns` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `variant_values`
--
ALTER TABLE `variant_values`
  ADD CONSTRAINT `variant_values_variant_option_id_foreign` FOREIGN KEY (`variant_option_id`) REFERENCES `variant_options` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
