import { PrismaClient, ExerciseType } from '@prisma/client';

const prisma = new PrismaClient();

const createTags = (tags: string[]): { tag: string; weight: number }[] => {
  return tags.map((tag) => ({ tag, weight: 1 }));
};

const meditation = [
  {
    name: 'Медитація для заспокоєння',
    description: 'Проста медитація для зняття стресу та тривожності',
    type: 'MEDITATION',
    tags: createTags(['релаксація', 'стрес', 'тривожність', 'медитація']),
    steps: [{}],
  },
];

const physicalExercises = [
  {
    name: 'Розтяжка тіла',
    description: 'Проста ранкова розтяжка для покращення кровообігу.',
    type: 'PHYSICAL',
    tags: createTags(['енергія', 'розігрів', 'тіло']),
    steps: [
      {
        title: 'Нахили вперед',
        description: 'Повільно нахились до пальців ніг.',
        duration: 10,
        type: 'stretch',
      },
      {
        title: 'Повороти тулуба',
        description: 'Поверни тулуб вліво і вправо.',
        duration: 10,
        type: 'movement',
      },
      {
        title: 'Плечові оберти',
        description: 'Кругові рухи плечима вперед і назад.',
        duration: 10,
        type: 'movement',
      },
    ],
  },
  {
    name: 'Активне пробудження',
    description: 'Короткий комплекс для бадьорості.',
    type: 'PHYSICAL',
    tags: createTags(['активність', 'енергія']),
    steps: [
      {
        title: 'Стрибки',
        description: '10 стрибків на місці.',
        duration: 10,
        type: 'movement',
      },
      {
        title: 'Присідання',
        description: '5 повільних присідань.',
        duration: 15,
        type: 'movement',
      },
      {
        title: 'Глибокий вдих',
        description: 'Глибоко вдихни та видихни 3 рази.',
        duration: 10,
        type: 'breathing',
      },
    ],
  },
];

const groundingExercises = [
  {
    name: 'Техніка 5-4-3-2-1',
    description:
      'Допомагає повернутись до реальності через сенсорне усвідомлення.',
    type: 'GROUNDING',
    tags: createTags(['тривожність', 'заземлення', 'усвідомлення']),
    steps: [
      {
        title: '5 речей, які бачиш',
        description: 'Назви 5 речей навколо себе.',
        duration: 10,
        type: 'awareness',
      },
      {
        title: '4 речі, які відчуваєш',
        description: 'Зверни увагу на 4 дотики тіла (одяг, поверхня, тощо).',
        duration: 10,
        type: 'awareness',
      },
      {
        title: '3 звуки',
        description: 'Прислухайся до 3 різних звуків.',
        duration: 10,
        type: 'awareness',
      },
      {
        title: '2 запахи',
        description: 'Понюхай повітря або що поруч.',
        duration: 10,
        type: 'awareness',
      },
      {
        title: '1 смак',
        description: 'Згадай або спробуй якийсь смак.',
        duration: 10,
        type: 'awareness',
      },
    ],
  },
  {
    name: 'Заземлення через тіло',
    description: 'Повернення у тіло через прості рухи.',
    type: 'GROUNDING',
    tags: createTags(['зосередження', 'тіло']),
    steps: [
      {
        title: 'Постав ноги на землю',
        description: 'Відчуй твердість підлоги під ногами.',
        duration: 5,
        type: 'awareness',
      },
      {
        title: 'Розслаб плечі',
        description: 'Зверни увагу на своє тіло та розслаб його.',
        duration: 5,
        type: 'awareness',
      },
      {
        title: 'Стисни і розтисни кулаки',
        description: 'Відчуй напругу і розслаблення в руках.',
        duration: 10,
        type: 'movement',
      },
    ],
  },
];

