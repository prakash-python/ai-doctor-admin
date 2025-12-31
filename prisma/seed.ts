import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Ensure roles exist
  await prisma.role.createMany({
    data: [
      { name: "admin" },
      { name: "doctor" },
      { name: "staff" },
      { name: "nurse" }
    ],
    skipDuplicates: true
  });

  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" }
  });

  if (!adminRole) throw new Error("Admin role missing");

  const passwordHash = await bcrypt.hash("admin123", 10);

  // Create admin user safely
  await prisma.user.upsert({
    where: { mobile: "9999999999" },
    update: {},
    create: {
      email: "admin@hospital.com",
      mobile: "9999999999",
      password: passwordHash,
      roleId: adminRole.id
    }
  });
}

main();
