import { Sun, Droplets, Wind } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function WeatherWidget() {
  const { t } = useI18n();

  return (
    <div className="glass-card-hover rounded-xl p-5">
      <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-3">{t("dashboard.weather")}</h3>
      <div className="flex items-center gap-4">
        <Sun className="h-10 w-10 text-accent" />
        <div>
          <p className="text-3xl font-heading font-bold text-foreground">32°C</p>
          <p className="text-sm text-muted-foreground">{t("weather.sunny")}</p>
        </div>
      </div>
      <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Droplets className="h-3.5 w-3.5" /> 45%</span>
        <span className="flex items-center gap-1"><Wind className="h-3.5 w-3.5" /> 12 km/h</span>
      </div>
      <p className="mt-3 text-xs bg-accent/10 text-accent-foreground px-3 py-1.5 rounded-md font-medium">
        💡 {t("weather.recommendation")}
      </p>
    </div>
  );
}
