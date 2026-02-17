import RetroLink from "@/components/RetroLink";
import { listPsiCards } from "@/lib/psi-data";
import { renderRichDoc } from "@/lib/psi-richtext";

export const dynamic = "force-dynamic";

const PAGE_TITLE = "Лица особого интереса";
const PAGE_NOTICE =
  "Данный перечень подлежит регулярному пересмотру. Уровень угрозы и статус лиц могут быть изменены без предварительного уведомления.";

function buildMeta(age: number | null, citizenship: string, status: string): string {
  const ageValue = age === null ? "неизвестен" : String(age);
  return `Возраст: ${ageValue} | Гражданство: ${citizenship} | Статус: ${status}`;
}

function resolvePhotoUrl(photoPath: string | null): string | null {
  if (!photoPath) {
    return null;
  }
  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
    return photoPath;
  }
  if (photoPath.startsWith("psi/")) {
    return `/api/media/psi/${encodeURIComponent(photoPath.slice(4))}`;
  }
  return null;
}

export default async function PsiPage() {
  try {
    const cards = await listPsiCards();

    return (
      <section className="page content">
        <h2>{PAGE_TITLE}</h2>

        {cards.map((card) => {
          const photoUrl = resolvePhotoUrl(card.photoPath);

          return (
            <div className="psi-block psi-record" key={card.id}>
              <div className="psi-record-head">
                <h3>
                  {card.nameHref ? (
                    <RetroLink className="inline-link" href={card.nameHref}>
                      {card.name}
                    </RetroLink>
                  ) : (
                    card.name
                  )}
                </h3>
                <p className="meta">{buildMeta(card.age, card.citizenship, card.status)}</p>
              </div>

              <div className="psi-record-body">
                <div className="psi-photo-wrap">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="psi-photo" src={photoUrl} alt={card.photoAlt || card.name} loading="lazy" />
                  ) : (
                    <div className="psi-photo-empty">NO IMAGE</div>
                  )}
                </div>

                <div className="psi-record-content">
                  <div className="rich-block">{renderRichDoc(card.introDoc, "public", `intro-${card.id}`)}</div>

                  <ul>
                    {card.bullets.map((bullet) => (
                      <li key={bullet.id}>{renderRichDoc(bullet.contentDoc, "public", `bullet-${bullet.id}`)}</li>
                    ))}
                  </ul>

                  <div className="conclusion rich-block">{renderRichDoc(card.conclusionDoc, "public", `conclusion-${card.id}`)}</div>
                </div>
              </div>
            </div>
          );
        })}

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
        <div className="notice">Модуль базы данных недоступен. Проверьте `DATABASE_URL` и миграции Prisma.</div>
        <div className="back-link">
          <RetroLink href="/">← Вернуться в главное меню</RetroLink>
        </div>
      </section>
    );
  }
}
