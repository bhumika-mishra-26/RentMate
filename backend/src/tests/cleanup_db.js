import prisma from "../config/prisma.js";

const cleanupDb = async () => {
  console.log("🧹 Starting database cleanup of test accounts...\n");

  try {
    // 1. Identify users to delete
    const targetUsers = await prisma.user.findMany({
      where: {
        OR: [
          { name: { in: ["Mary Owner", "John Tenant", "Socket Owner", "Socket Tenant"] } },
          { email: { contains: "owner_" } },
          { email: { contains: "tenant_" } }
        ]
      }
    });

    const userIds = targetUsers.map((u) => u.id);
    console.log(`Found ${userIds.length} test users to delete.`);

    if (userIds.length > 0) {
      // 2. Delete Interest Requests referencing these users
      const deletedRequests = await prisma.interestRequest.deleteMany({
        where: {
          OR: [
            { tenantId: { in: userIds } },
            { ownerId: { in: userIds } }
          ]
        }
      });
      console.log(`Deleted ${deletedRequests.count} interest requests.`);

      // 3. Delete the users (Cascades to profile, listings, scores, messages)
      const deletedUsers = await prisma.user.deleteMany({
        where: {
          id: { in: userIds }
        }
      });
      console.log(`Deleted ${deletedUsers.count} users (and all cascaded profiles, listings, and messages).`);
    }

    console.log("\n✅ Database cleanup complete!");
  } catch (error) {
    console.error("❌ Cleanup failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
};

cleanupDb();
