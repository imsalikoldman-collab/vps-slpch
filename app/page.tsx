import RetroLink from "@/components/RetroLink";
import { navItems } from "@/content/nav";

export default function HomePage() {
  return (
    <section className="page home-page">
      <div className="menu">
        {navItems.map((item) => (
          <RetroLink key={item.key} className="menu-item" href={item.href}>
            {item.label}
          </RetroLink>
        ))}
      </div>
    </section>
  );
}