const breathingExercises = [
  {
    name: 'Дихання 4-7-8',
    description: 'Техніка для зниження тривоги та покращення сну.',
    type: 'BREATHING',
    tags: createTags(['сон', 'релаксація', 'стрес']),
    steps: [
      {
        title: 'Видих',
        description: 'Повністю видихни через рот зі звуком «хух».',
        duration: 2,
        type: 'exhale',
      },
      {
        title: 'Вдих',
        description: 'Вдихай через ніс на рахунок до 4.',
        duration: 4,
        type: 'inhale',
      },
      {
        title: 'Затримка дихання',
        description: 'Затримай дихання на 7 секунд.',
        duration: 7,
        type: 'hold',
      },
      {
        title: 'Повільний видих',
        description: 'Повільно видихай через рот 8 секунд.',
        duration: 8,
        type: 'exhale',
      },
      {
        title: 'Повтори',
        description: 'Повтори цикл ще 3 рази.',
        duration: 3,
        type: 'rest',
        repeatCount: 3,
      },
    ],
  },
  {
    name: 'Квадратне дихання (Box Breathing)',
    description: 'Допомагає відновити фокус та знизити стрес.',
    type: 'BREATHING',
    tags: createTags(['фокус', 'тривожність', 'спокій']),
    steps: [
      {
        title: 'Вдих',
        description: 'Вдихай через ніс 4 секунди.',
        duration: 4,
        type: 'inhale',
      },
      {
        title: 'Затримка',
        description: 'Затримай дихання на 4 секунди.',
        duration: 4,
        type: 'hold',
      },
      {
        title: 'Видих',
        description: 'Видихай 4 секунди.',
        duration: 4,
        type: 'exhale',
      },
      {
        title: 'Затримка після видиху',
        description: 'Не дихай ще 4 секунди.',
        duration: 4,
        type: 'hold',
      },
      {
        title: 'Повторити',
        description: 'Виконай ще 4 цикли.',
        duration: 3,
        type: 'rest',
        repeatCount: 4,
      },
    ],
  },
  {
    name: 'Дихання 5-5',
    description:
      'Проста техніка вирівнювання ритму дихання для щоденної практики.',
    type: 'BREATHING',
    tags: createTags(['баланс', 'регулярність', 'розслаблення']),
    steps: [
      {
        title: 'Вдих',
        description: 'Вдих через ніс протягом 5 секунд.',
        duration: 5,
        type: 'inhale',
      },
      {
        title: 'Видих',
        description: 'Видих через рот 5 секунд.',
        duration: 5,
        type: 'exhale',
      },
      {
        title: 'Повторення',
        description: 'Виконай ще 5 циклів.',
        duration: 3,
        type: 'rest',
        repeatCount: 5,
      },
    ],
  },
  {
    name: 'Дихання через одну ніздрю',
    description: 'Збалансовує нервову систему та енергію.',
    type: 'BREATHING',
    tags: createTags(['баланс', 'енергія', 'йога']),
    steps: [
      {
        title: 'Закрий праву ніздрю',
        description: 'Закрий праву ніздрю пальцем та вдихай через ліву.',
        duration: 4,
        type: 'inhale',
      },
      {
        title: 'Закрий ліву, відкрий праву',
        description: 'Затримай дихання на мить, потім видихни через праву.',
        duration: 4,
        type: 'exhale',
      },
      {
        title: 'Повтор з іншої сторони',
        description: 'Тепер вдихай через праву, видихай через ліву.',
        duration: 4,
        type: 'inhale',
      },
      {
        title: 'Цикл',
        description: 'Продовжити чергування до 5 циклів.',
        duration: 3,
        type: 'rest',
        repeatCount: 5,
      },
    ],
  },
  {
    name: 'Подвійний видих',
    description: 'Техніка для швидкого зниження напруги.',
    type: 'BREATHING',
    tags: createTags(['тривожність', 'перевтома', 'термінове заспокоєння']),
    steps: [
      {
        title: 'Подвійний вдих',
        description: 'Два коротких вдихи носом поспіль.',
        duration: 2,
        type: 'inhale',
      },
      {
        title: 'Довгий видих',
        description: 'Один повільний глибокий видих ротом.',
        duration: 6,
        type: 'exhale',
      },
      {
        title: 'Цикл',
        description: 'Повтори 6 разів.',
        duration: 3,
        type: 'rest',
        repeatCount: 6,
      },
    ],
  },
];

async function main() {
  for (const exercise of [
    ...meditation,
    ...breathingExercises,
    ...physicalExercises,
    ...groundingExercises,
  ]) {
    await prisma.exercise.create({
      data: {
        name: exercise.name,
        description: exercise.description,
        type: exercise.type as ExerciseType,
        tags: exercise.tags,
        steps: exercise.steps as any,
      },
    });
  }
  console.log('✅ Вправи успішно додані.');
}

main()
  .catch((e) => {
    console.error('❌ Помилка:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
