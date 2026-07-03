import prisma from "../config/prisma.js";

export const upsertProfile = async (userId, data) => {
  const { preferredLocation, minBudget, maxBudget, moveInDate } = data;

  if (!preferredLocation || !minBudget || !maxBudget || !moveInDate) {
    throw new Error("All profile fields are required");
  }

  if (parseInt(minBudget) > parseInt(maxBudget)) {
    throw new Error("Minimum budget cannot be greater than maximum budget");
  }

  const profile = await prisma.tenantProfile.upsert({
    where: { userId },
    update: {
      preferredLocation,
      minBudget: parseInt(minBudget),
      maxBudget: parseInt(maxBudget),
      moveInDate: new Date(moveInDate),
    },
    create: {
      userId,
      preferredLocation,
      minBudget: parseInt(minBudget),
      maxBudget: parseInt(maxBudget),
      moveInDate: new Date(moveInDate),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return profile;
};

export const getTenantProfile = async (userId) => {
  const profile = await prisma.tenantProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return profile; // null if not yet set up
};
