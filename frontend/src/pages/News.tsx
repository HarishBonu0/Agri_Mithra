import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Tags } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

const categories = ["news.all", "news.crops", "news.market", "news.policy", "news.technology"];

type NewsCategory = "news.crops" | "news.market" | "news.policy" | "news.technology";

type NewsArticle = {
  title: string;
  summary: string;
  url?: string;
  source?: string;
  category?: NewsCategory;
  publishedAt?: string;
};

const inferCategory = (text: string): NewsCategory => {
  const normalized = text.toLowerCase();
  if (/(policy|government|scheme|subsidy|msp)/.test(normalized)) return "news.policy";
  if (/(price|market|mandi|export|import)/.test(normalized)) return "news.market";
  if (/(technology|ai|drone|sensor|innovation)/.test(normalized)) return "news.technology";
  return "news.crops";
};

const getRelativeTime = (isoDate?: string): string => {
  if (!isoDate) return "recent";
  const publishedMs = new Date(isoDate).getTime();
  if (Number.isNaN(publishedMs)) return "recent";

  const diffMs = Date.now() - publishedMs;
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

export default function News() {
  const { t } = useI18n();
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("news.all");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      setLoading(false);
      return;
    }

    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.news.list(token);
        const normalized = (response.data || []).map((item: any) => {
          const text = `${item.title || ""} ${item.summary || ""}`;
          return {
            title: item.title || "Untitled",
            summary: item.summary || "No summary available",
            url: item.url || "",
            source: item.source || "AgriNews",
            category: item.category || inferCategory(text),
            publishedAt: item.publishedAt || new Date().toISOString(),
          } as NewsArticle;
        });

        setArticles(normalized);
      } catch (err: any) {
        setError(err.message || "Unable to fetch live news");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [isLoggedIn, token]);

  const filtered = useMemo(() => {
    return active === "news.all" ? articles : articles.filter((a) => a.category === active);
  }, [active, articles]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center h-[300px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-4">Login Required</p>
          <p className="text-muted-foreground mb-6">Please login to access News</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:scale-105 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-7">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("news.title")}</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 inline-flex items-center gap-1.5 ${
              active === cat
                ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg"
                : "bg-white/70 backdrop-blur-lg shadow-md text-muted-foreground hover:bg-white hover:scale-[1.02]"
            }`}
          >
            <Tags className="h-3.5 w-3.5" />
            {t(cat)}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading agriculture news...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No agriculture news found for this category.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((article, i) => (
          <motion.article
            key={`${article.title}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className="group glass-card-hover overflow-hidden cursor-pointer border border-white/40 hover:border-primary/30 rounded-2xl hover:shadow-lg transition-all"
          >
            <div className="p-5">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                {t(article.category || "news.crops")}
              </span>
              <h3 className="font-heading font-semibold text-foreground mt-2 text-sm leading-snug group-hover:text-primary transition">
                {article.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3">{article.summary}</p>
              <p className="text-[11px] text-muted-foreground mt-2">
                {article.source || "AgriNews"} • {getRelativeTime(article.publishedAt)}
              </p>
              {article.url && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 text-xs font-semibold text-primary inline-flex items-center gap-1.5 hover:scale-[1.05] transition-transform"
                >
                  {t("news.read_more")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
