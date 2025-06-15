import { Task } from '../models/task';
import * as taskService from '../service/task_service';
import * as instructorService from '../service/instructor_service';
import * as enrollmentService from '../service/enrollment_service';
import { TaskSubmission, TaskType } from '@prisma/client';
import { InstructorCoursesGlobalStats } from '../models/stat';


export const getStatsForInstructorCourses = async (instructorId: string): Promise<InstructorCoursesGlobalStats> => {
    const coursesIds = await instructorService.getCoursesIdsByInstructorId(instructorId);
    const courseTasks: Task[] = []
    // Collect tasks from all the courses
    for (const courseId of coursesIds) {
        const tasks: Task[] = await taskService.getTasks(courseId);
        // Push all tasks to courseTasks
        courseTasks.push(...tasks);
    }

    const tasks: Task[] = []
    const exams: Task[] = []
    // Split the course tasks in 'tasks' and 'exams'
    for (const task of courseTasks) {
        if (task.type == TaskType.examen) {
            exams.push(task);
        } else {
            tasks.push(task);
        }
    }

    // Get the stats
    const averageTaskGrading = await getTasksAverageGrading(tasks);
    const tasksSubmissionRate = await getAverageTasksSubmissionRate(tasks);
    const averageExamGrading = await getTasksAverageGrading(exams);
    const examsSubmissionRate = await getAverageTasksSubmissionRate(exams);

    const instructorCoursesGlobalStats = new InstructorCoursesGlobalStats(
        instructorId,
        averageTaskGrading,
        averageExamGrading,
        tasksSubmissionRate,
        examsSubmissionRate
    );
    return instructorCoursesGlobalStats;
}

const getAverageTasksSubmissionRate = async (tasks: Task[]): Promise<number> => {
    let cumulativeSubmissionRate = 0;
    // Get the submission rate for each task, and accumulate it in cumulativeSubmissionRate
    for (const task of tasks) {
        const submissions = await taskService.getTaskSubmissionsCount(task.id);
        const enrollments = (await enrollmentService.getEnrollmentsByCourseId(task.course_id)).length;
        if (enrollments == 0) {
            continue;
        }
        const submissionRate = (submissions / enrollments) * 100;
        cumulativeSubmissionRate += submissionRate;
    }
    const totalTasks = tasks.length;
    const averageSubmissionsRate = cumulativeSubmissionRate / totalTasks;
    return averageSubmissionsRate;
}

const getTasksAverageGrading = async (tasks: Task[]): Promise<number> => {
    let gradedSubmissions: TaskSubmission[] = [];
    for (const task of tasks) {
        const submissions: TaskSubmission[] = await taskService.getGradedTaskSubmissions(task.id);
        gradedSubmissions.push(...submissions);
    }
    let cumulativeGrading = 0;
    let totalSubmissions = 0;
    for (const submission of gradedSubmissions) {
        // Skip the tasks that are not graded
        if (!submission.grade) {
            continue;
        }
        cumulativeGrading += submission.grade;
        totalSubmissions += 1;
    }
    const averageGrading = cumulativeGrading / totalSubmissions;
    return averageGrading;
}
