import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function text(value, options = {}) {
  const marks = [];
  if (options.bold) {
    marks.push({ type: "bold" });
  }
  if (options.italic) {
    marks.push({ type: "italic" });
  }
  if (options.classified) {
    marks.push({ type: "classified" });
  }

  return marks.length ? { type: "text", text: value, marks } : { type: "text", text: value };
}

function paragraph(...parts) {
  return {
    type: "paragraph",
    content: parts.map((part) => (typeof part === "string" ? text(part) : part)),
  };
}

function doc(...paragraphs) {
  return {
    type: "doc",
    content: paragraphs,
  };
}

function bullet(paragraphNode) {
  return {
    type: "doc",
    content: [paragraphNode],
  };
}

const cards = [
  {
    displayOrder: 10,
    name: "Кан Сонхи",
    nameHref: "/cases",
    age: 28,
    citizenship: "Республика Корея",
    status: "под наблюдением",
    photoPath: "psi/placeholder.png",
    photoAlt: "Кан Сонхи",
    introDoc: doc(
      paragraph(
        "Частное лицо. В настоящее время осуществляет деятельность, связанную с документированием и публичным освещением ",
        text("аномальных / необъяснимых", { classified: true }),
        " явлений (онлайн-платформа).",
      ),
    ),
    conclusionDoc: doc(paragraph("Заключение: продолжать наблюдение.")),
    bullets: [
      bullet(
        paragraph(
          "В [202",
          text("█", { classified: true }),
          "-11-04] проходила по делу #SCU-19-",
          text("███", { classified: true }),
          " в качестве подозреваемой. Ввиду отсутствия доказательной базы была оправдана.",
        ),
      ),
      bullet(
        paragraph(
          "В [202",
          text("█", { classified: true }),
          "-10-29] проходила как потерпевшая в деле #SCU-19-",
          text("███", { classified: true }),
          ".",
        ),
      ),
      bullet(paragraph("Имеет неоднократный подтверждённый контакт с манифестациями.")),
    ],
  },
  {
    displayOrder: 20,
    name: "Сюй Минхао",
    age: 28,
    citizenship: "КНР",
    status: "под наблюдением",
    photoPath: "psi/placeholder.png",
    photoAlt: "Сюй Минхао",
    introDoc: doc(
      paragraph(
        "Сотрудник Исследовательского Центра Пу Сунлин, ассистент Главного Хранителя коллекции ",
        text("аномальных артефактов", { classified: true }),
        ".",
      ),
    ),
    conclusionDoc: doc(paragraph("Заключение: продолжать наблюдение.")),
    bullets: [
      bullet(
        paragraph(
          "Предположительно вступил в контакт с Кан Сонхи после инцидента #SCU-19-",
          text("███", { classified: true }),
          ".",
        ),
      ),
      bullet(
        paragraph(
          "После указанного контакта у Кан Сонхи были зафиксированы новые телесные изменения: симметричные татуировки с изображением глаз на нижних конечностях.",
        ),
      ),
      bullet(paragraph("Был замечен в учащённых командировках на территорию Республики Корея.")),
    ],
  },
  {
    displayOrder: 30,
    name: "Чхве Хансоль",
    age: 25,
    citizenship: "Республика Корея",
    status: "потенциальная угроза",
    photoPath: "psi/placeholder.png",
    photoAlt: "Чхве Хансоль",
    introDoc: doc(paragraph("Частное лицо. Зафиксированы контакты с независимым консультантом Хон Джошуа.")),
    conclusionDoc: doc(paragraph("Заключение: потенциальная угроза. Продолжать наблюдение.")),
    bullets: [
      bullet(
        paragraph(
          "Работает в магазине, специализирующемся на торговле предметами ",
          text("неустановленного происхождения", { classified: true }),
          ".",
        ),
      ),
      bullet(paragraph("Ряд свидетелей описывают эффекты при контакте: ощущение вертиго, иррациональный страх высоты.")),
    ],
  },
  {
    displayOrder: 40,
    name: "Хон Джошуа",
    nameHref: "/partners",
    citizenship: "неизвестно",
    status: "переменный",
    photoPath: "psi/placeholder.png",
    photoAlt: "Хон Джошуа",
    introDoc: doc(
      paragraph(
        "Независимый паранормальный консультант. Владелец магазина по продаже предметов ",
        text("неустановленного происхождения", { classified: true }),
        ".",
      ),
    ),
    conclusionDoc: doc(paragraph("Заключение: продолжать наблюдение.")),
    bullets: [
      bullet(paragraph("Характеризуется как непредсказуемый.")),
      bullet(
        paragraph(
          "Уровень угрозы на данный момент классифицируется как ",
          text("неопределённый", { classified: true }),
          ".",
        ),
      ),
      bullet(paragraph("Несмотря на установленное сотрудничество, рекомендуется продолжать наблюдение.")),
    ],
  },
  {
    displayOrder: 50,
    name: "Бу Сынкван",
    age: 25,
    citizenship: "Республика Корея",
    status: "под наблюдением",
    photoPath: "psi/placeholder.png",
    photoAlt: "Бу Сынкван",
    introDoc: doc(
      paragraph(
        "Сотрудник юридической фирмы ",
        text("[ДАННЫЕ УДАЛЕНЫ]", { classified: true }),
        ".",
      ),
    ),
    conclusionDoc: doc(paragraph("Заключение: пассивное наблюдение.")),
    bullets: [
      bullet(paragraph("Был замечен в контакте с Чхве Хансолем.")),
      bullet(paragraph("Прямых контактов с манифестациями на текущий момент не зафиксировано.")),
    ],
  },
  {
    displayOrder: 60,
    name: "Юн Джонхан",
    age: 32,
    citizenship: "Республика Корея",
    status: "под наблюдением",
    photoPath: "psi/placeholder.png",
    photoAlt: "Юн Джонхан",
    introDoc: doc(
      paragraph(
        "Сотрудник юридической фирмы ",
        text("[ДАННЫЕ УДАЛЕНЫ]", { classified: true }),
        ".",
      ),
    ),
    conclusionDoc: doc(paragraph("Заключение: пассивное наблюдение.")),
    bullets: [
      bullet(paragraph("Личное знакомство с Бу Сынкваном.")),
      bullet(paragraph("Был замечен в контакте с Чхве Хансолем.")),
      bullet(paragraph("Контактов с манифестациями на текущий момент не зафиксировано.")),
    ],
  },
];

async function main() {
  await prisma.psiCardBullet.deleteMany();
  await prisma.psiCard.deleteMany();

  for (const card of cards) {
    await prisma.psiCard.create({
      data: {
        displayOrder: card.displayOrder,
        name: card.name,
        nameHref: card.nameHref ?? null,
        age: card.age ?? null,
        citizenship: card.citizenship,
        status: card.status,
        photoPath: card.photoPath ?? null,
        photoAlt: card.photoAlt ?? null,
        introDoc: card.introDoc,
        conclusionDoc: card.conclusionDoc,
        bullets: {
          create: card.bullets.map((contentDoc, index) => ({
            displayOrder: (index + 1) * 10,
            contentDoc,
          })),
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
