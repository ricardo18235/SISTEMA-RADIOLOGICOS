-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 28-01-2026 a las 07:02:08
-- Versión del servidor: 8.3.0
-- Versión de PHP: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `radiologia_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `study_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `study_id` (`study_id`),
  KEY `idx_user_read` (`user_id`,`is_read`),
  KEY `idx_created` (`created_at`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `patients`
--

DROP TABLE IF EXISTS `patients`;
CREATE TABLE IF NOT EXISTS `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `dni` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `doctor_id` (`doctor_id`,`dni`)
) ENGINE=MyISAM AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `patients`
--

INSERT INTO `patients` (`id`, `doctor_id`, `dni`, `name`, `email`, `phone`, `created_at`) VALUES
(20, 7, '1122', 'paciente 1', 'paciente1@gmail.com', '1111', '2026-01-28 02:00:22'),
(21, 6, '1122', 'paciente 1', 'paciente1@gmail.com', '1111', '2026-01-28 03:29:01'),
(22, 10, '4411', 'paciente 4 ', 'paciente4@gmail.com', '64511', '2026-01-28 03:49:34'),
(23, 10, '5511', 'paciente 5', 'paciente5@gmail.com', '58897', '2026-01-28 03:59:34'),
(24, 6, '6611', 'paciente 6 ', 'paciente6@gmail.com', '6874', '2026-01-28 04:01:04'),
(25, 7, '7711', 'paciente 7', 'paciente7@gmail.com', '684', '2026-01-28 05:26:02'),
(26, 7, '8811', 'paciente 8', 'paciente8@gmail.com', '546', '2026-01-28 06:13:39'),
(27, 7, '1010', 'paciente 10', 'paceinte10@gmail.com', '846884', '2026-01-28 06:22:06'),
(28, 7, '1111', 'paciente 11', 'paciente11@gmail.com', '864684', '2026-01-28 06:29:42'),
(29, 7, '1212', 'paciente 12 ', 'paciente12@yahoo.com', '8784681', '2026-01-28 06:34:06'),
(30, 7, '1313', 'paciente 13', 'paciente13@gmail.com', '68468', '2026-01-28 06:54:19'),
(31, 7, '1414 ', 'paciente 14', 'paciente14@gmail.com', '8674684', '2026-01-28 06:58:37'),
(32, 7, '1515', 'paciente 15', 'paciente15@gmail.com', '86468', '2026-01-28 06:59:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `studies`
--

DROP TABLE IF EXISTS `studies`;
CREATE TABLE IF NOT EXISTS `studies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `study_name` varchar(150) NOT NULL,
  `file_url` text NOT NULL,
  `file_type` enum('dicom','stl','image','pdf') NOT NULL,
  `study_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `file_size` bigint DEFAULT '0',
  `viewed_by_doctor` tinyint(1) DEFAULT '0',
  `viewed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`)
) ENGINE=MyISAM AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `studies`
--

INSERT INTO `studies` (`id`, `patient_id`, `doctor_id`, `study_name`, `file_url`, `file_type`, `study_date`, `created_at`, `file_size`, `viewed_by_doctor`, `viewed_at`) VALUES
(25, 24, 6, 'Radiografía - Postero Anterior', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2026/estudios/697989f7de982.jpg', 'image', '2026-01-28', '2026-01-28 04:01:04', 68946, 0, NULL),
(24, 23, 10, 'Radiografía - Coronales', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2026/estudios/697989a591c84.jpg', 'image', '2026-01-28', '2026-01-28 03:59:34', 36662, 0, NULL),
(23, 22, 10, 'Radiografía - Periapical', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2026/estudios/6979874cb8722.png', 'image', '2026-01-28', '2026-01-28 03:49:34', 1689255, 0, NULL),
(22, 21, 6, 'Radiografía - Perfil', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2026/estudios/6979827c561eb.png', 'image', '2026-01-28', '2026-01-28 03:29:01', 1520127, 0, NULL),
(21, 20, 7, 'Radiografía - Panorámica', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2026/estudios/69796f4ac6b00.jpg', 'image', '2026-01-28', '2026-01-28 02:07:07', 36662, 1, '2026-01-28 01:32:05'),
(20, 20, 7, 'Radiografía - Panorámica', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2026/estudios/69796dc394921.jpg', 'image', '2026-01-28', '2026-01-28 02:00:35', 29342, 1, '2026-01-28 01:31:59'),
(19, 20, 7, 'Radiografía - Panorámica', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2026/estudios/69796db58f847.jpg', 'image', '2026-01-28', '2026-01-28 02:00:22', 29342, 1, '2026-01-28 01:31:26'),
(26, 25, 7, 'Radiografía - Cefalometría', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2026/estudios/69799de939a46.jpg', 'image', '2026-01-28', '2026-01-28 05:26:02', 203143, 1, '2026-01-28 01:40:29'),
(27, 26, 7, 'Radiografía - Antero Posterior', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2026/estudios/6979a91209c51.jpg', 'image', '2026-01-28', '2026-01-28 06:13:39', 203143, 1, '2026-01-28 01:36:44'),
(28, 27, 7, 'Radiografía - Panorámica', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2026/estudios/6979ab0d90282.jpg', 'image', '2026-01-28', '2026-01-28 06:22:06', 203143, 1, '2026-01-28 01:23:20'),
(29, 28, 7, 'Radiografía - Carpograma', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2026/estudios/6979acd5ed898.jpg', 'image', '2026-01-28', '2026-01-28 06:29:42', 26040, 1, '2026-01-28 01:30:26'),
(30, 29, 7, 'Radiografía - Senos Maxilares', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2026/estudios/6979addd0b081.jpg', 'image', '2026-01-28', '2026-01-28 06:34:06', 68946, 1, '2026-01-28 01:37:41'),
(31, 30, 7, 'Radiografía - Periapical', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2026/estudios/6979b29a552a7.jpg', 'image', '2026-01-28', '2026-01-28 06:54:19', 66802, 1, '2026-01-28 01:55:49'),
(32, 31, 7, 'Radiografía - Panorámica', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2026/estudios/6979b39c4b4aa.jpg', 'image', '2026-01-28', '2026-01-28 06:58:37', 73433, 1, '2026-01-28 01:58:58'),
(33, 32, 7, 'Radiografía - Panorámica', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2026/estudios/6979b3e3b22be.jpg', 'image', '2026-01-28', '2026-01-28 06:59:48', 57459, 1, '2026-01-28 02:00:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','doctor') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(7, 'doctor 1', 'doctor1@test.com', '$2y$10$c398aEis0AqaAqevNI/ct.GLdg4ee.XP80cLhv26d43OuEl1Nfd8O', 'doctor', '2025-12-14 16:56:31'),
(5, 'Ricardo Admin', 'admin@test.com', '$2y$10$cU4INSUuGz1xPSCzcwX5lORT.rnBZuNrOXQde5oSfw44/JGuM2lyW', 'admin', '2025-12-11 18:34:14'),
(6, 'Doctor Test', 'doctor@test.com', '$2y$10$cU4INSUuGz1xPSCzcwX5lORT.rnBZuNrOXQde5oSfw44/JGuM2lyW', 'doctor', '2025-12-11 18:34:14'),
(10, 'manuel perez', 'manuelperez@gmail.com', '$2y$10$IvMwxfuu8wxRaKGgIy95IODz7Rj9Z8EPU4RLXpnTtxepaDI9XTHrW', 'doctor', '2026-01-28 03:37:49');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
