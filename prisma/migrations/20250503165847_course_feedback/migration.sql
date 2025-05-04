-- CreateTable
CREATE TABLE `course_feedback` (
    `id` VARCHAR(191) NOT NULL,
    `course_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `comment` VARCHAR(191) NOT NULL,
    `punctuation` DOUBLE NOT NULL,

    UNIQUE INDEX `course_feedback_course_id_student_id_key`(`course_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_feedback` ADD CONSTRAINT `course_feedback_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
