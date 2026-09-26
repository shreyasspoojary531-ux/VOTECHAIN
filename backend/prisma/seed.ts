import { PrismaClient, Role, Gender } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();

// Deterministic PRNG so reseeding produces identical data.
let seedState = 42;
function rand(): number {
  seedState = (seedState * 1103515245 + 12345) % 2147483648;
  return seedState / 2147483648;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

const FIRST = ["Aarav", "Vivaan", "Aditya", "Ishaan", "Kabir", "Anaya", "Diya", "Aadhya", "Myra", "Sara", "Rohan", "Kiran", "Meera", "Nisha", "Arjun", "Priya", "Vikram", "Sunita", "Rahul", "Anita"];
const LAST = ["Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Gupta", "Mehta", "Joshi", "Das", "Kulkarni", "Rao"];
const CONSTITUENCIES = ["Ward-1-North", "Ward-2-South", "Ward-3-East", "Ward-4-West"];
const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;

async function main() {
  const passwordHash = await bcrypt.hash("Vote@1234", 10);

  // ---- Staff -------------------------------------------------------------
  const staff: Array<[string, Role]> = [
    ["registrar@votechain.local", "REGISTRAR"],
    ["admin@votechain.local", "ADMIN"],
    ["auditor@votechain.local", "AUDITOR"],
  ];
  for (const [email, role] of staff) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash, role, status: "ACTIVE" },
    });
  }

  // ---- 50 mock Aadhaar citizens (read-only registry) -----------------------
  const used = new Set<string>();
  for (let i = 0; i < 50; i++) {
    let aadhaar: string;
    do {
      aadhaar = String(200000000000 + Math.floor(rand() * 799999999999)).slice(0, 12);
    } while (used.has(aadhaar));
    used.add(aadhaar);

    const fullName = `${pick(FIRST)} ${pick(LAST)}`;
    const birthYear = 1950 + Math.floor(rand() * 50); // ages ~26-76 (some <18 filtered below)
    await prisma.mockAadhaar.upsert({
      where: { aadhaarNumber: aadhaar },
      update: {},
      create: {
        aadhaarNumber: aadhaar,
        fullName,
        dateOfBirth: new Date(Date.UTC(birthYear, Math.floor(rand() * 12), 1 + Math.floor(rand() * 28))),
        gender: pick(GENDERS as unknown as string[]) as Gender,
        phone: String(6000000000 + Math.floor(rand() * 3999999999)).slice(0, 10),
        email: `${fullName.toLowerCase().replace(/\s+/g, ".")}${i}@mockmail.local`,
        address: `${1 + Math.floor(rand() * 200)}, ${pick(["Gandhi Rd", "Nehru St", "Patel Marg", "MG Road"])}`,
        constituency: pick(CONSTITUENCIES),
        isAlive: rand() > 0.04, // ~4% marked deceased for negative testing
      },
    });
  }

  // ---- 10 registered voters (age 18+, alive) -------------------------------
  const eligibleCitizens = await prisma.mockAadhaar.findMany({
    where: { isAlive: true, dateOfBirth: { lte: new Date(Date.UTC(2008, 0, 1)) } },
    take: 10,
  });
  let voterCount = 0;
  for (const citizen of eligibleCitizens) {
    const email = `voter${++voterCount}@votechain.local`;
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        role: "VOTER",
        status: "ACTIVE",
        voterProfile: {
          create: {
            aadhaarId: citizen.id,
            constituency: citizen.constituency,
            isVerified: true,
          },
        },
      },
    });
  }

  // ---- Sample election (DRAFT) + 4 candidates -------------------------------
  const admin = await prisma.user.findUnique({ where: { email: "admin@votechain.local" } });
  if (admin) {
    const election = await prisma.election.upsert({
      where: { id: "seeded-election-0001" },
      update: {},
      create: {
        id: "seeded-election-0001",
        title: "Ward Council Election 2026",
        description: "Demo election for VoteChain MVP",
        constituency: "Ward-1-North",
        startAt: new Date(Date.now() + 24 * 3600 * 1000),
        endAt: new Date(Date.now() + 8 * 24 * 3600 * 1000),
        status: "DRAFT",
        createdBy: admin.id,
      },
    });

    const candidateSeed = [
      ["Meera Iyer", "Progress Alliance", "Lotus"],
      ["Rohan Das", "People's Front", "Star"],
      ["Anita Rao", "Green Future", "Leaf"],
      ["Vikram Joshi", "Independent", "Bell"],
    ];
    for (const [name, party, symbol] of candidateSeed) {
      await prisma.candidate.create({
        data: { electionId: election.id, name, party, symbol, manifesto: `${party} — a better ${election.constituency}.` },
      });
    }

    // Grant eligibility to the seeded voters whose constituency matches.
    const profiles = await prisma.voterProfile.findMany({ where: { constituency: election.constituency } });
    for (const p of profiles) {
      await prisma.voterEligibility.upsert({
        where: { voterProfileId_electionId: { voterProfileId: p.id, electionId: election.id } },
        update: {},
        create: { voterProfileId: p.id, electionId: election.id },
      });
    }
  }

  console.log("Seed complete:");
  console.log("  staff: registrar/admin/auditor@votechain.local (password Vote@1234)");
  console.log("  voters: voter1..N@votechain.local (password Vote@1234)");
  console.log(`  MockAadhaar: 50 citizens; election: Ward Council Election 2026 (DRAFT) + 4 candidates`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
