import prisma from "../config/prisma.js";

// GET /api/admin/stats — System statistics and platform analytics
export const handleGetAdminStats = async (req, res) => {
  try {
    const usersCount = await prisma.user.count();
    const ownersCount = await prisma.user.count({ where: { role: "OWNER" } });
    const tenantsCount = await prisma.user.count({ where: { role: "TENANT" } });
    const listingsCount = await prisma.roomListing.count({ where: { isDeleted: false } });
    const filledListingsCount = await prisma.roomListing.count({ where: { status: "FILLED", isDeleted: false } });
    const messagesCount = await prisma.message.count();
    const requestsCount = await prisma.interestRequest.count();

    // Platform Analytics
    const totalRequests = requestsCount;
    const roomsFilled = filledListingsCount;

    // Average compatibility score
    const avgScoreResult = await prisma.compatibilityScore.aggregate({
      _avg: {
        score: true,
      },
    });
    const averageScore = avgScoreResult._avg.score ? Math.round(avgScoreResult._avg.score) : 0;

    // Daily Registrations (users registered today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          users: usersCount,
          owners: ownersCount,
          tenants: tenantsCount,
          listings: listingsCount,
          filledListings: filledListingsCount,
          messages: messagesCount,
          requests: requestsCount,
        },
        analytics: {
          totalRequests,
          averageScore,
          roomsFilled,
          dailyRegistrations,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users — List and search users
export const handleGetAdminUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const whereClause = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isDisabled: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/user/:id/toggle — Disable or Enable user login
export const handleToggleUserDisabled = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "ADMIN") {
      return res.status(400).json({ success: false, message: "Cannot disable system admin accounts" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isDisabled: !user.isDisabled },
      select: { id: true, name: true, isDisabled: true },
    });

    res.status(200).json({
      success: true,
      message: `User account has been ${updatedUser.isDisabled ? "disabled" : "enabled"}`,
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/user/:id — Hard delete a user and dependencies safely
export const handleAdminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "ADMIN") {
      return res.status(400).json({ success: false, message: "Cannot delete system admin accounts" });
    }

    // 1. Delete messages involving this user
    await prisma.message.deleteMany({
      where: { OR: [{ senderId: id }, { receiverId: id }] },
    });

    // 2. Delete interest requests (and their messages via cascade) involving this user
    await prisma.interestRequest.deleteMany({
      where: { OR: [{ tenantId: id }, { ownerId: id }] },
    });

    // 3. Delete compatibility scores linked to this user's tenant profile
    const tenantProfile = await prisma.tenantProfile.findUnique({ where: { userId: id } });
    if (tenantProfile) {
      await prisma.compatibilityScore.deleteMany({ where: { tenantId: tenantProfile.id } });
    }

    // 4. Delete compatibility scores linked to listings owned by this user
    const userListings = await prisma.roomListing.findMany({ where: { ownerId: id }, select: { id: true } });
    const listingIds = userListings.map((l) => l.id);
    if (listingIds.length > 0) {
      await prisma.compatibilityScore.deleteMany({ where: { listingId: { in: listingIds } } });
    }

    // 5. Delete user (cascade deletes TenantProfile, RoomListings, ListingPhotos)
    await prisma.user.delete({ where: { id } });

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("[ADMIN DELETE USER ERROR]", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


// GET /api/admin/listings — List all Listings (filtered for isDeleted: false)
export const handleGetAdminListings = async (req, res) => {
  try {
    const listings = await prisma.roomListing.findMany({
      where: { isDeleted: false },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        photos: true,
        _count: { select: { interests: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/listing/:id — Soft delete a listing
export const handleAdminDeleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await prisma.roomListing.findUnique({ where: { id } });

    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    await prisma.roomListing.update({
      where: { id },
      data: { isDeleted: true, status: "FILLED" },
    });

    res.status(200).json({ success: true, message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/listing/:id/fill — Mark a listing filled
export const handleAdminMarkListingFilled = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await prisma.roomListing.findUnique({ where: { id } });

    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const updated = await prisma.roomListing.update({
      where: { id },
      data: { status: "FILLED" },
    });

    res.status(200).json({ success: true, message: "Listing marked as filled", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
