import Redacted from "@/components/Redacted";
import RetroLink from "@/components/RetroLink";
import { psiPageData } from "@/content/psi";

function renderIntroText(text: string) {
  if (text.includes("аномальных / необъяснимых")) {
    return (
      <>
        Частное лицо. В настоящее время осуществляет деятельность, связанную с документированием и публичным освещением{" "}
        <Redacted>аномальных / необъяснимых</Redacted> явлений (онлайн-платформа).
      </>
    );
  }

  if (text.includes("аномальных артефактов")) {
    return (
      <>
        Сотрудник Исследовательского Центра Пу Сунлин, ассистент Главного Хранителя коллекции{" "}
        <Redacted>аномальных артефактов</Redacted>.
      </>
    );
  }

  if (text.includes("неустановленного происхождения")) {
    return (
      <>
        Независимый паранормальный консультант. Владелец магазина по продаже предметов{" "}
        <Redacted>неустановленного происхождения</Redacted>.
      </>
    );
  }

  if (text.includes("[ДАННЫЕ УДАЛЕНЫ]")) {
    return (
      <>
        Сотрудник юридической фирмы <Redacted>[ДАННЫЕ УДАЛЕНЫ]</Redacted>.
      </>
    );
  }

  return text;
}

export default function PsiPage() {
  const { entries, notice, title } = psiPageData;

  return (
    <section className="page content">
      <h2>{title}</h2>

      {entries.map((entry) => (
        <div className="psi-block" key={entry.name}>
          <h3>
            {entry.nameHref ? (
              <RetroLink className="inline-link" href={entry.nameHref}>
                {entry.name}
              </RetroLink>
            ) : (
              entry.name
            )}
          </h3>

          <p className="meta">{entry.meta}</p>
          <p>{renderIntroText(entry.intro)}</p>

          <ul>
            {entry.bullets.map((bullet) => {
              if (bullet.includes("#SCU-19-███") && entry.name.includes("Кан Сонхи")) {
                if (bullet.includes("подозреваемой")) {
                  return (
                    <li key={bullet}>
                      В [202█-11-04] проходила по делу <RetroLink href="/cases">#SCU-19-███</RetroLink> в качестве
                      подозреваемой. Ввиду отсутствия доказательной базы была оправдана.
                    </li>
                  );
                }

                return (
                  <li key={bullet}>
                    В [202█-10-29] проходила как потерпевшая деле <RetroLink href="/cases">#SCU-19-███</RetroLink>.
                  </li>
                );
              }

              if (bullet.includes("неустановленного происхождения")) {
                return (
                  <li key={bullet}>
                    Работает в магазине, специализирующемся на торговле предметами{" "}
                    <Redacted>неустановленного происхождения</Redacted>.
                  </li>
                );
              }

              if (bullet.includes("неопределённый")) {
                return (
                  <li key={bullet}>
                    Уровень угрозы на данный момент классифицируется как <Redacted>неопределённый</Redacted>.
                  </li>
                );
              }

              return <li key={bullet}>{bullet}</li>;
            })}
          </ul>

          <p className="conclusion">
            <strong>{entry.conclusion.split(":")[0]}:</strong> {entry.conclusion.split(":")[1]?.trim()}
          </p>
        </div>
      ))}

      <div className="notice">{notice}</div>

      <div className="back-link">
        <RetroLink href="/">← Вернуться в главное меню</RetroLink>
      </div>
    </section>
  );
}
