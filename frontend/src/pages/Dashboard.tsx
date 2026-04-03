import { Scan, Search, BarChart3, FlaskConical, Sprout, TrendingUp, Wheat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { WeatherWidget } from "@/components/WeatherWidget";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } }),
};

export default function Dashboard() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const quickActions = [
    { key: "dashboard.scan_crop", icon: Scan, color: "bg-primary/10 text-primary", to: "/assistant" },
    { key: "dashboard.find_scheme", icon: Search, color: "bg-accent/10 text-accent", to: "/schemes" },
    { key: "dashboard.market_price", icon: BarChart3, color: "bg-blue-50 text-blue-600", to: "/" },
    { key: "dashboard.soil_test", icon: FlaskConical, color: "bg-amber-50 text-amber-600", to: "/" },
  ];

  const crops = [
    { name: "Rice", icon: Sprout, status: "Healthy", growth: 72 },
    { name: "Cotton", icon: Wheat, status: "Needs Water", growth: 45 },
    { name: "Tomato", icon: TrendingUp, status: "Healthy", growth: 88 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Decorative blobs */}
      <div className="gradient-blob w-64 h-64 bg-primary/30 -top-20 -right-20 fixed" />
      <div className="gradient-blob w-48 h-48 bg-accent/20 top-1/2 -left-10 fixed" />

      <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp}>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          {t("dashboard.welcome")} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your farm today.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp} className="md:col-span-1">
          <WeatherWidget />
        </motion.div>

        <motion.div initial="hidden" animate="show" custom={2} variants={fadeUp} className="md:col-span-2">
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-4">{t("dashboard.quick_actions")}</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.key}
                  onClick={() => navigate(action.to)}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/50 transition-all duration-200 hover:bg-muted hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{t(action.key)}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial="hidden" animate="show" custom={3} variants={fadeUp}>
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-4">{t("dashboard.crops")}</h3>
          <div className="space-y-3">
            {crops.map((crop) => (
              <div key={crop.name} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <crop.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{crop.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      crop.status === "Healthy" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                    }`}>
                      {crop.status}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${crop.growth}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
