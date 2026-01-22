import prisma from "../src/prisma";

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
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
