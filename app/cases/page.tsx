import RetroLink from "@/components/RetroLink";
import { listCaseCards } from "@/lib/cases-data";
import { renderRichDoc } from "@/lib/psi-richtext";

export const dynamic = "force-dynamic";

const PAGE_TITLE = "Архив материалов дел";
const PAGE_NOTICE =
  "Некоторые материалы архива могут быть частично недоступны в зависимости от уровня допуска.";

export default async function CasesPage() {
  try {
    const cards = await listCaseCards();

    return (
      <section className="page content">
        <h2>{PAGE_TITLE}</h2>

        {cards.map((card) => (
          <div className="case-block" key={card.id}>
            <h3>{card.title}</h3>
            <p className="meta">{card.meta}</p>

            <div className="rich-block">{renderRichDoc(card.introDoc, "public", `cases-intro-${card.id}`)}</div>

            <ul>
              {card.bullets.map((bullet) => (
                <li key={bullet.id}>{renderRichDoc(bullet.contentDoc, "public", `cases-bullet-${bullet.id}`)}</li>
              ))}
            </ul>

            <div className="rich-block">{renderRichDoc(card.conclusionDoc, "public", `cases-conclusion-${card.id}`)}</div>
          </div>
        ))}

        <div className="notice">{PAGE_NOTICE}</div>

        <div className="back-link">
          <RetroLink href="/">← Вернуться на главную страницу</RetroLink>
        </div>
      </section>
    );
  } catch {
    return (
      <section className="page content">
        <h2>{PAGE_TITLE}</h2>
        <div className="notice">Модуль базы данных недоступен. Проверьте `DATABASE_URL` и миграции Prisma.</div>
        <div className="back-link">
          <RetroLink href="/">← Вернуться на главную страницу</RetroLink>
        </div>
      </section>
    );
  }
}
