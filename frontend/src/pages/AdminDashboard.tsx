import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Database, RefreshCw, Server, ShieldCheck, Newspaper } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

type HealthPayload = {
  status?: string;
  db?: string;
};

type HeadlinesPayload = {
  count?: number;
  articles?: Array<unknown>;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

export default function AdminDashboard() {
  const { t, lang } = useI18n();
  const { isLoggedIn, isAdmin, token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [newsCount, setNewsCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    if (!isAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const fetchAdminMetrics = async () => {
      setLoading(true);
      const langParam = lang === "te" ? "te" : "en";
      const regionParam = langParam === "te" ? "ap" : "global";

      try {
        const [healthRes, newsRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/health`),
          fetch(`${API_BASE_URL}/api/news/headlines?limit=12&lang=${langParam}&region=${regionParam}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
        ]);

        if (healthRes.status === "fulfilled" && healthRes.value.ok) {
          setHealth((await healthRes.value.json()) as HealthPayload);
        } else {
          setHealth(null);
        }

        if (newsRes.status === "fulfilled" && newsRes.value.ok) {
          const payload = (await newsRes.value.json()) as HeadlinesPayload;
          setNewsCount(typeof payload.count === "number" ? payload.count : payload.articles?.length ?? 0);
        } else {
          setNewsCount(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminMetrics();
  }, [isLoggedIn, isAdmin, lang, navigate, token]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center h-[300px]">
        <p className="text-lg font-semibold text-foreground">{t("auth.login_required")}</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium"
        >
          {t("auth.go_to_login")}
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const backendUp = health?.status === "ok";
  const dbUp = health?.db === "connected";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-bold text-foreground inline-flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-primary" />
          {t("nav.admin")}
        </h1>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={<Server className="h-5 w-5 text-primary" />}
          title="Backend"
          value={loading ? "..." : backendUp ? "Healthy" : "Unavailable"}
        />
        <MetricCard
          icon={<Database className="h-5 w-5 text-primary" />}
          title="Database"
          value={loading ? "..." : dbUp ? "Connected" : "Disconnected"}
        />
        <MetricCard
          icon={<Newspaper className="h-5 w-5 text-primary" />}
          title="News"
          value={loading ? "..." : newsCount == null ? "No data" : String(newsCount)}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <p className="text-sm text-muted-foreground">Route: /admin</p>
        <p className="text-sm text-muted-foreground mt-1">Access: Admin credentials only</p>
      </motion.div>
    </div>
  );
}

function MetricCard({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
    </div>
  );
}
