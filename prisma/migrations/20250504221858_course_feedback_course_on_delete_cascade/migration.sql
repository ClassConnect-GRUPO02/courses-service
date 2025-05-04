-- DropForeignKey
ALTER TABLE `course_feedback` DROP FOREIGN KEY `course_feedback_course_id_fkey`;

-- AddForeignKey
ALTER TABLE `course_feedback` ADD CONSTRAINT `course_feedback_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
