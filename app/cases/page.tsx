import Redacted from "@/components/Redacted";
import RetroLink from "@/components/RetroLink";
import { casesPageData } from "@/content/cases";

export default function CasesPage() {
  const { firstCase, notice, secondCase, title } = casesPageData;

  return (
    <section className="page content">
      <h2>{title}</h2>

      <div className="case-block">
        <h3>{firstCase.title}</h3>
        <p className="meta">{firstCase.meta}</p>

        <p>
          {firstCase.opening} <Redacted>[ДАННЫЕ УДАЛЕНЫ]</Redacted>.
        </p>

        <ul>
          <li>
            {firstCase.finding} <RetroLink href="/psi">Кан Сонхи</RetroLink>.
          </li>
          {firstCase.bullets.map((bullet) => (
            <li key={bullet}>
              {bullet.includes("недостоверным") ? (
                <>
                  Заявление о том, что <strong>художественное изображение манифестировалось</strong>, совершило убийство и
                  доставило останки потерпевшей, признано <Redacted>недостоверным</Redacted>.
                </>
              ) : (
                bullet
              )}
            </li>
          ))}
        </ul>

        <p>{firstCase.postText}</p>

        <ul>
          {firstCase.archiveBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>

        <p className="footer-note">
          {firstCase.inspector} <Redacted>[ДАННЫЕ УДАЛЕНЫ]</Redacted>
        </p>
      </div>

      <div className="case-block">
        <h3>{secondCase.title}</h3>
        <p className="meta">{secondCase.meta}</p>

        <p>{secondCase.intro}</p>

        <ul>
          {secondCase.bullets.map((bullet) => (
            <li key={bullet}>
              {bullet.includes("неустановленного характера") ? (
                <>
                  Во время проведения несанкционированных съёмок группа подверглась нападению{" "}
                  <Redacted>неустановленного характера</Redacted>.
                </>
              ) : (
                bullet
              )}
            </li>
          ))}
        </ul>

        <p>{secondCase.medical}</p>

        <ul>
          {secondCase.followUpBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>

        <p className="footer-note">{secondCase.inspector}</p>

        {secondCase.closing.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="notice">{notice}</div>

      <div className="back-link">
        <RetroLink href="/">← Вернуться на главную страницу</RetroLink>
      </div>
    </section>
  );
}
