import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.contact.deleteMany();

  await prisma.contact.createMany({
    data: [
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        phone: "+1-555-0101",
        company: "Acme Corp",
        notes: "Met at tech conference 2025",
      },
      {
        name: "Bob Smith",
        email: "bob.smith@example.com",
        phone: "+1-555-0102",
        company: "Globex Inc",
        notes: "Potential partner for Q2 project",
      },
      {
        name: "Carol Williams",
        email: "carol@example.com",
        company: "Initech",
        notes: "Referred by Alice",
      },
    ],
  });

  console.log("Seeded 3 contacts");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
