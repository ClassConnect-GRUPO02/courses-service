
export class InstructorCoursesGlobalStats {
    instructorId: string;
    averageTaskGrading: number;
    averageExamGrading: number;
    taskSubmissionsRate: number;
    examSubmissionsRate: number;

    constructor(
        instructorId: string,
        averageTaskGrading: number,
        averageExamGrading: number,
        taskSubmissionsRate: number,
        examSubmissionsRate: number
    ) {
        this.instructorId = instructorId;
        this.averageTaskGrading = averageTaskGrading;
        this.averageExamGrading = averageExamGrading;
        this.taskSubmissionsRate = taskSubmissionsRate;
        this.examSubmissionsRate = examSubmissionsRate;
    }
}
