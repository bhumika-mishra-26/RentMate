import prisma from "../config/prisma.js";

const checkUsers = async () => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isDisabled: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });
  console.log(`\nTotal users in DB: ${users.length}\n`);
  users.forEach((u, i) => {
    console.log(`[${i+1}] ${u.role} | ${u.name} | ${u.email} | disabled: ${u.isDisabled} | created: ${u.createdAt.toISOString()}`);
  });
  await prisma.$disconnect();
};

checkUsers();
