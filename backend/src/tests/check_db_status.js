import prisma from "../config/prisma.js";

const checkDbStatus = async () => {
  try {
    const interests = await prisma.interestRequest.findMany({
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        listing: { select: { id: true, title: true } },
      }
    });

    console.log(`\nFound ${interests.length} total interest requests:`);
    interests.forEach((i, idx) => {
      console.log(`[${idx+1}] ID: ${i.id}`);
      console.log(`    Listing: "${i.listing.title}"`);
      console.log(`    Status: ${i.status}`);
      console.log(`    Tenant: ${i.tenant.name} (${i.tenant.id})`);
      console.log(`    Owner: ${i.owner.name} (${i.owner.id})`);
    });

    const messages = await prisma.message.findMany();
    console.log(`\nFound ${messages.length} messages in DB.`);

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
};

checkDbStatus();
