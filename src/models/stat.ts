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

export class StudentCourseStats {
    studentId: string;
    averageTaskGrade: number;
    averageExamGrade: number;
    taskSubmissionRate: number;
    examSubmissionRate: number;

    constructor(studentId: string, averageTaskGrade: number, averageExamGrade: number, taskSubmissionRate: number, examSubmissionRate: number) {
        this.studentId = studentId;
        this.averageTaskGrade = averageTaskGrade;
        this.averageExamGrade = averageExamGrade;
        this.taskSubmissionRate = taskSubmissionRate;
        this.examSubmissionRate = examSubmissionRate;
    }
}

export class StudentCourseActivity {
    studentId: string;
    courseId: string;
    averageTaskGrade: number;
    averageExamGrade: number;
    taskSubmissionRate: number;
    examSubmissionRate: number;
    submissions: StudentSubmission[];

    constructor(studentId: string, courseId: string, averageTaskGrade: number, averageExamGrade: number, taskSubmissionRate: number, examSubmissionRate: number, submissions: StudentSubmission[]) {
        this.studentId = studentId;
        this.courseId = courseId;
        this.averageTaskGrade = averageTaskGrade;
        this.averageExamGrade = averageExamGrade;
        this.taskSubmissionRate = taskSubmissionRate;
        this.examSubmissionRate = examSubmissionRate;
        this.submissions = submissions;
    }
}

export class StudentSubmission {
    taskId: string;
    taskTitle: string;
    type: string;
    grade: number | null;
    submitted_at: Date | null;
    status: string;

    constructor(taskId: string, taskTitle: string, type: string, grade: number | null, submitted_at: Date | null, status: string) {
        this.taskId = taskId;
        this.taskTitle = taskTitle;
        this.type = type;
        this.grade = grade;
        this.submitted_at = submitted_at;
        this.status = status;
    }

}

