import RetroLink from "@/components/RetroLink";
import { listPersonnelCards } from "@/lib/personnel-data";

export const dynamic = "force-dynamic";

export default async function PersonnelPage() {
  try {
    const cards = await listPersonnelCards();

    return (
      <section className="page content">
        <h2>Кадровый реестр</h2>

        <table className="registry">
          <thead>
            <tr>
              <th>ID</th>
              <th>ФИО</th>
              <th>Должность</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.registryId}</td>
                <td>{entry.fullName}</td>
                <td>{entry.role}</td>
                <td>{entry.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="back-link">
          <RetroLink href="/">← Вернуться в главное меню</RetroLink>
        </div>
      </section>
    );
  } catch {
    return (
      <section className="page content">
        <h2>Кадровый реестр</h2>
        <div className="notice">Модуль базы данных недоступен. Проверьте `DATABASE_URL` и миграции Prisma.</div>
        <div className="back-link">
          <RetroLink href="/">← Вернуться в главное меню</RetroLink>
        </div>
      </section>
    );
  }
}
