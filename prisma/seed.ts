import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
    },
  });
  console.log(`✅ Admin created: ${admin.username}`);

  // Create years
  const years = [
    { name: "السنة الأولى", sortOrder: 1 },
    { name: "السنة الثانية", sortOrder: 2 },
    { name: "السنة الثالثة", sortOrder: 3 },
    { name: "السنة الرابعة", sortOrder: 4 },
    { name: "السنة الخامسة", sortOrder: 5 },
  ];

  for (const year of years) {
    await prisma.year.upsert({
      where: { id: year.sortOrder },
      update: {},
      create: year,
    });
  }
  console.log(`✅ Years created: ${years.length}`);

  // Create sample payment accounts
  const paymentAccounts = [
    {
      name: "InstaPay",
      type: "instapay",
      accountName: "أحمد محمد",
      number: "01234567890",
      description: "InstaPay - متاح 24 ساعة",
      sortOrder: 1,
    },
    {
      name: "فودافون كاش",
      type: "mobile_wallet",
      accountName: "أحمد محمد",
      number: "01234567890",
      description: "Vodafone Cash - متاح 24 ساعة",
      sortOrder: 2,
    },
    {
      name: "أورانج كاش",
      type: "mobile_wallet",
      accountName: "أحمد محمد",
      number: "01234567890",
      description: "Orange Cash - متاح 24 ساعة",
      sortOrder: 3,
    },
    {
      name: "اتصالات كاش",
      type: "mobile_wallet",
      accountName: "أحمد محمد",
      number: "01234567890",
      description: "Etisalat Cash - متاح 24 ساعة",
      sortOrder: 4,
    },
  ];

  for (const account of paymentAccounts) {
    await prisma.paymentAccount.create({ data: account });
  }
  console.log(`✅ Payment accounts created: ${paymentAccounts.length}`);

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
