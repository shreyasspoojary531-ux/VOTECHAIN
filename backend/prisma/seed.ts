import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  await prisma.user.upsert({
    where: { email: "admin@evote.local" },
    update: {},
    create: {
      email: "admin@evote.local",
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "registrar@evote.local" },
    update: {},
    create: {
      email: "registrar@evote.local",
      passwordHash,
      role: "REGISTRAR",
      isActive: true,
    },
  });

  console.log("Seeded admin@evote.local and registrar@evote.local (password: Admin@123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
