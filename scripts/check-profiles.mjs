import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: "postgresql://postgres.egnvlwgngyrkhhbxtlqa:KnMtaLDaFG3nBgi1@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const profiles = await prisma.familyProfile.findMany({
  include: { user: true }
});

console.log(`Total familyProfiles: ${profiles.length}`);
console.log("");

for (const p of profiles) {
  const saveCount = await prisma.savedItem.count({ where: { familyProfileId: p.id } });
  const tripCount = await prisma.trip.count({ where: { familyProfileId: p.id } });
  console.log("familyProfileId:", p.id);
  console.log("  clerkId      :", p.user?.clerkId ?? "(no user)");
  console.log("  email        :", p.user?.email ?? "(no user)");
  console.log("  familyName   :", p.familyName ?? "(none)");
  console.log("  saves        :", saveCount);
  console.log("  trips        :", tripCount);
  console.log("---");
}

await prisma.$disconnect();
await pool.end();
