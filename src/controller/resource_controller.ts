import { Request, Response, NextFunction } from 'express';
import * as courseService from '../service/service';
import logger from '../logger/logger';
import { StatusCodes } from 'http-status-codes';
import { Resource } from '../models/resource';
import { handleInvalidRequestError } from './course_controller';

// -------------------------- RESOURCES -------------------------------------

export const addResourceToModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const resourceData = req.body;
    const newResource = new Resource(resourceData);
    const resource = await courseService.addResourceToModule( moduleId, newResource);
    res.status(StatusCodes.CREATED).json({ data: resource });
    logger.debug(`Resource added to module with ID ${moduleId} successfully`);
  } catch (error) {
    logger.debug('Error adding resource:', error);
    next(error);
  }
}

// Deletes a resource from a module
export const deleteResourceFromModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { moduleId, resourceId } = req.params;
    if (!moduleId || !resourceId) {
      handleInvalidRequestError(res, 'Invalid module or resource ID');
      return;
    }
    await courseService.deleteResourceFromModule(moduleId, resourceId);
    res.status(StatusCodes.NO_CONTENT).send();
    logger.debug(`Resource with ID ${resourceId} deleted from module with ID ${moduleId} successfully`);
  } catch (error) {
    next(error);
  }
}

// Get resources from a module
export const getResourcesByModuleId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const resources = await courseService.getResourcesByModuleId(moduleId);
    res.status(StatusCodes.OK).json({ data: resources });
    logger.debug(`Resources retrieved from module with ID ${moduleId} successfully`);
  } catch (error) {
    next(error);
  }
}

// Updates a resource in a module
export const updateResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { moduleId, resourceId } = req.params;
    const resourceData: Partial<Resource> = req.body;
    const updatedResource = await courseService.updateResource(moduleId, resourceId, resourceData);
    res.status(StatusCodes.OK).json({ data: updatedResource });
    logger.debug("Resource updated:", updatedResource);
  } catch(error) {
    logger.error("Error updating resource:", error);
    next(error);
  }
}

// Updates resources order in a module
export const updateResourcesOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const { orderedResourceIds } = req.body;

    if (!Array.isArray(orderedResourceIds) || orderedResourceIds.length === 0) {
      res.status(400).json({ error: 'orderedResourceIds must be a non-empty array.' });
      return;
    }

    await courseService.updateResourcesOrder(moduleId, orderedResourceIds);

    res.status(200).json({ message: 'Resource order updated successfully.' });
  } catch (error) {
    next(error);
  }
};