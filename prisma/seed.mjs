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

const personnelCards = [
  {
    displayOrder: 10,
    registryId: "SCU-███",
    fullName: "Чхве Сынчоль",
    role: "Старший инспектор",
    status: "Активен",
  },
  {
    displayOrder: 20,
    registryId: "SCU-███",
    fullName: "Ли Джихун",
    role: "Оперативный сотрудник",
    status: "Активен",
  },
  {
    displayOrder: 30,
    registryId: "SCU-███",
    fullName: "[ДАННЫЕ УДАЛЕНЫ]",
    role: "Консультант",
    status: "Статус засекречен",
  },
  {
    displayOrder: 40,
    registryId: "SCU-███",
    fullName: "Ким Мингю",
    role: "Оперативный сотрудник",
    status: "Активен",
  },
];

const caseCards = [
  {
    displayOrder: 10,
    title: "▣ [202█-11-04] Дело #SCU-19-███",
    meta: "Статус дела: закрыто | Категория: убийство | Локация: г. Сеул, р-н ██████",
    introDoc: doc(
      paragraph(
        "Дело об убийстве гражданки ",
        text("[ДАННЫЕ УДАЛЕНЫ]", { classified: true }),
        ". Голова потерпевшей была обнаружена в жилом помещении Кан Сонхи.",
      ),
    ),
    conclusionDoc: doc(
      paragraph("Дело закрыто. Убийца не установлен."),
      paragraph(
        "Скетчбук, упомянутый в показаниях, был изъят в качестве вещественного доказательства и передан на хранение в Исследовательский Центр Пу Сунлин.",
      ),
      paragraph("Ведущий инспектор: ", text("[ДАННЫЕ УДАЛЕНЫ]", { classified: true }), "."),
    ),
    bullets: [
      bullet(paragraph("Кан Сонхи проходила по делу в качестве подозреваемой, однако за недостаточностью улик была оправдана.")),
      bullet(
        paragraph(
          "Психиатрическое заключение указывает, что на момент дачи показаний Кан Сонхи находилась в состоянии острого шока и глубокой психологической травмы.",
        ),
      ),
      bullet(
        paragraph(
          "Заявление о том, что художественное изображение манифестировалось, совершило убийство и доставило останки потерпевшей, признано ",
          text("недостоверным", { classified: true }),
          ".",
        ),
      ),
    ],
  },
  {
    displayOrder: 20,
    title: "▣ [202█-10-29] Дело #SCU-19-███",
    meta: "Статус дела: закрыто | Категория: групповой инцидент | Локация: за пределами г. Сеул",
    introDoc: doc(
      paragraph(
        "Заброшенное культовое сооружение малого размера, расположенное в изолированной местности, на удалении от автомобильных трасс.",
      ),
      paragraph(
        "Здание находилось в неудовлетворительном техническом состоянии: окна заколочены, электроснабжение отсутствует, электронное оборудование не функционировало.",
      ),
    ),
    conclusionDoc: doc(
      paragraph("Ведущий инспектор: Чхве Сынчоль."),
      paragraph(
        "Расследование не может быть продолжено, поскольку вскоре после инцидента в здании произошёл пожар. Сооружение выгорело полностью.",
      ),
      paragraph(
        "Официальное заключение: причиной возгорания признано «нарушение правил пожарной безопасности». На месте найдены предметы, свидетельствующие о незаконной активности.",
      ),
    ),
    bullets: [
      bullet(paragraph("Во время проведения несанкционированных съёмок группа подверглась нападению неустановленного характера.")),
      bullet(paragraph("Кан Сонхи — единственная выжившая.")),
      bullet(
        paragraph(
          "Потерпевшая утверждала, что съёмочную группу поглотила темнота, а также сообщала о выраженном дискомфорте в присутствии теней.",
        ),
      ),
    ],
  },
];

const partnerCards = [
  {
    displayOrder: 10,
    title: "Исследовательский Центр Пу Сунлин",
    titleHref: null,
    introDoc: doc(
      paragraph(
        "Академическое исследовательское учреждение, официально зарегистрированное на территории ",
        text("███████", { classified: true }),
        ", КНР.",
      ),
    ),
    conclusionDoc: doc(paragraph("Статус сотрудничества: подтверждён.")),
    bullets: [
      bullet(
        paragraph(
          "Объекты, классифицированные как потенциально опасные аномальные предметы, подлежат передаче в Центр в кратчайшие сроки.",
        ),
      ),
      bullet(
        paragraph(
          "Центр сохраняет право истребовать любой объект, признанный не представляющим непосредственной угрозы, при условии, что все необходимые экспертизы были ",
          text("проведены / зафиксированы / одобрены", { classified: true }),
          ".",
        ),
      ),
    ],
  },
  {
    displayOrder: 20,
    title: "Джошуа Хон",
    titleHref: "/psi",
    introDoc: doc(paragraph("Независимый консультант. Территория деятельности: Республика Корея.")),
    conclusionDoc: doc(paragraph("Статус сотрудничества: ограниченный допуск.")),
    bullets: [
      bullet(
        paragraph(
          "Контакт допускается исключительно в случаях, когда задействованные аномальные объекты или явления представляют непосредственную угрозу гражданскому населению и/или сотрудникам SCU.",
        ),
      ),
      bullet(
        paragraph(
          "Обращение допустимо только при условии, что стандартные протоколы SCU признаны недостаточными, а меры локализации — невозможными.",
        ),
      ),
    ],
  },
];

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
  await prisma.caseCardBullet.deleteMany();
  await prisma.caseCard.deleteMany();
  await prisma.partnerCardBullet.deleteMany();
  await prisma.partnerCard.deleteMany();
  await prisma.personnelCard.deleteMany();
  await prisma.psiCardBullet.deleteMany();
  await prisma.psiCard.deleteMany();

  for (const card of personnelCards) {
    await prisma.personnelCard.create({
      data: {
        displayOrder: card.displayOrder,
        registryId: card.registryId,
        fullName: card.fullName,
        role: card.role,
        status: card.status,
      },
    });
  }

  for (const card of caseCards) {
    await prisma.caseCard.create({
      data: {
        displayOrder: card.displayOrder,
        title: card.title,
        meta: card.meta,
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

  for (const card of partnerCards) {
    await prisma.partnerCard.create({
      data: {
        displayOrder: card.displayOrder,
        title: card.title,
        titleHref: card.titleHref ?? null,
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
