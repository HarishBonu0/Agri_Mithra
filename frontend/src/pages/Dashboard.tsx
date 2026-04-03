import { useEffect, useState } from "react";
import { Scan, Search, Newspaper, ExternalLink, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { WeatherWidget } from "@/components/WeatherWidget";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
};
const API_BASE_URL = "http://127.0.0.1:5000";

const AGRI_KEYWORDS = [
  "agriculture",
  "agricultural",
  "farming",
  "farmer",
  "farmers",
  "crop",
  "crops",
  "harvest",
  "irrigation",
  "soil",
  "fertilizer",
  "pesticide",
  "seed",
  "mandi",
  "msp",
  "kharif",
  "rabi",
  "agri",
  "livestock",
  "dairy",
  "horticulture",
  "aquaculture",
  "sericulture",
  "agronomy",
];

const IRRELEVANT_KEYWORDS = [
  "crypto",
  "bitcoin",
  "fifa",
  "world cup",
  "movie",
  "netflix",
  "honeymoon",
  "celebrity",
  "spacex ipo",
  "prediction market",
];

const isAgricultureRelated = (text: string): boolean => {
  const normalized = text.toLowerCase();
  const matchedKeywords = AGRI_KEYWORDS.filter((keyword) => normalized.includes(keyword));
  const strongSignal = ["agriculture", "farming", "crop", "irrigation", "livestock", "horticulture", "aquaculture", "dairy", "agri"]
    .some((keyword) => normalized.includes(keyword));

  return strongSignal || matchedKeywords.length >= 2;
};

const isIrrelevant = (text: string): boolean => {
  const normalized = text.toLowerCase();
  return IRRELEVANT_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

export default function Dashboard() {
  const { t, lang } = useI18n();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    { key: "dashboard.scan_crop", icon: Scan, color: "bg-primary/10 text-primary", to: "/assistant" },
    { key: "dashboard.find_scheme", icon: Search, color: "bg-secondary/10 text-secondary", to: "/schemes" },
    { key: "dashboard.view_news", icon: Newspaper, color: "bg-accent/10 text-accent", to: "/news" },
  ];

  const [headlines, setHeadlines] = useState<Array<{ title: string; source: string; url: string }>>([]);
  const [headlinesLoading, setHeadlinesLoading] = useState(true);
  const [headlinesError, setHeadlinesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestTopHeadlines = async () => {
      try {
        setHeadlinesLoading(true);
        setHeadlinesError(null);

        const apiLang = lang === "te" ? "te" : "en";
        const region = apiLang === "te" ? "ap" : "global";

        const response = await fetch(`${API_BASE_URL}/api/news/headlines?limit=5&lang=${apiLang}&region=${region}`);
        if (!response.ok) {
          throw new Error(`News API request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const top5 = payload.articles ?? [];

        setHeadlines(top5);
      } catch (err) {
        setHeadlinesError((err as Error).message || "Unable to load headlines");
      } finally {
        setHeadlinesLoading(false);
      }
    };

    fetchLatestTopHeadlines();
  }, [lang]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-8">
      {/* Header with logout */}
      <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            {t("dashboard.welcome")} 👋
          </h1>
          {user && <p className="text-muted-foreground text-sm mt-1">{t("dashboard.welcome").split(",")[0]}, {user.name}</p>}
          <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your farm today.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </motion.div>

      {/* Weather + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp} className="md:col-span-1">
          <WeatherWidget />
        </motion.div>

        <motion.div initial="hidden" animate="show" custom={2} variants={fadeUp} className="md:col-span-2">
          <div className="glass-card p-6">
            <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-5">{t("dashboard.quick_actions")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.key}
                  onClick={() => navigate(action.to)}
                  className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white hover:scale-105 hover:shadow-lg transition-all duration-300 active:scale-95 group"
                >
                  <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{t(action.key)}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Latest Headlines Section */}
      <motion.div initial="hidden" animate="show" custom={3} variants={fadeUp}>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-semibold text-sm text-muted-foreground">Latest Top 5 Headlines</h3>
            <button
              onClick={() => navigate("/news")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition"
            >
              {t("dashboard.view_news")}
            </button>
          </div>

          {headlinesLoading ? (
            <p className="text-sm text-muted-foreground">Loading latest headlines...</p>
          ) : headlinesError ? (
            <p className="text-sm text-destructive">{headlinesError}</p>
          ) : headlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No headlines available right now.</p>
          ) : (
            <div className="space-y-3">
              {headlines.map((headline, index) => (
                <div
                  key={headline.url}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <a
                        href={headline.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-foreground hover:text-primary hover:underline"
                      >
                        {index + 1}. {headline.title}
                      </a>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{headline.source}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
