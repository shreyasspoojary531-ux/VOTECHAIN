import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const INDIAN_FIRST_NAMES_MALE = [
  'Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Advik', 'Kabir', 'Anay',
  'Reyansh', 'Mohammad', 'Siddharth', 'Aditya', 'Vikram', 'Rohan', 'Karan',
  'Rahul', 'Amit', 'Suresh', 'Ramesh', 'Rajesh', 'Deepak', 'Manoj', 'Vijay',
  'Sanjay', 'Sunil'
];

const INDIAN_FIRST_NAMES_FEMALE = [
  'Aadhya', 'Saanvi', 'Amaira', 'Myra', 'Kavya', 'Priya', 'Neha', 'Pooja',
  'Sunita', 'Anita', 'Meena', 'Ritu', 'Geeta', 'Seema', 'Kiran', 'Shweta',
  'Anjali', 'Divya', 'Nisha', 'Preeti', 'Swati', 'Sneha', 'Monika', 'Aarti',
  'Rashmi'
];

const INDIAN_LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Patel', 'Kumar', 'Singh', 'Deshmukh', 'Joshi',
  'Mehta', 'Shah', 'Reddy', 'Rao', 'Nair', 'Menon', 'Kulkarni', 'Patil',
  'Banerjee', 'Chatterjee', 'Das', 'Sen', 'Puri', 'Malhotra', 'Kapoor', 'Bhat',
  'Poojary'
];

const CITIES = [
  'Mumbai, Maharashtra', 'Bengaluru, Karnataka', 'Delhi, NCR', 'Hyderabad, Telangana',
  'Chennai, Tamil Nadu', 'Kolkata, West Bengal', 'Pune, Maharashtra', 'Ahmedabad, Gujarat',
  'Jaipur, Rajasthan', 'Lucknow, Uttar Pradesh'
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.auditRecord.deleteMany();
  await prisma.ballot.deleteMany();
  await prisma.blockchainTransaction.deleteMany();
  await prisma.anonymousCredential.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.voterEligibility.deleteMany();
  await prisma.election.deleteMany();
  await prisma.oTPCode.deleteMany();
  await prisma.voterProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.mockAadhaar.deleteMany();

  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const registrarPasswordHash = await bcrypt.hash('Registrar@123', 10);
  const auditorPasswordHash = await bcrypt.hash('Auditor@123', 10);
  const voterPasswordHash = await bcrypt.hash('Voter@123', 10);
  const genericPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Create ADMIN Users (.demo & .gov)
  await prisma.user.createMany({
    data: [
      { email: 'admin@votechain.demo', passwordHash: adminPasswordHash, role: Role.ADMIN, isActive: true },
      { email: 'admin@votechain.gov', passwordHash: genericPasswordHash, role: Role.ADMIN, isActive: true },
    ],
  });

  // 2. Create REGISTRAR Users (.demo & .gov)
  const registrarUser = await prisma.user.create({
    data: {
      email: 'registrar@votechain.demo',
      passwordHash: registrarPasswordHash,
      role: Role.REGISTRAR,
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'registrar@votechain.gov',
      passwordHash: genericPasswordHash,
      role: Role.REGISTRAR,
      isActive: true,
    },
  });

  // 3. Create AUDITOR Users (.demo & .gov)
  await prisma.user.createMany({
    data: [
      { email: 'auditor@votechain.demo', passwordHash: auditorPasswordHash, role: Role.AUDITOR, isActive: true },
      { email: 'auditor@votechain.gov', passwordHash: genericPasswordHash, role: Role.AUDITOR, isActive: true },
    ],
  });

  // 4. Create 50 MockAadhaar Records
  const mockAadhaars = [];
  for (let i = 1; i <= 50; i++) {
    const isMale = i % 2 === 1;
    const firstNameList = isMale ? INDIAN_FIRST_NAMES_MALE : INDIAN_FIRST_NAMES_FEMALE;
    const firstName = firstNameList[(i - 1) % firstNameList.length];
    const lastName = INDIAN_LAST_NAMES[(i - 1) % INDIAN_LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;
    const gender = isMale ? 'Male' : 'Female';
    const city = CITIES[(i - 1) % CITIES.length];
    const address = `#${100 + i}, Sector ${((i * 3) % 20) + 1}, ${city}`;
    const phone = `98765${String(10000 + i).slice(-5)}`;
    const aadhaarNumber = `9999${String(10000000 + i)}`;

    let dob: Date;
    if (i <= 5) {
      const year = 2008 + (i % 5);
      dob = new Date(`${year}-05-15T00:00:00.000Z`);
    } else {
      const year = 1960 + ((i * 7) % 45);
      const month = String(((i % 12) + 1)).padStart(2, '0');
      const day = String(((i % 28) + 1)).padStart(2, '0');
      dob = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    }

    const aadhaarRecord = await prisma.mockAadhaar.create({
      data: {
        aadhaarNumber,
        fullName,
        dateOfBirth: dob,
        gender,
        address,
        phone,
      },
    });

    mockAadhaars.push(aadhaarRecord);
  }

  // 5. Seed VOTER users (.demo & .gov)
  await prisma.user.create({
    data: {
      email: 'voter@votechain.gov',
      passwordHash: genericPasswordHash,
      role: Role.VOTER,
      isActive: true,
      voterProfile: {
        create: {
          aadhaarId: mockAadhaars[5].id,
          registeredByUserId: registrarUser.id,
        },
      },
    },
  });

  for (let vIndex = 0; vIndex < 10; vIndex++) {
    // Start at 6: index 5 is already used by voter@votechain.gov above (unique aadhaarId)
    const aadhaarRecord = mockAadhaars[6 + vIndex];
    await prisma.user.create({
      data: {
        email: `voter${vIndex + 1}@votechain.demo`,
        passwordHash: voterPasswordHash,
        role: Role.VOTER,
        isActive: true,
        voterProfile: {
          create: {
            aadhaarId: aadhaarRecord.id,
            registeredByUserId: registrarUser.id,
          },
        },
      },
    });
  }

  console.log(`
✅ Database seeding completed successfully!
---------------------------------------------------------
Admin Accounts:     admin@votechain.demo (Admin@123), admin@votechain.gov (password123)
Registrar Accounts: registrar@votechain.demo (Registrar@123), registrar@votechain.gov (password123)
Auditor Accounts:   auditor@votechain.demo (Auditor@123), auditor@votechain.gov (password123)
Voter Accounts:     voter@votechain.gov (password123), voter1..10@votechain.demo (Voter@123)
Mock Aadhaar:       50 records total
---------------------------------------------------------
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
