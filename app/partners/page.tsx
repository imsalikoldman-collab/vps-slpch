import Redacted from "@/components/Redacted";
import RetroLink from "@/components/RetroLink";
import { partnersPageData } from "@/content/partners";

export default function PartnersPage() {
  const { center, consultant, notice, title } = partnersPageData;

  return (
    <section className="page content">
      <h2>{title}</h2>
      <div className="migration-badge">Раздел в режиме миграции. Данные будут перенесены в админ-панель.</div>

      <div className="partner-block">
        <h3>{center.title}</h3>

        <p>
          {center.intro} <Redacted>███████</Redacted>, КНР.
        </p>

        <ul>
          <li>
            Объекты, классифицированные как <strong>потенциально опасные аномальные предметы</strong>, подлежат передаче в
            Центр в кратчайшие сроки.
          </li>
          <li>
            Центр сохраняет право истребовать любой объект, признанный <strong>не представляющим непосредственной угрозы</strong>,
            при условии, что все необходимые экспертизы были <Redacted>проведены / зафиксированы / одобрены</Redacted>.
          </li>
        </ul>
      </div>

      <div className="partner-block">
        <h3>
          <RetroLink className="inline-link" href="/psi">
            {consultant.title}
          </RetroLink>
        </h3>

        <p>{consultant.intro}</p>

        <ul>
          <li>
            Контакт допускается <strong>исключительно</strong> в случаях, когда задействованные аномальные объекты или явления
            представляют <Redacted>непосредственную угрозу</Redacted> гражданскому населению и/или сотрудникам SCU.
          </li>
          <li>
            Обращение допустимо только при условии, что стандартные протоколы SCU признаны <Redacted>недостаточными</Redacted>, а
            меры локализации — <Redacted>невозможными</Redacted>.
          </li>
        </ul>
      </div>

      <div className="notice">{notice}</div>

      <div className="back-link">
        <RetroLink href="/">← Вернуться в главное меню</RetroLink>
      </div>
    </section>
  );
}
