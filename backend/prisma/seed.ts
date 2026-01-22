import prisma from "../src/prisma";
import bcrypt from "bcryptjs";
import { Role } from "../generated/prisma/client";

async function main() {
  await prisma.shopImage.deleteMany();
  await prisma.shop.deleteMany();

  await prisma.shop.create({
    data: {
      name: "Galerie Centrale",
      floor: 1,
      url: "/uploads/sample-logo-1.png",
      logoUrl: "/uploads/sample-logo-1.png",
      openingHours: "09:00-19:00",
      images: {
        create: [
          { url: "/uploads/sample-1.png" },
          { url: "/uploads/sample-2.png" },
        ],
      },
    },
  });

  await prisma.shop.create({
    data: {
      name: "Tech Corner",
      floor: 2,
      url: "/uploads/sample-logo-2.png",
      logoUrl: "/uploads/sample-logo-2.png",
      openingHours: "10:00-20:00",
      images: {
        create: [{ url: "/uploads/sample-3.png" }],
      },
    },
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: { passwordHash, role: Role.ADMIN },
      create: {
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: Role.ADMIN,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
