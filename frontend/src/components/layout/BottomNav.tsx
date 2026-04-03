import { LayoutDashboard, Scan, MessageSquare, Newspaper } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useI18n } from "@/lib/i18n";

const navItems = [
  { key: "nav.dashboard", url: "/", icon: LayoutDashboard },
  { key: "nav.assistant", url: "/assistant", icon: Scan },
  { key: "nav.schemes", url: "/schemes", icon: MessageSquare },
  { key: "nav.news", url: "/news", icon: Newspaper },
];

export function BottomNav() {
  const { t } = useI18n();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t(item.key)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
