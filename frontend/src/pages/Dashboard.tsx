import { Scan, Search, Newspaper, Sprout, TrendingUp, Wheat, Plus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { WeatherWidget } from "@/components/WeatherWidget";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
};

export default function Dashboard() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    { key: "dashboard.scanCrop", icon: Scan, color: "bg-primary/10 text-primary", to: "/assistant" },
    { key: "dashboard.findScheme", icon: Search, color: "bg-secondary/10 text-secondary", to: "/schemes" },
    { key: "dashboard.viewNews", icon: Newspaper, color: "bg-accent/10 text-accent", to: "/news" },
  ];

  const crops = [
    { nameKey: "dashboard.cropRice", icon: Sprout, statusKey: "dashboard.statusHealthy", growth: 72 },
    { nameKey: "dashboard.cropCotton", icon: Wheat, statusKey: "dashboard.statusNeedsWater", growth: 45 },
    { nameKey: "dashboard.cropTomato", icon: TrendingUp, statusKey: "dashboard.statusHealthy", growth: 88 },
  ];

  const hasCrops = crops.length > 0;

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
            {user?.name
              ? t("dashboard.greetingName", { name: user.name })
              : t("dashboard.greetingFallback")} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t("dashboard.subtitle")}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{t("dashboard.logout")}</span>
        </button>
      </motion.div>

      {/* Weather + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp} className="md:col-span-1">
          <WeatherWidget />
        </motion.div>

        <motion.div initial="hidden" animate="show" custom={2} variants={fadeUp} className="md:col-span-2">
          <div className="glass-card p-6">
            <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-5">{t("dashboard.quickActions")}</h3>
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

      {/* Crops Section */}
      <motion.div initial="hidden" animate="show" custom={3} variants={fadeUp}>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-semibold text-sm text-muted-foreground">{t("dashboard.crops")}</h3>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition">
              <Plus className="h-3.5 w-3.5" />
              {t("dashboard.addCrop")}
            </button>
          </div>

          {!hasCrops ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sprout className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{t("dashboard.no_crops")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("dashboard.noCropsHint")}</p>
              </div>
              <button className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-lg hover:scale-105 transition">
                <Plus className="h-4 w-4" />
                {t("dashboard.addCrop")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {crops.map((crop) => (
                <div
                  key={crop.nameKey}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition">
                    <crop.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground">{t(crop.nameKey)}</span>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          crop.statusKey === "dashboard.statusHealthy"
                            ? "bg-primary/10 text-primary"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {t(crop.statusKey)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                        style={{ width: `${crop.growth}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{t("dashboard.growth", { value: crop.growth })}</div>
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
