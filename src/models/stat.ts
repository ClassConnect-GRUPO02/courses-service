
export class InstructorCoursesGlobalStats {
    instructorId: string;
    averageTaskGrade: number;
    averageExamGrade: number;
    taskSubmissionsRate: number;
    examSubmissionsRate: number;
    trends: TaskStats[];

    constructor(
        instructorId: string,
        averageTaskGrade: number,
        averageExamGrade: number,
        taskSubmissionsRate: number,
        examSubmissionsRate: number,
        trends: TaskStats[],
    ) {
        this.instructorId = instructorId;
        this.averageTaskGrade = averageTaskGrade;
        this.averageExamGrade = averageExamGrade;
        this.taskSubmissionsRate = taskSubmissionsRate;
        this.examSubmissionsRate = examSubmissionsRate;
        this.trends = trends;
    }
}

export class CourseStats {
    courseId: string;
    averageTaskGrade: number;
    averageExamGrade: number;
    taskSubmissionsRate: number;
    examSubmissionsRate: number;
    trends: TaskStats[];

    constructor(
        courseId: string,
        averageTaskGrade: number,
        averageExamGrade: number,
        taskSubmissionsRate: number,
        examSubmissionsRate: number,
        trends: TaskStats[],
    ) {
        this.courseId = courseId;
        this.averageTaskGrade = averageTaskGrade;
        this.averageExamGrade = averageExamGrade;
        this.taskSubmissionsRate = taskSubmissionsRate;
        this.examSubmissionsRate = examSubmissionsRate;
        this.trends = trends;
    }
}

export class TaskStats {
    date: string;
    averageTaskGrade: number;
    averageExamGrade: number;
    taskSubmissionRate: number;
    examSubmissionRate: number;

    constructor(date: string, averageTaskGrade: number, averageExamGrade: number, taskSubmissionRate: number, examSubmissionRate: number) {
        this.date = date;
        this.averageTaskGrade = averageTaskGrade;
        this.averageExamGrade = averageExamGrade;
        this.taskSubmissionRate = taskSubmissionRate;
        this.examSubmissionRate = examSubmissionRate;
    }
}
