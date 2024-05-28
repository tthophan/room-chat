-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(161) NOT NULL,
    `password` VARCHAR(161) NOT NULL,
    `passwordSecure` VARCHAR(36) NOT NULL,
    `first_name` VARCHAR(161) NULL,
    `last_name` VARCHAR(161) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
