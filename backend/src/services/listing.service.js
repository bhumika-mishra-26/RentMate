import prisma from "../config/prisma.js";

export const createListing = async (ownerId, data) => {
  const { title, location, rent, roomType, furnishingStatus, availableFrom, description } = data;

  const listing = await prisma.roomListing.create({
    data: {
      title,
      location,
      rent: parseInt(rent),
      roomType,
      furnishingStatus,
      availableFrom: new Date(availableFrom),
      description,
      ownerId,
      status: "AVAILABLE",
      isDeleted: false,
    },
    include: {
      owner: { select: { id: true, name: true, email: true, phone: true } },
      photos: true,
    },
  });

  return listing;
};

export const getOwnerListings = async (ownerId) => {
  const listings = await prisma.roomListing.findMany({
    where: { ownerId, isDeleted: false },
    include: {
      photos: true,
      _count: { select: { interests: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return listings;
};

export const getAllListings = async (filters = {}) => {
  const { location, maxRent, minRent, roomType, furnishingStatus, keyword, sortBy } = filters;

  const whereClause = {
    status: "AVAILABLE",
    isDeleted: false,
  };

  if (location) {
    whereClause.location = { contains: location, mode: "insensitive" };
  }

  if (maxRent || minRent) {
    whereClause.rent = {};
    if (maxRent) whereClause.rent.lte = parseInt(maxRent);
    if (minRent) whereClause.rent.gte = parseInt(minRent);
  }

  if (roomType) {
    whereClause.roomType = { equals: roomType, mode: "insensitive" };
  }

  if (furnishingStatus) {
    whereClause.furnishingStatus = { equals: furnishingStatus, mode: "insensitive" };
  }

  if (keyword) {
    whereClause.OR = [
      { title: { contains: keyword, mode: "insensitive" } },
      { description: { contains: keyword, mode: "insensitive" } },
      { location: { contains: keyword, mode: "insensitive" } },
    ];
  }

  // Determine sort order (except compatibility which is sorted in-memory)
  let orderBy = { createdAt: "desc" }; // default: newest
  if (sortBy === "rent-low") orderBy = { rent: "asc" };
  if (sortBy === "rent-high") orderBy = { rent: "desc" };

  const listings = await prisma.roomListing.findMany({
    where: whereClause,
    include: {
      owner: { select: { id: true, name: true, phone: true } },
      photos: true,
    },
    orderBy,
  });

  return listings;
};

export const getListingById = async (id) => {
  const listing = await prisma.roomListing.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true, phone: true } },
      photos: true,
      _count: { select: { interests: true } },
    },
  });

  if (!listing || listing.isDeleted) {
    throw new Error("Listing not found");
  }

  return listing;
};

export const updateListing = async (id, ownerId, data) => {
  const existing = await prisma.roomListing.findUnique({ where: { id } });

  if (!existing || existing.isDeleted) throw new Error("Listing not found");
  if (existing.ownerId !== ownerId) throw new Error("Not authorized to edit this listing");

  const { title, location, rent, roomType, furnishingStatus, availableFrom, description, status } = data;

  const updated = await prisma.roomListing.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(location && { location }),
      ...(rent && { rent: parseInt(rent) }),
      ...(roomType && { roomType }),
      ...(furnishingStatus && { furnishingStatus }),
      ...(availableFrom && { availableFrom: new Date(availableFrom) }),
      ...(description && { description }),
      ...(status && { status }),
    },
    include: {
      owner: { select: { id: true, name: true, email: true, phone: true } },
      photos: true,
    },
  });

  return updated;
};

/** Soft delete — marks isDeleted = true instead of removing the record */
export const deleteListing = async (id, ownerId) => {
  const existing = await prisma.roomListing.findUnique({ where: { id } });

  if (!existing || existing.isDeleted) throw new Error("Listing not found");
  if (existing.ownerId !== ownerId) throw new Error("Not authorized to delete this listing");

  await prisma.roomListing.update({
    where: { id },
    data: { isDeleted: true, status: "FILLED" },
  });

  return { message: "Listing deleted successfully" };
};
