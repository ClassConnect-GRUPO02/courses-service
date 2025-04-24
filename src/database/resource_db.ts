import { v4 as uuidv4 } from 'uuid';
import { prisma } from './database';
import { Resource } from '../models/resource';
import { ModuleNotFoundError } from '../models/errors';

// ---------------------- RESOURCE --------------------------------------

export const addResourceToModule = async (moduleId: string, resource: Resource): Promise<Resource> => {
  const newResource = await prisma.resource.create({
    data: {
      id: uuidv4(),
      description: resource.description,
      type: resource.type,
      url: resource.url,
      order: resource.order,
      moduleId: moduleId,
    },
  });

  return {...newResource, id: newResource.id };
}

export const deleteResourceFromModule = async (moduleId: string, resourceId: string): Promise<boolean> => {
  const resource = await prisma.resource.findFirst({
    where: {
      id: resourceId,
      moduleId: moduleId,
    },
  });

  if (!resource) {
    return false;
  }

  await prisma.resource.delete({
    where: { id: resourceId },
  });
  return true;
}

// Get resources by module ID
// returns an array of Resource objects or an empty array if none are found
export const getResourcesByModuleId = async (moduleId: string): Promise<Resource[]> => {
  const resources = await prisma.resource.findMany({
    where: { moduleId },
    orderBy: { order: 'asc' },
  });

  return resources.map((resource) => ({
    ...resource,
    id: resource.id,
  }));
}

// Updates resource by ID inside module
// Returns the updated Resource object or null if not found
export const updateResource = async (moduleId: string, resourceId: string, updateData: Partial<Resource>): Promise<Resource | null> => {
  const existingResource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!existingResource) {
    return null;
  }

  const updatedResource = await prisma.resource.update({
    where: { id: resourceId },
    data: {
      description: updateData.description ?? existingResource.description,
      type: updateData.type ?? existingResource.type,
      url: updateData.url ?? existingResource.url,
      order: updateData.order ?? existingResource.order,
    },
  });

  return updatedResource;
}

// Updates resources order in module
export const updateResourcesOrder = async (moduleId: string, orderedResourceIds: string[]): Promise<void> => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
  });

  if (!module) {
    throw new ModuleNotFoundError(`Module with ID ${moduleId} not found`);
  }

  await Promise.all(
    orderedResourceIds.map((resourceId, index) =>
      prisma.resource.updateMany({
        where: { id: resourceId, moduleId },
        data: { order: index },
      })
    )
  );
}