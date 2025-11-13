CREATE TABLE `admin`(
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(), `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(), `is_active` BOOLEAN NOT NULL DEFAULT 'DEFAULT TRUE', `deleted_at` DATE NULL);
ALTER TABLE
    `admin` ADD UNIQUE `admin_email_unique`(`email`);
CREATE TABLE `members`(
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `role` ENUM('customer', 'artist', 'admin') NOT NULL DEFAULT 'customer',
    `phone` VARCHAR(50) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(), `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(), `is_active` BOOLEAN NOT NULL DEFAULT 'DEFAULT TRUE', `deleted_at` DATE NULL);
ALTER TABLE
    `members` ADD UNIQUE `members_email_unique`(`email`);
CREATE TABLE `sellers`(
    `id` BIGINT NOT NULL,
    `bio` TEXT NULL,
    `website` VARCHAR(255) NULL,
    `address` VARCHAR(255) NULL,
    `profile_image` VARCHAR(255) NULL,
    `deleted_at` DATE NULL,
    PRIMARY KEY(`id`)
);
CREATE TABLE `categories`(
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `deleted_at` DATE NULL
);
ALTER TABLE
    `categories` ADD UNIQUE `categories_name_unique`(`name`);
ALTER TABLE
    `categories` ADD UNIQUE `categories_slug_unique`(`slug`);
CREATE TABLE `artworks`(
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `seller_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `category_id` INT NULL,
    `creation_year` SMALLINT NULL,
    `dimensions` VARCHAR(100) NULL,
    `condition` VARCHAR(150) NULL,
    `is_for` ENUM('AUCTION', 'FIXED') NOT NULL DEFAULT 'DEFAULT FIXED',
    `fixed_price` DECIMAL(12, 2) NULL DEFAULT 'DEFAULT NULL',
    `currency` CHAR(3) NULL DEFAULT 'USD',
    `status` ENUM(
        'PENDING',
        'AVAILABLE',
        'RESERVED',
        'SOLD'
    ) NOT NULL DEFAULT 'PENDING' COMMENT '- pending: đã nộp cho admin, chưa được duyệt
- available: đã đăng lên exhibition
- sold: đã bán, đã nhận tiền
- reserved: đã thắng auction nhưng chưa nhận tiền, đang làm thủ tục',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(), `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(), `deleted_at` DATE NULL);
CREATE TABLE `artwork_images`(
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `artwork_id` BIGINT NOT NULL,
    `file_path` VARCHAR(1024) NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT 'DEFAULT FALSE',
    `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(), `deleted_at` DATE NULL);
CREATE TABLE `auctions`(
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `artwork_id` BIGINT NOT NULL,
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `starting_price` DECIMAL(18, 4) NOT NULL,
    `reserve_price` DECIMAL(18, 4) NULL,
    `minimum_increment` DECIMAL(18, 4) NULL DEFAULT '1',
    `status` ENUM('scheduled', 'running', 'ended') NOT NULL DEFAULT 'scheduled' COMMENT 'trạng thái của đấu giá, scheduled(đã dặt lịch), running(đang đấu giá),ended(đã kết thúc đấu giá)',
    `winner_bid_id` BIGINT NULL DEFAULT 'DEFAULT NULL',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(), `deleted_at` DATE NULL);
ALTER TABLE
    `auctions` ADD INDEX `auctions_artwork_id_index`(`artwork_id`);
ALTER TABLE
    `auctions` ADD INDEX `auctions_winner_bid_id_index`(`winner_bid_id`);
CREATE TABLE `orders`(
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `order_number` VARCHAR(64) NOT NULL,
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `currency` CHAR(3) NULL DEFAULT 'USD',
    `payment_type` VARCHAR(255) NOT NULL,
    `payment_time` DATETIME NOT NULL,
    `status` ENUM(
        'pending',
        'paid',
        'cancelled',
        'refunded'
    ) NOT NULL DEFAULT 'pending' COMMENT 'trạng thái đơn hàng',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(), `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(), `deleted_at` DATE NULL);
