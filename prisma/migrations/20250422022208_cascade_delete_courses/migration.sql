-- DropForeignKey
ALTER TABLE `course_student` DROP FOREIGN KEY `course_student_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `courses_instructors` DROP FOREIGN KEY `courses_instructors_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `module` DROP FOREIGN KEY `Module_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `tasks` DROP FOREIGN KEY `tasks_course_id_fkey`;

-- DropIndex
DROP INDEX `course_student_courseId_fkey` ON `course_student`;

-- DropIndex
DROP INDEX `Module_courseId_fkey` ON `module`;

-- DropIndex
DROP INDEX `tasks_course_id_fkey` ON `tasks`;

-- AddForeignKey
ALTER TABLE `Module` ADD CONSTRAINT `Module_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_student` ADD CONSTRAINT `course_student_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses_instructors` ADD CONSTRAINT `courses_instructors_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
