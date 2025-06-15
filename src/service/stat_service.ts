import { Task } from '../models/task';
import * as taskService from '../service/task_service';
import * as instructorService from '../service/instructor_service';
import * as enrollmentService from '../service/enrollment_service';
import { TaskSubmission, TaskType } from '@prisma/client';
import { CourseStats, InstructorCoursesGlobalStats, TaskStats } from '../models/stat';

export const getStatsForInstructorCourses = async (instructorId: string): Promise<InstructorCoursesGlobalStats> => {
    const coursesIds = await instructorService.getCoursesIdsByInstructorId(instructorId);
    const courseTasks: Task[] = []
    // Collect tasks from all the courses
    for (const courseId of coursesIds) {
        const tasks: Task[] = await taskService.getTasks(courseId);
        // Push all tasks to courseTasks
        courseTasks.push(...tasks);
    }

    // If there are no tasks, then there will be no stats
    if (courseTasks.length === 0) {
        return new InstructorCoursesGlobalStats(instructorId, 0, 0, 0, 0, []);
    }

    const tasksByMonth = new Map<string, Task[]>();
    for (const task of courseTasks) {
        const taskMonth = getStartOfMonth(task.due_date);
        if (!tasksByMonth.get(taskMonth)) {
            tasksByMonth.set(taskMonth, []);
        }
        tasksByMonth.get(taskMonth)!.push(task);
    }
    const statsByMonth = new Map<string, TaskStats>();
    for (let [month, taskList] of tasksByMonth) {
        const tasks = taskList.filter(task => task.type === TaskType.tarea);
        const exams = taskList.filter(task => task.type === TaskType.examen);
        const averageTaskGrade = await getTasksAverageGrade(tasks);
        const taskSubmissionRate = await getAverageTasksSubmissionRate(tasks);
        const averageExamGrade = await getTasksAverageGrade(exams);
        const examSubmissionRate = await getAverageTasksSubmissionRate(exams);
        const taskStats = new TaskStats(month, averageTaskGrade, averageExamGrade, taskSubmissionRate, examSubmissionRate);
        statsByMonth.set(month, taskStats);
    }
    const trends = Array.from(statsByMonth.values()).sort((a, b) => { return +new Date(a.date) - +new Date(b.date) });

    const historicalAverageTaskGrade = trends.map(task => task.averageTaskGrade).reduce((a, b) => a + b) / trends.length || 0;
    const historicalAverageExamGrade = trends.map(task => task.averageExamGrade).reduce((a, b) => a + b) / trends.length || 0;
    const historicalTaskSubmissionRate = trends.map(task => task.taskSubmissionRate).reduce((a, b) => a + b) / trends.length || 0;
    const historicalExamSubmissionRate = trends.map(task => task.examSubmissionRate).reduce((a, b) => a + b) / trends.length || 0;
    const instructorCoursesGlobalStats = new InstructorCoursesGlobalStats(
        instructorId,
        historicalAverageTaskGrade,
        historicalAverageExamGrade,
        historicalTaskSubmissionRate,
        historicalExamSubmissionRate,
        trends,
    );

    return instructorCoursesGlobalStats;
}

export const getCourseStats = async (courseId: string, from: string, to: string): Promise<CourseStats> => {
    let courseTasks: Task[] = await taskService.getTasks(courseId);

    // If there are no tasks, then there will be no stats
    if (courseTasks.length === 0) {
        return new CourseStats(courseId, 0, 0, 0, 0, []);
    }
    // filter tasks within the given time range
    courseTasks = courseTasks.filter(task => from < task.due_date && task.due_date < to);

    const tasksByMonth = new Map<string, Task[]>();
    for (const task of courseTasks) {
        const taskMonth = getStartOfMonth(task.due_date);
        if (!tasksByMonth.get(taskMonth)) {
            tasksByMonth.set(taskMonth, []);
        }
        tasksByMonth.get(taskMonth)!.push(task);
    }
    const statsByMonth = new Map<string, TaskStats>();
    for (let [month, taskList] of tasksByMonth) {
        const tasks = taskList.filter(task => task.type === TaskType.tarea);
        const exams = taskList.filter(task => task.type === TaskType.examen);
        const averageTaskGrade = await getTasksAverageGrade(tasks);
        const taskSubmissionRate = await getAverageTasksSubmissionRate(tasks);
        const averageExamGrade = await getTasksAverageGrade(exams);
        const examSubmissionRate = await getAverageTasksSubmissionRate(exams);
        const taskStats = new TaskStats(month, averageTaskGrade, averageExamGrade, taskSubmissionRate, examSubmissionRate);
        statsByMonth.set(month, taskStats);
    }
    const trends = Array.from(statsByMonth.values()).sort((a, b) => { return +new Date(a.date) - +new Date(b.date) });

    const historicalAverageTaskGrade = trends.map(task => task.averageTaskGrade).reduce((a, b) => a + b) / trends.length || 0;
    const historicalAverageExamGrade = trends.map(task => task.averageExamGrade).reduce((a, b) => a + b) / trends.length || 0;
    const historicalTaskSubmissionRate = trends.map(task => task.taskSubmissionRate).reduce((a, b) => a + b) / trends.length || 0;
    const historicalExamSubmissionRate = trends.map(task => task.examSubmissionRate).reduce((a, b) => a + b) / trends.length || 0;
    const courseStats = new CourseStats(
        courseId,
        historicalAverageTaskGrade,
        historicalAverageExamGrade,
        historicalTaskSubmissionRate,
        historicalExamSubmissionRate,
        trends,
    );

    return courseStats;
}

const getAverageTasksSubmissionRate = async (tasks: Task[]): Promise<number> => {
    if (tasks.length == 0) {
        return 0;
    }
    let cumulativeSubmissionRate = 0.0;
    // Get the submission rate for each task, and accumulate it in cumulativeSubmissionRate
    for (const task of tasks) {
        const submissions = await taskService.getTaskSubmissionsCount(task.id);
        const enrollments = (await enrollmentService.getEnrollmentsByCourseId(task.course_id)).length;
        if (enrollments == 0) {
            continue;
        }
        const submissionRate = (submissions / enrollments) * 100.0;
        cumulativeSubmissionRate += submissionRate;
    }
    const totalTasks = tasks.length;
    const averageSubmissionsRate = cumulativeSubmissionRate / totalTasks;
    return averageSubmissionsRate;
}

const getTasksAverageGrade = async (tasks: Task[]): Promise<number> => {
    const gradedSubmissions: TaskSubmission[] = [];
    for (const task of tasks) {
        const submissions: TaskSubmission[] = await taskService.getGradedTaskSubmissions(task.id);
        gradedSubmissions.push(...submissions);
    }
    let cumulativeGrade = 0;
    let totalSubmissions = 0;
    for (const submission of gradedSubmissions) {
        // Skip the tasks that are not graded
        if (!submission.grade || submission.grade === 0) {
            continue;
        }
        cumulativeGrade += submission.grade;
        totalSubmissions += 1;
    }
    if (totalSubmissions === 0) {
        return 0;
    }
    const averageGrade = cumulativeGrade / totalSubmissions;
    return averageGrade;
}

function getStartOfMonth(dateString: string): string {
    const date = new Date(dateString);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
    return startOfMonth;
}
