import { Search, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function TopNavbar() {
  const { lang, setLang, t } = useI18n();

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 md:hidden">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-heading font-bold text-xs">E&E</span>
        </div>
        <span className="font-heading font-semibold text-foreground">Earth & Ether</span>
      </div>

      <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 w-72">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={t("search.placeholder")}
          className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setLang(lang === "en" ? "te" : "en")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <Globe className="h-4 w-4" />
          <span>{lang === "en" ? "EN" : "తె"}</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
          <span className="text-primary text-xs font-semibold">R</span>
        </div>
      </div>
    </header>
  );
}