ALTER TABLE
    `orders` ADD UNIQUE `orders_order_number_unique`(`order_number`);
CREATE TABLE `order_items`(
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL,
    `artwork_id` BIGINT NOT NULL,
    `total` DECIMAL(12, 2) NOT NULL,
    `deleted_at` DATE NULL
);
CREATE TABLE `exhibitions`(
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `location` VARCHAR(255) NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(), `deleted_at` DATE NULL);
CREATE TABLE `exhibition_artworks`(
    `exhibition_id` BIGINT NOT NULL,
    `artwork_id` BIGINT NOT NULL,
    `display_from` DATETIME NULL,
    `display_to` DATETIME NULL,
    `deleted_at` DATE NULL,
    PRIMARY KEY(`exhibition_id`)
);
ALTER TABLE
    `exhibition_artworks` ADD PRIMARY KEY(`artwork_id`);
CREATE TABLE `commissions`(
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `artwork_id` BIGINT NULL,
    `commission_type` ENUM('percentage', 'fixed') NOT NULL COMMENT 'loại tiền hoa hồng',
    `value` DECIMAL(18, 4) NOT NULL,
    `applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(), `deleted_at` DATE NULL DEFAULT 'false');
CREATE TABLE `favorite`(
    `artworks_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `created_at` DATETIME NOT NULL,
    `deleted_at` DATETIME NOT NULL,
    PRIMARY KEY(`user_id`)
);
ALTER TABLE
    `members` ADD CONSTRAINT `members_id_foreign` FOREIGN KEY(`id`) REFERENCES `sellers`(`id`);
ALTER TABLE
    `orders` ADD CONSTRAINT `orders_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `members`(`id`);
ALTER TABLE
    `members` ADD CONSTRAINT `members_id_foreign` FOREIGN KEY(`id`) REFERENCES `favorite`(`user_id`);
ALTER TABLE
    `auctions` ADD CONSTRAINT `auctions_winner_bid_id_foreign` FOREIGN KEY(`winner_bid_id`) REFERENCES `members`(`id`);
ALTER TABLE
    `auctions` ADD CONSTRAINT `auctions_artwork_id_foreign` FOREIGN KEY(`artwork_id`) REFERENCES `artworks`(`id`);
ALTER TABLE
    `order_items` ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY(`order_id`) REFERENCES `orders`(`id`);
ALTER TABLE
    `exhibitions` ADD CONSTRAINT `exhibitions_id_foreign` FOREIGN KEY(`id`) REFERENCES `exhibition_artworks`(`exhibition_id`);
ALTER TABLE
    `artwork_images` ADD CONSTRAINT `artwork_images_artwork_id_foreign` FOREIGN KEY(`artwork_id`) REFERENCES `artworks`(`id`);
ALTER TABLE
    `artworks` ADD CONSTRAINT `artworks_category_id_foreign` FOREIGN KEY(`category_id`) REFERENCES `categories`(`id`);
ALTER TABLE
    `order_items` ADD CONSTRAINT `order_items_artwork_id_foreign` FOREIGN KEY(`artwork_id`) REFERENCES `artworks`(`id`);
ALTER TABLE
    `commissions` ADD CONSTRAINT `commissions_artwork_id_foreign` FOREIGN KEY(`artwork_id`) REFERENCES `artworks`(`id`);
ALTER TABLE
    `artworks` ADD CONSTRAINT `artworks_seller_id_foreign` FOREIGN KEY(`seller_id`) REFERENCES `members`(`id`);
ALTER TABLE
    `artworks` ADD CONSTRAINT `artworks_id_foreign` FOREIGN KEY(`id`) REFERENCES `exhibition_artworks`(`artwork_id`);
ALTER TABLE
    `artworks` ADD CONSTRAINT `artworks_id_foreign` FOREIGN KEY(`id`) REFERENCES `favorite`(`artworks_id`);