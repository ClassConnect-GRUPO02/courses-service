
export class InstructorCoursesGlobalStats {
    instructorId: string;
    averageTaskGrade: number;
    averageExamGrade: number;
    taskSubmissionsRate: number;
    examSubmissionsRate: number;

    constructor(
        instructorId: string,
        averageTaskGrade: number,
        averageExamGrade: number,
        taskSubmissionsRate: number,
        examSubmissionsRate: number
    ) {
        this.instructorId = instructorId;
        this.averageTaskGrade = averageTaskGrade;
        this.averageExamGrade = averageExamGrade;
        this.taskSubmissionsRate = taskSubmissionsRate;
        this.examSubmissionsRate = examSubmissionsRate;
    }
}
