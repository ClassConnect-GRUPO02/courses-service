import { v4 as uuidv4 } from 'uuid';
import { prisma } from './course_db';
import { Resource } from '../models/resource';
import { ModuleNotFoundError } from '../models/errors';
import { isTitularInCourse } from './instructor_db';

// ---------------------- RESOURCE --------------------------------------

export const addResourceToModule = async (moduleId: string, resource: Resource, instructorId: string): Promise<Resource> => {
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

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
  });

  if (!module || !module.courseId) {
    throw new ModuleNotFoundError(`Module with ID ${moduleId} not found or missing courseId`);
  }

  const isTitular = await isTitularInCourse(module.courseId, instructorId);
  if (!isTitular) {
    await prisma.courseActivityLog.create({
      data: {
        course_id: module.courseId,
        user_id: instructorId,
        action: "add_resource_to_module",
        metadata: {
          resource_id: newResource.id,
          module_id: moduleId,
          resource_description: resource.description,
        }
      }
    });
  }

  return {...newResource, id: newResource.id };
}

export const deleteResourceFromModule = async (moduleId: string, resourceId: string, instructorId: string): Promise<boolean> => {
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

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
  });
  if (!module || !module.courseId) {
    throw new ModuleNotFoundError(`Module with ID ${moduleId} not found or missing courseId`);
  }
  const isTitular = await isTitularInCourse(module.courseId, instructorId);
  if (!isTitular) {
    await prisma.courseActivityLog.create({
      data: {
        course_id: module.courseId,
        user_id: instructorId,
        action: "delete_resource_from_module",
        metadata: {
          resource_id: resourceId,
          module_id: moduleId,
          resource_description: resource.description,
        }
      }
    });
  }

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
export const updateResource = async (moduleId: string, resourceId: string, updateData: Partial<Resource>, instructorId: string): Promise<Resource | null> => {
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

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
  });

  if (!module || !module.courseId) {
    throw new ModuleNotFoundError(`Module with ID ${moduleId} not found or missing courseId`);
  }

  const isTitular = await isTitularInCourse(module.courseId, instructorId);

  if (!isTitular) {
    await prisma.courseActivityLog.create({
      data: {
        course_id: module.courseId,
        user_id: instructorId,
        action: "update_resource_in_module",
        metadata: {
          resource_id: updatedResource.id,
          module_id: moduleId,
          resource_description: updateData.description ?? existingResource.description,
        }
      }
    });
  }

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