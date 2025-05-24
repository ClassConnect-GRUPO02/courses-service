-- AlterTable
ALTER TABLE `courses_instructors` ADD COLUMN `can_create_content` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `can_grade` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `can_update_course` BOOLEAN NOT NULL DEFAULT false;
