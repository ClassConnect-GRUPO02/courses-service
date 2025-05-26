import {processMessageInstructor, processMessageStudent} from '../lib/ai';
import { userTypes } from '../lib/user_types';
import logger from '../logger/logger';

export const sendMessage = async (userId: string, message: string, history: any[], userType: string): Promise<any> => {
  try {
    if (userType == userTypes.STUDENT) {
      const response = await processMessageStudent(userId, message, history);
      return response;
    }
    else if (userType == userTypes.INSTRUCTOR) {
      const response = await processMessageInstructor(userId, message, history);
      return response;
    }
  } catch (error) {
    logger.error('Error in chatService.sendMessage:', error);
    throw error;
  }
}