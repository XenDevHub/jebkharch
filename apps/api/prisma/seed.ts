import { PrismaClient, Difficulty, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
// Inline categories to avoid cross-package path resolution issues in Docker build
const DEFAULT_CATEGORIES = [
  { name: 'Cricket', icon: '🏏', difficulty: 'EASY' as Difficulty, entryFee: 5, isPremium: false },
  { name: 'Movies', icon: '🎬', difficulty: 'EASY' as Difficulty, entryFee: 5, isPremium: false },
  { name: 'History', icon: '📜', difficulty: 'MEDIUM' as Difficulty, entryFee: 5, isPremium: false },
  { name: 'Science', icon: '🔬', difficulty: 'MEDIUM' as Difficulty, entryFee: 5, isPremium: false },
  { name: 'Islamic Knowledge', icon: '☪️', difficulty: 'EASY' as Difficulty, entryFee: 5, isPremium: false },
  { name: 'General Knowledge', icon: '🌍', difficulty: 'EASY' as Difficulty, entryFee: 5, isPremium: false },
  { name: 'Cars', icon: '🚗', difficulty: 'MEDIUM' as Difficulty, entryFee: 5, isPremium: false },
  { name: 'Anime', icon: '⚔️', difficulty: 'MEDIUM' as Difficulty, entryFee: 5, isPremium: true },
  { name: 'Football', icon: '⚽', difficulty: 'EASY' as Difficulty, entryFee: 5, isPremium: false },
  { name: 'Technology', icon: '💻', difficulty: 'HARD' as Difficulty, entryFee: 5, isPremium: true },
];

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Seeding database...');

  // ── Seed Categories ──────────────────────────────────────────────────────────
  console.info('  → Seeding categories...');
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        id: uuidv4(),
        name: cat.name,
        icon: cat.icon,
        difficulty: cat.difficulty as Difficulty,
        entryFee: cat.entryFee,
        isPremium: cat.isPremium,
      },
    });
  }

  // ── Seed Admin User ──────────────────────────────────────────────────────────
  console.info('  → Seeding admin user...');
  const adminPhone = '03001234567';
  const adminReferralCode = 'JEBADMIN1';
  await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      id: uuidv4(),
      phone: adminPhone,
      name: 'Jeb Admin',
      email: 'admin@jebkharch.pk',
      coins: 9999,
      xp: 9999,
      referralCode: adminReferralCode,
      role: UserRole.ADMIN,
      isPro: true,
    },
  });

  // ── Seed Test Player ─────────────────────────────────────────────────────────
  console.info('  → Seeding test player...');
  const playerPhone = '03111234567';
  const existingPlayer = await prisma.user.findUnique({ where: { phone: playerPhone } });
  if (!existingPlayer) {
    await prisma.user.create({
      data: {
        id: uuidv4(),
        phone: playerPhone,
        name: 'Test Player',
        coins: 50,
        xp: 120,
        referralCode: 'JEB12345',
        role: UserRole.PLAYER,
      },
    });
  }

  // ── Seed Sample Questions (fallback when OpenAI key is absent) ───────────────
  console.info('  → Seeding sample questions...');
  const cricketCategory = await prisma.category.findFirst({ where: { name: 'Cricket' } });
  const gkCategory = await prisma.category.findFirst({ where: { name: 'General Knowledge' } });

  if (cricketCategory) {
    const cricketQuestions = [
      {
        questionText: 'Who holds the record for the highest individual score in Test cricket?',
        optionA: 'Don Bradman',
        optionB: 'Brian Lara',
        optionC: 'Sachin Tendulkar',
        optionD: 'Matthew Hayden',
        correctAnswer: 'B',
        explanation: 'Brian Lara scored 400* against England in 2004, the highest individual score in Test cricket.',
        difficulty: Difficulty.MEDIUM,
      },
      {
        questionText: 'Pakistan won its first Cricket World Cup in which year?',
        optionA: '1983',
        optionB: '1987',
        optionC: '1992',
        optionD: '1996',
        correctAnswer: 'C',
        explanation: 'Pakistan won the Cricket World Cup in 1992, defeating England in the final at Melbourne.',
        difficulty: Difficulty.EASY,
      },
      {
        questionText: 'Which Pakistani cricketer is known as the "Sultan of Swing"?',
        optionA: 'Shoaib Akhtar',
        optionB: 'Imran Khan',
        optionC: 'Waqar Younis',
        optionD: 'Wasim Akram',
        correctAnswer: 'D',
        explanation: 'Wasim Akram is known as the "Sultan of Swing" for his mastery of swing bowling.',
        difficulty: Difficulty.EASY,
      },
    ];

    for (const q of cricketQuestions) {
      const exists = await prisma.question.findFirst({
        where: { categoryId: cricketCategory.id, questionText: q.questionText },
      });
      if (!exists) {
        await prisma.question.create({
          data: { id: uuidv4(), categoryId: cricketCategory.id, ...q, createdByAi: false },
        });
      }
    }
  }

  if (gkCategory) {
    const gkQuestions = [
      {
        questionText: 'What is the capital of Pakistan?',
        optionA: 'Karachi',
        optionB: 'Lahore',
        optionC: 'Islamabad',
        optionD: 'Peshawar',
        correctAnswer: 'C',
        explanation: 'Islamabad has been the capital of Pakistan since 1967.',
        difficulty: Difficulty.EASY,
      },
      {
        questionText: 'Pakistan\'s national language is?',
        optionA: 'Punjabi',
        optionB: 'Sindhi',
        optionC: 'Pashto',
        optionD: 'Urdu',
        correctAnswer: 'D',
        explanation: 'Urdu is the national language of Pakistan, though it is spoken as a first language by only about 8% of the population.',
        difficulty: Difficulty.EASY,
      },
    ];

    for (const q of gkQuestions) {
      const exists = await prisma.question.findFirst({
        where: { categoryId: gkCategory.id, questionText: q.questionText },
      });
      if (!exists) {
        await prisma.question.create({
          data: { id: uuidv4(), categoryId: gkCategory.id, ...q, createdByAi: false },
        });
      }
    }
  }

  console.info('✅ Seeding complete!');
  console.info('');
  console.info('   Admin Phone:  03001234567');
  console.info('   Player Phone: 03111234567');
  console.info('   (Use OTP: 123456 in dev/mock mode)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
