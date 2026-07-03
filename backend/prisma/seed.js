import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@rentfinder.com";
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("AdminPassword123", 10);
    await prisma.user.create({
      data: {
        name: "Default Admin",
        email: adminEmail,
        phone: "1234567890",
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("Default Admin user created successfully.");
  } else {
    console.log("Admin user already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
