-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 27, 2026 at 08:25 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `sudutsatu_db`;
USE `sudutsatu_db`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`, `created_at`) VALUES
(128325, 'tes', 'tes@gmail.com', '$2b$10$gzvcOBA.sqoBT5nuO5SO7OH8anfTHStgWfz6kHp12D1w3nyru4ZqS', NULL, 'user', '2026-06-17 13:05:53'),
(128326, 'risca', 'riscafazriah@gmail.com', '$2b$10$LhYgmJkq1PSgQHaJDAbHgOipWy3mxG8VTCAgeM.BeXVYvIEIMJ9uq', '083820460511', 'user', '2026-06-18 06:15:30'),
(128327, 'admin', 'admin@gmail.com', '$2b$10$Ner1a/.AhtBUW30KaKTGm.03fifXyfz3jGkKjj9MWmHdJnIPPbA4O', '088888888888', 'admin', '2026-06-27 03:02:35'),
(128328, 'alfa', 'alfa@gmail.com', '$2b$10$fAepTt2G/PDmJqCG0OHZt.dZpRLecJeEC2JMdbo1/yoCvlxya7whO', '081111111111', 'user', '2026-06-27 03:04:06');

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `contact_messages` (`id`, `name`, `email`, `subject`, `message`, `is_read`, `created_at`, `updated_at`) VALUES
(1, 'UDEAN', 'udean@gmail.com', 'Kendala Pembayaran', 'Pembayarannya Terlalu mahal', 0, '2026-06-19 15:13:11', '2026-06-19 15:13:11'),
(2, 'Risca Fazriah Syabania', 'riscafazriah@gmail.com', 'thhhhh', 'jjj', 0, '2026-06-19 15:14:55', '2026-06-19 15:14:55'),
(3, 'Risca Fazriah Syabania1', 'riscafazriah@gmail.com', 'hhh', 'ssssssssssssssssss', 0, '2026-06-19 15:44:38', '2026-06-19 15:44:38'),
(4, 'aaffdsadsa', 'ads@gmail.com', 'Reserve', 'cihuyy', 0, '2026-06-27 05:15:14', '2026-06-27 05:15:14');

CREATE TABLE IF NOT EXISTS `venues` (
  `id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `img` varchar(255) NOT NULL,
  `rating` varchar(50) DEFAULT '4.5 (0 Reviews)',
  `loc` varchar(150) NOT NULL,
  `type` varchar(50) NOT NULL,
  `category` enum('futsal','biliard') NOT NULL,
  `base_price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `venues` (`id`, `name`, `img`, `rating`, `loc`, `type`, `category`, `base_price`) VALUES
('V002', 'Lapangan Futsal Sintetis', 'assets/images/futsal-sintetis.png', '4.5 (89 Reviews)', 'SudutSatu Arena Lantai 1', 'INDOOR TURF', 'futsal', 100000),
('V003', 'Meja Biliard 1', 'assets/images/meja1.png', '4.9 (210 Reviews)', 'SudutSatu Arena Lantai 2', 'VIP LOUNGE', 'biliard', 50000);

CREATE TABLE IF NOT EXISTS `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `venue_name` varchar(255) DEFAULT NULL,
  `team_name` varchar(255) DEFAULT NULL,
  `booking_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `total_price` int(11) NOT NULL,
  `status` enum('pending_payment','pending_verification','confirmed','cancelled','completed','failed') DEFAULT 'pending_verification',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_proof` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `venues`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=128329;

ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
