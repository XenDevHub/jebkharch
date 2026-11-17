const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const categoriesToSeed = [
  'Cricket',
  'Movies',
  'History',
  'Islamic Knowledge',
  'General Knowledge',
  'Anime',
  'Football'
];

async function generateForCategory(category) {
  console.log(`Generating questions for ${category.name}...`);
  const prompt = `Generate exactly 15 multiple-choice quiz questions about "${category.name}" at MEDIUM difficulty level.

Rules:
- Each question must have exactly 4 options (A, B, C, D)
- Exactly one option must be correct
- Include a brief explanation for the correct answer
- Questions should be appropriate for all ages
- Focus on factual, verifiable knowledge
- For Pakistani audience, include Pakistan-specific content where relevant
- Do NOT include offensive, political, or divisive content

Return ONLY a valid JSON object with a "questions" key containing an array of questions:
{
  "questions": [
    {
      "questionText": "...",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "correctAnswer": "A|B|C|D",
      "explanation": "..."
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const parsed = JSON.parse(response.choices[0].message.content || '{}');
  const questions = parsed.questions || Object.values(parsed).find(v => Array.isArray(v)) || [];

  for (const q of questions) {
    if (!q.questionText || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !q.correctAnswer) {
      continue;
    }
    await prisma.question.create({
      data: {
        id: uuidv4(),
        categoryId: category.id,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer.toUpperCase(),
        explanation: q.explanation || '',
        difficulty: 'MEDIUM',
        createdByAi: true,
        isApproved: true,
      }
    });
  }
  console.log(`✅ Saved ${questions.length} questions for ${category.name}`);
}

async function main() {
  for (const catName of categoriesToSeed) {
    const category = await prisma.category.findFirst({ where: { name: catName } });
    if (!category) continue;
    const count = await prisma.question.count({ where: { categoryId: category.id } });
    if (count < 12) {
      try {
        await generateForCategory(category);
      } catch (err) {
        console.error(`Error generating for ${catName}:`, err.message);
      }
    } else {
      console.log(`Skipping ${catName}, already has ${count} questions.`);
    }
  }
  await prisma.$disconnect();
  console.log('🎉 Done seeding all categories!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
