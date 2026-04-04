import { LayoutDashboard, Scan, MessageSquare, Newspaper, Bot, Shield } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

const navItems = [
  { key: "nav.dashboard", url: "/dashboard", icon: LayoutDashboard },
  { key: "nav.assistant", url: "/assistant", icon: Scan },
  { key: "nav.schemes", url: "/schemes", icon: MessageSquare },
  { key: "nav.news", url: "/news", icon: Newspaper },
  { key: "nav.aiAssistant", url: "/ai-assistant", icon: Bot },
];

export function BottomNav() {
  const { t } = useI18n();
  const { isAdmin } = useAuth();
  const items = isAdmin ? [...navItems, { key: "nav.admin", url: "/admin", icon: Shield }] : navItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/dashboard"}
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
