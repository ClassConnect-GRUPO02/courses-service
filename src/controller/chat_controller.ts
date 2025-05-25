import { Request, Response, NextFunction } from 'express';
import logger from '../logger/logger';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../lib/auth';
import * as chatService from '../service/chat_service';

export const sendMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.Id;
    const userType = req.user?.userType;

    if (!userId || !userType) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
      return;
    }

    const message = req.body.message;
    const history = req.body.history || [];
    const response = await chatService.sendMessage(userId, message, history, userType);
    res.status(StatusCodes.OK).json({ data: response });

  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
}