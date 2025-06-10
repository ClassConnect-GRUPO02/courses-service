import {processMessageInstructor, processMessageStudent} from '../lib/ai';
import { userTypes } from '../lib/user_types';
import logger from '../logger/logger';
import { ChatMessage } from '../models/chat_message';
import * as chat_db from '../database/chat_db';

export const sendMessage = async (userId: string, message: string, history: ChatMessage[], userType: string): Promise<string> => {
  try {
    if (await checkNotSolvedQuestions(message)) {
      return 'Lo siento, no tengo suficiente información para responder a tu pregunta.'
    }

    if (userType == userTypes.STUDENT) {
      const response = await processMessageStudent(userId, message, history);
      return response;
    }
    else if (userType == userTypes.INSTRUCTOR) {
      const response = await processMessageInstructor(userId, message, history);
      return response;
    }
    throw new Error('Invalid user type');
  } catch (error) {
    logger.error('Error in chatService.sendMessage:', error);
    throw error;
  }
}

export const checkNotSolvedQuestions = async (message: string): Promise<boolean> => {
  return await chat_db.checkNotSolvedQuestions(message);
}