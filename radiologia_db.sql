-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 29-12-2025 a las 21:40:15
-- Versión del servidor: 8.4.7
-- Versión de PHP: 8.3.28

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
-- Estructura de tabla para la tabla `patients`
--

DROP TABLE IF EXISTS `patients`;
CREATE TABLE IF NOT EXISTS `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `dni` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `doctor_id` (`doctor_id`,`dni`)
) ENGINE=MyISAM AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `patients`
--

INSERT INTO `patients` (`id`, `doctor_id`, `dni`, `name`, `created_at`) VALUES
(13, 7, '123', 'TEST PACIENTE', '2025-12-20 15:17:14'),
(14, 7, '125', 'TEST RE', '2025-12-20 15:32:28'),
(15, 7, '541', 'GAARTR', '2025-12-20 15:35:48'),
(16, 7, '181818', 'RICARDO TEST', '2025-12-22 18:02:20'),
(17, 6, '789', 'PIPE', '2025-12-29 15:47:55'),
(18, 7, '5656', 'sgs', '2025-12-29 17:24:09'),
(19, 7, '357', 'fghd', '2025-12-29 18:56:00');

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
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`)
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `studies`
--

INSERT INTO `studies` (`id`, `patient_id`, `doctor_id`, `study_name`, `file_url`, `file_type`, `study_date`, `created_at`, `file_size`) VALUES
(11, 13, 7, 'Radiografía - Panorámica', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2025/estudios/6946bdf93b4b6.jpg', 'image', '2025-12-20', '2025-12-20 15:17:14', 153897),
(12, 14, 7, 'Radiografía - Panorámica', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2025/estudios/6946c18bb703d.jpg', 'image', '2025-12-20', '2025-12-20 15:32:28', 66131),
(13, 15, 7, 'Radiografía - Perfil', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2025/estudios/6946c253bd50a.jpg', 'image', '2025-12-20', '2025-12-20 15:35:48', 173656),
(14, 16, 7, 'Radiografía - Panorámica', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2025/estudios/694987ac07fb5.jpg', 'image', '2025-12-22', '2025-12-22 18:02:20', 153897),
(15, 16, 7, 'Radiografía - Periapical', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2025/estudios/694ef6dd6966a.jpg', 'image', '2025-12-26', '2025-12-26 20:58:06', 54211),
(16, 17, 6, 'Radiografía - Perfil', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2025/estudios/6952a2ab29aac.jpg', 'image', '2025-12-29', '2025-12-29 15:47:55', 66131),
(17, 18, 7, 'Tomografía - Bimaxilar', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2025/', 'image', '2025-12-29', '2025-12-29 17:24:09', 2001743041),
(18, 19, 7, 'Tomografía - Cuadrante', 'https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2025/estudios/6952c72384210.dcm', 'dicom', '2025-12-29', '2025-12-29 18:56:00', 2000844968);

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
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(7, 'doctor 1', 'doctor1@test.com', '$2y$10$c398aEis0AqaAqevNI/ct.GLdg4ee.XP80cLhv26d43OuEl1Nfd8O', 'doctor', '2025-12-14 16:56:31'),
(5, 'Ricardo Admin', 'admin@test.com', '$2y$10$cU4INSUuGz1xPSCzcwX5lORT.rnBZuNrOXQde5oSfw44/JGuM2lyW', 'admin', '2025-12-11 18:34:14'),
(6, 'Doctor Test', 'doctor@test.com', '$2y$10$cU4INSUuGz1xPSCzcwX5lORT.rnBZuNrOXQde5oSfw44/JGuM2lyW', 'doctor', '2025-12-11 18:34:14');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
