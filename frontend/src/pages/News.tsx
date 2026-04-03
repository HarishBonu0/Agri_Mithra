import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Tags } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

const categories = ["news.all", "news.crops", "news.market", "news.policy", "news.technology"];

type NewsCategory = "news.crops" | "news.market" | "news.policy" | "news.technology";

type NewsArticle = {
  title: string;
  summary: string;
  url: string;
  image?: string;
  source: string;
  publishedAt: string;
  category: NewsCategory;
};

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
];

const categoryKeywords: Record<NewsCategory, string[]> = {
  "news.crops": ["crop", "harvest", "seed", "yield", "paddy", "wheat", "rice", "maize"],
  "news.market": ["price", "market", "mandi", "export", "import", "commodity", "trade"],
  "news.policy": ["government", "policy", "scheme", "subsidy", "msp", "ministry", "insurance"],
  "news.technology": ["technology", "ai", "drone", "sensor", "irrigation", "startup", "innovation"],
};

const inferCategory = (text: string): NewsCategory => {
  const normalized = text.toLowerCase();

  if (categoryKeywords["news.policy"].some((keyword) => normalized.includes(keyword))) {
    return "news.policy";
  }
  if (categoryKeywords["news.market"].some((keyword) => normalized.includes(keyword))) {
    return "news.market";
  }
  if (categoryKeywords["news.technology"].some((keyword) => normalized.includes(keyword))) {
    return "news.technology";
  }
  return "news.crops";
};

const isAgricultureRelated = (text: string): boolean => {
  const normalized = text.toLowerCase();
  return AGRI_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const getRelativeTime = (isoDate: string): string => {
  const publishedMs = new Date(isoDate).getTime();
  if (Number.isNaN(publishedMs)) {
    return "time unknown";
  }

  const diffMs = Date.now() - publishedMs;
  const minutes = Math.max(1, Math.floor(diffMs / 60000));

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

export default function News() {
  const { t } = useI18n();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("news.all");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedCount, setFetchedCount] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchNews = async () => {
      const controller = new AbortController();
      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      if (!apiKey) {
        setError("Missing VITE_NEWS_API_KEY in frontend/.env");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const keywordQuery = encodeURIComponent("(agriculture OR farming OR farmer OR crop OR agritech OR irrigation OR livestock)");
        const agricultureDomains = encodeURIComponent("agriculture.com,agriland.ie,farmprogress.com,agri-pulse.com,thecattlesite.com");

        const primaryUrl = `https://newsapi.org/v2/everything?q=${keywordQuery}&searchIn=title,description&language=en&sortBy=publishedAt&pageSize=50&apiKey=${apiKey}`;
        const domainUrl = `https://newsapi.org/v2/everything?domains=${agricultureDomains}&language=en&sortBy=publishedAt&pageSize=50&apiKey=${apiKey}`;

        const [primaryRes, domainRes] = await Promise.all([
          fetch(primaryUrl, { signal: controller.signal }),
          fetch(domainUrl, { signal: controller.signal }),
        ]);

        if (!primaryRes.ok) {
          throw new Error(`News API request failed with status ${primaryRes.status}`);
        }

        if (!domainRes.ok) {
          throw new Error(`News API request failed with status ${domainRes.status}`);
        }

        const [primaryPayload, domainPayload] = await Promise.all([primaryRes.json(), domainRes.json()]);

        const combinedArticles = [
          ...(primaryPayload.articles ?? []),
          ...(domainPayload.articles ?? []),
        ];

        setFetchedCount(combinedArticles.length);

        const seen = new Set<string>();
        const liveArticles: NewsArticle[] = combinedArticles
          .filter((item: any) => item?.title && item?.url && item?.publishedAt)
          .filter((item: any) => {
            if (seen.has(item.url)) {
              return false;
            }
            seen.add(item.url);
            return true;
          })
          .map((item: any) => {
            const text = `${item.title ?? ""} ${item.description ?? ""} ${item.content ?? ""}`;
            return {
              title: item.title,
              summary: item.description || "No summary available.",
              url: item.url,
              image: item.urlToImage,
              source: item.source?.name || "Unknown source",
              publishedAt: item.publishedAt,
              category: inferCategory(text),
            };
          })
          .filter((item) => isAgricultureRelated(`${item.title} ${item.summary}`))
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        setMatchedCount(liveArticles.length);
        setArticles(liveArticles);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message || "Unable to fetch live news");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();

    const refreshHandle = window.setInterval(() => {
      fetchNews();
    }, 5 * 60 * 1000);

    return () => {
      window.clearInterval(refreshHandle);
    };
  }, [isLoggedIn]);

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
      {!loading && !error && (
        <p className="text-xs text-muted-foreground">
          Fetched {fetchedCount} live articles, showing {matchedCount} agriculture-related articles.
        </p>
      )}

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

      {loading && <p className="text-sm text-muted-foreground">Loading live agriculture news...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No live agriculture news found for this category.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((article, i) => (
          <motion.article
            key={article.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className="group glass-card-hover overflow-hidden cursor-pointer border border-white/40 hover:border-primary/30 rounded-2xl hover:shadow-lg transition-all"
          >
            <a href={article.url} target="_blank" rel="noreferrer" className="block">
              <div className="h-32 bg-muted/50 flex items-center justify-center text-5xl group-hover:scale-110 transition duration-300 overflow-hidden">
                {article.image ? (
                  <img src={article.image} alt={article.title} className="h-full w-full object-cover" />
                ) : (
                  <span>📰</span>
                )}
              </div>
            </a>
            <div className="p-5">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                {t(article.category)}
              </span>
              <h3 className="font-heading font-semibold text-foreground mt-2 text-sm leading-snug group-hover:text-primary transition">
                {article.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{article.summary}</p>
              <p className="text-[11px] text-muted-foreground mt-2">
                {article.source} • {getRelativeTime(article.publishedAt)}
              </p>
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 text-xs font-semibold text-primary inline-flex items-center gap-1.5 hover:scale-[1.05] transition-transform"
              >
                {t("news.read_more")}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
