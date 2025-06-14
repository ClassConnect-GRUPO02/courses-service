import { Task } from '../models/task';
import * as taskService from '../service/task_service';
import * as instructorService from '../service/instructor_service';
import * as enrollmentService from '../service/enrollment_service';
import { TaskSubmission } from '@prisma/client';
import { InstructorCoursesGlobalStats } from '../models/stat';

export const getStatsForInstructorCourses = async (instructorId: string): Promise<InstructorCoursesGlobalStats> => {
    const coursesIds = await instructorService.getCoursesByInstructorId(instructorId);
    const enrollmentsByCourseId = new Map<string, number>();

    const courseTasks: Task[] = []
    // Collect tasks from all the courses
    for (const courseId of coursesIds) {
        const tasks: Task[] = await taskService.getTasks(courseId);
        // Push all tasks to courseTasks
        courseTasks.push(...tasks);
    }

    const tasks: Task[] = []
    const exams: Task[] = []
    for (const task of courseTasks) {
        if (task.type == 'examen') {
            exams.push(task);
        } else {
            tasks.push(task);
        }
    }

    let cumulativeTaskGrading = 0;
    let cumulativeTaskSubmissionRate = 0;
    // Get tasks stats
    for (const task of tasks) {
        cumulativeTaskGrading += await getTaskAverageGrading(task);
        cumulativeTaskSubmissionRate += await getTaskSubmissionRate(task);
    }

    let cumulativeExamGrading = 0;
    let cumulativeExamSubmissionRate = 0;
    // Get exams stats
    for (const exam of exams) {
        cumulativeExamGrading += await getTaskAverageGrading(exam);
        cumulativeExamSubmissionRate += await getTaskSubmissionRate(exam);
    }


    const averageTaskGrading = cumulativeTaskGrading / tasks.length;
    const averageExamGrading = cumulativeExamGrading / exams.length;
    const averageTaskSubmissionRate = cumulativeTaskGrading / tasks.length;
    const averageExamSubmissionRate = cumulativeExamSubmissionRate / exams.length;
    const instructorCoursesGlobalStats = new InstructorCoursesGlobalStats(
        instructorId,
        averageTaskGrading,
        averageExamGrading,
        averageTaskSubmissionRate,
        averageExamSubmissionRate
    );
    return instructorCoursesGlobalStats;
}

const getTaskAverageGrading = async (task: Task): Promise<number> => {
    const taskSubmissions: TaskSubmission[] = await taskService.getTaskSubmissionsFromTaskId(task.id);
    let cumulativeGrading = 0;
    let totalSubmissions = 0;
    for (const submission of taskSubmissions) {
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

const getTaskSubmissionRate = async (task: Task): Promise<number> => {
    const totalSubmissions: number = (await taskService.getTaskSubmissionsFromTaskId(task.id)).length;
    const totalEnrollments: number = (await enrollmentService.getEnrollmentsByCourseId(task.course_id)).length;
    const submissionRate = (totalSubmissions / totalEnrollments) * 100;
    return submissionRate;
}
