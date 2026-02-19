import RetroLink from "@/components/RetroLink";
import { casesPageData } from "@/content/cases";
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

        <div className="case-block">
          <h3>{casesPageData.firstCase.title}</h3>
          <p className="meta">{casesPageData.firstCase.meta}</p>
          <p>
            {casesPageData.firstCase.opening}. {casesPageData.firstCase.finding}.
          </p>

          <ul>
            {casesPageData.firstCase.bullets.map((bullet, index) => (
              <li key={`legacy-case-1-bullet-${index}`}>{bullet}</li>
            ))}
          </ul>

          <p>{casesPageData.firstCase.postText}</p>

          <ul>
            {casesPageData.firstCase.archiveBullets.map((bullet, index) => (
              <li key={`legacy-case-1-archive-${index}`}>{bullet}</li>
            ))}
          </ul>

          <p>{casesPageData.firstCase.inspector}</p>
        </div>

        <div className="case-block">
          <h3>{casesPageData.secondCase.title}</h3>
          <p className="meta">{casesPageData.secondCase.meta}</p>
          <p>{casesPageData.secondCase.intro}</p>

          <ul>
            {casesPageData.secondCase.bullets.map((bullet, index) => (
              <li key={`legacy-case-2-bullet-${index}`}>{bullet}</li>
            ))}
          </ul>

          <p>{casesPageData.secondCase.medical}</p>

          <ul>
            {casesPageData.secondCase.followUpBullets.map((bullet, index) => (
              <li key={`legacy-case-2-followup-${index}`}>{bullet}</li>
            ))}
          </ul>

          <p>{casesPageData.secondCase.inspector}</p>

          {casesPageData.secondCase.closing.map((closingEntry, index) => (
            <p key={`legacy-case-2-closing-${index}`}>{closingEntry}</p>
          ))}
        </div>

        <div className="notice">{casesPageData.notice}</div>

        <div className="back-link">
          <RetroLink href="/">← Вернуться на главную страницу</RetroLink>
        </div>
      </section>
    );
  }
}
