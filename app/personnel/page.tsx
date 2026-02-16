import RetroLink from "@/components/RetroLink";
import { personnelEntries } from "@/content/personnel";

export default function PersonnelPage() {
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
          {personnelEntries.map((entry) => (
            <tr key={`${entry.fullName}-${entry.role}`}>
              <td>{entry.id}</td>
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
}
