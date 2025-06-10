import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from './course_db';

export const checkNotSolvedQuestions = async (message: string): Promise<boolean> => {
  const questionFound = await prisma.questionNotSolved.findFirst({
    where: {
      question: {
        contains: message.toLowerCase(),
      },
    },
  });
  return !!questionFound;
};

export const saveNotSolvedQuestion = async (question: string): Promise<void> => {
  await prisma.questionNotSolved.create({
    data: {
      question: question.toLowerCase(),
    },
  });
};