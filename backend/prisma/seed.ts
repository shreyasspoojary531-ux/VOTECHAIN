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

  const commonPasswordHash = await bcrypt.hash('DemoPassword123!', 10);

  // 1. Create ADMIN User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@votechain.demo',
      passwordHash: commonPasswordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // 2. Create REGISTRAR User
  const registrarUser = await prisma.user.create({
    data: {
      email: 'registrar@votechain.demo',
      passwordHash: commonPasswordHash,
      role: Role.REGISTRAR,
      isActive: true,
    },
  });

  // 3. Create 50 MockAadhaar Records
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
    
    // Aadhaar number formatted as 12 digits
    const aadhaarNumber = `9999${String(10000000 + i)}`;

    // Varied DOB: 5 records under 18 (minors), 45 records adults (18+)
    let dob: Date;
    if (i <= 5) {
      // Minors aged 12 to 16
      const year = 2008 + (i % 5);
      dob = new Date(`${year}-05-15T00:00:00.000Z`);
    } else {
      // Adults aged 20 to 65
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

  // 4. Seed 3 VOTER users linked to adult MockAadhaar records (records index 5, 6, 7)
  for (let vIndex = 0; vIndex < 3; vIndex++) {
    const aadhaarRecord = mockAadhaars[5 + vIndex];
    const voterUser = await prisma.user.create({
      data: {
        email: `voter${vIndex + 1}@votechain.demo`,
        passwordHash: commonPasswordHash,
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
    console.log(`Created Voter: ${voterUser.email} linked to Aadhaar ${aadhaarRecord.aadhaarNumber}`);
  }

  console.log(`
✅ Database seeding completed successfully!
---------------------------------------------------------
Admin User:     admin@votechain.demo (Password: DemoPassword123!)
Registrar User: registrar@votechain.demo (Password: DemoPassword123!)
Voter Users:    voter1@votechain.demo, voter2@votechain.demo, voter3@votechain.demo
Mock Aadhaar:   50 records total (5 minors under 18, 45 adults)
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
