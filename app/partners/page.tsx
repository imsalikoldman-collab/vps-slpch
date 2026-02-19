import RetroLink from "@/components/RetroLink";
import { partnersPageData } from "@/content/partners";
import { listPartnerCards } from "@/lib/partners-data";
import { renderRichDoc } from "@/lib/psi-richtext";

export const dynamic = "force-dynamic";

const PAGE_TITLE = "Сотрудничающие организации";
const PAGE_NOTICE =
  "Настоящий перечень не является исчерпывающим. Некоторые партнёрские структуры и физические лица намеренно исключены из данной версии документа.";

export default async function PartnersPage() {
  try {
    const cards = await listPartnerCards();

    return (
      <section className="page content">
        <h2>{PAGE_TITLE}</h2>

        {cards.map((card) => (
          <div className="partner-block" key={card.id}>
            <h3>
              {card.titleHref ? (
                <RetroLink className="inline-link" href={card.titleHref}>
                  {card.title}
                </RetroLink>
              ) : (
                card.title
              )}
            </h3>

            <div className="rich-block">{renderRichDoc(card.introDoc, "public", `partners-intro-${card.id}`)}</div>

            <ul>
              {card.bullets.map((bullet) => (
                <li key={bullet.id}>{renderRichDoc(bullet.contentDoc, "public", `partners-bullet-${bullet.id}`)}</li>
              ))}
            </ul>

            <div className="rich-block">{renderRichDoc(card.conclusionDoc, "public", `partners-conclusion-${card.id}`)}</div>
          </div>
        ))}

        <div className="notice">{PAGE_NOTICE}</div>

        <div className="back-link">
          <RetroLink href="/">← Вернуться в главное меню</RetroLink>
        </div>
      </section>
    );
  } catch {
    return (
      <section className="page content">
        <h2>{PAGE_TITLE}</h2>

        {[partnersPageData.center, partnersPageData.consultant].map((card, index) => (
          <div className="partner-block" key={`legacy-partner-${index}`}>
            <h3>{card.title}</h3>
            <p>{card.intro}</p>

            <ul>
              {card.bullets.map((bullet, bulletIndex) => (
                <li key={`legacy-partner-${index}-bullet-${bulletIndex}`}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}

        <div className="notice">{partnersPageData.notice}</div>

        <div className="back-link">
          <RetroLink href="/">← Вернуться в главное меню</RetroLink>
        </div>
      </section>
    );
  }
}
