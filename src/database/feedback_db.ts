import { v4 as uuidv4 } from 'uuid';
import { prisma } from './course_db';

export const addFeedbackToCourse = async (course_id: string, student_id: string, comment: string, punctuation: number) => {
    return await prisma.courseFeedback.create({
        data: {
        id: uuidv4(),
        course_id,
        student_id,
        comment,
        punctuation,
        },
    });
}

export const feedbackAlreadyExists = async (course_id: string, student_id: string): Promise<boolean> => {
    const feedback = await prisma.courseFeedback.findFirst({
        where: {
            course_id,
            student_id,
        },
    });
    return feedback !== null;
}

export const addFeedbackToStudent = async (course_id: string, student_id: string, instructor_id: string, comment: string, punctuation: number) => {
    return await prisma.studentFeedback.create({
        data: {
            id: uuidv4(),
            course_id,
            student_id,
            instructor_id,
            comment,
            punctuation,
        },
    });
}

export const studentFeedbackAlreadyExists = async (course_id: string, student_id: string): Promise<boolean> => {
    const feedback = await prisma.studentFeedback.findFirst({
        where: {
            course_id,
            student_id,
        },
    });
    return feedback !== null;
}

export const getFeedbacksAsStudent = async (student_id: string) => {
    return await prisma.studentFeedback.findMany({
        where: {
            student_id,
        },
    });
}

export const getFeedbacksByCourseId = async (course_id: string) => {
    return await prisma.courseFeedback.findMany({
        where: {
            course_id,
        },
    });
}
