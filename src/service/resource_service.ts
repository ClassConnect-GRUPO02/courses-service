import * as database from '../database/resource_db';
import { Resource } from "../models/resource";
import { ModuleNotFoundError, ResourceNotFoundError } from "../models/errors";

// --------------------------- RESOURCE ---------------------------------------------

export const addResourceToModule = async (moduleId: string, resource: Resource): Promise<Resource> => {
  const newResource = await database.addResourceToModule(moduleId, resource);
  if (!newResource) {
    throw new ModuleNotFoundError(`Module with ID ${moduleId} not found`);
  }
  return newResource;
}

// Deletes resource from module
export const deleteResourceFromModule = async (moduleId: string, resourceId: string): Promise<void> => {
  const isDeleted = await database.deleteResourceFromModule(moduleId, resourceId);
  if (!isDeleted) {
    throw new ResourceNotFoundError(`Resource with ID ${resourceId} not found in module ${moduleId}`);
  }
}

// Get resources by module ID
export const getResourcesByModuleId = async (moduleId: string): Promise<Resource[]> => {
  return await database.getResourcesByModuleId(moduleId);
}

// Updates resource by ID inside module
export const updateResource = async (moduleId: string, resourceId: string, resourceData: Partial<Resource>): Promise<Resource> => {
  const resource = await database.updateResource(moduleId, resourceId, resourceData);
  if (!resource) {
    throw new ResourceNotFoundError(`Resource with ID ${resourceId} not found in module ${moduleId}`);
  }
  return resource;
}

// Updates resources order in a module
export const updateResourcesOrder = async (moduleId: string, orderedResourceIds: string[]): Promise<void> => {
  try {
    await database.updateResourcesOrder(moduleId, orderedResourceIds);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error updating resources order: ${error.message}`);
    }
    throw new Error("Unknown error updating resources order");
  }
}
