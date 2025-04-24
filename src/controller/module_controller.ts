import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Module } from '../models/module';
import logger from '../logger/logger';
import * as courseService from '../service/service';
import {handleInvalidRequestError} from './course_controller'


// -------------------------- MODULES --------------------------

export const addModuleToCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const moduleData = req.body;
    const module = new Module(moduleData);
    const createdModule = await courseService.addModuleToCourse(id, module);
    res.status(StatusCodes.CREATED).json({ data: createdModule });
    logger.info(`Module added to course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
};

export const deleteModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, moduleId } = req.params;
    if (!id || !moduleId) {
      handleInvalidRequestError(res, 'Invalid course or module ID');
      return;
    }
    await courseService.removeModule(id, moduleId);
    res.status(StatusCodes.NO_CONTENT).send();
    logger.info(`Module with ID ${moduleId} deleted from course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
};

export const getModules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const modules = await courseService.getModules(id);
    res.status(StatusCodes.OK).json({ data: modules });
    logger.info(`Modules retrieved for course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
};

export const getModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, moduleId } = req.params;
    const module = await courseService.getModuleById(id, moduleId);
    res.status(StatusCodes.OK).json({ data: module });
    logger.info(`Module with ID ${moduleId} retrieved from course with ID ${id} successfully`);
  } catch (error) {
    next(error);
  }
}

export const updateModuleOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courseId = req.params.id;
    const { orderedModuleIds } = req.body;

    if (!Array.isArray(orderedModuleIds) || orderedModuleIds.length === 0) {
      res.status(400).json({ error: 'orderedModuleIds must be a non-empty array.' });
      return;
    }

    await courseService.updateModulesOrder(courseId, orderedModuleIds);

    res.status(200).json({ message: 'Module order updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, moduleId } = req.params;
    const moduleData: Partial<Module> = req.body;
    const updatedModule = await courseService.updateModule(id, moduleId, moduleData);
    if (!updatedModule) {
      res.status(StatusCodes.NOT_FOUND).json({ error: `Module with ID ${moduleId} not found in course ${id}` });
      return;
    }
    res.status(StatusCodes.OK).json({ data: updatedModule });
    logger.debug("Module updated:", updatedModule);
  } catch(error) {
    logger.error("Error updating module:", error);
    next(error);
  }
}
