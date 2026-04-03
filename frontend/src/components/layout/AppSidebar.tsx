import { LayoutDashboard, Scan, MessageSquare, Newspaper } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useI18n } from "@/lib/i18n";

const navItems = [
  { key: "nav.dashboard", url: "/", icon: LayoutDashboard },
  { key: "nav.assistant", url: "/assistant", icon: Scan },
  { key: "nav.schemes", url: "/schemes", icon: MessageSquare },
  { key: "nav.news", url: "/news", icon: Newspaper },
];

export function AppSidebar() {
  const { t } = useI18n();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar min-h-screen p-4 gap-1">
      <div className="flex items-center gap-2.5 px-3 py-4 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-heading font-bold text-sm">E&E</span>
        </div>
        <span className="font-heading font-semibold text-lg text-foreground">Earth & Ether</span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent"
            activeClassName="bg-sidebar-accent text-primary font-medium"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-sm">{t(item.key)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
