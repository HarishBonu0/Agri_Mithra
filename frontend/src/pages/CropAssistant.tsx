import { useState } from "react";
import { Upload, Mic, Leaf, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";

type Phase = "upload" | "analyzing" | "result";

export default function CropAssistant() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>("upload");

  const handleUpload = () => {
    setPhase("analyzing");
    setTimeout(() => setPhase("result"), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{t("assistant.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("assistant.upload")}</p>
      </div>

      <AnimatePresence mode="wait">
        {phase === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div
              onClick={handleUpload}
              className="glass-card-hover rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer border-2 border-dashed border-border hover:border-primary/40 transition-colors min-h-[240px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center">{t("assistant.drag")}</p>
            </div>

            <button className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-muted text-foreground font-medium text-sm transition-all hover:bg-secondary active:scale-[0.98]">
              <Mic className="h-4 w-4" />
              {t("assistant.voice")}
            </button>
          </motion.div>
        )}

        {phase === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl p-10 flex flex-col items-center gap-4 min-h-[240px] justify-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center pulse-gentle">
              <Leaf className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">{t("assistant.analyzing")}</p>
            <div className="w-48 h-2 rounded-full overflow-hidden bg-muted">
              <div className="h-full bg-primary rounded-full shimmer" />
            </div>
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="glass-card rounded-2xl p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{t("assistant.disease")}</p>
                <p className="text-lg font-heading font-bold text-foreground">Leaf Blight</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium">{t("assistant.confidence")}</p>
                <p className="text-2xl font-heading font-bold text-primary mt-1">94%</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium">{t("assistant.risk")}</p>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldAlert className="h-5 w-5 text-risk-high" />
                  <span className="text-lg font-heading font-bold text-risk-high">High</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold text-foreground">{t("assistant.solution")}</p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-primary">•</span>Apply Mancozeb fungicide at 2.5g/litre</li>
                <li className="flex gap-2"><span className="text-primary">•</span>Remove infected leaves immediately</li>
                <li className="flex gap-2"><span className="text-primary">•</span>Ensure proper drainage in fields</li>
                <li className="flex gap-2"><span className="text-primary">•</span>Re-scan in 7 days to monitor progress</li>
              </ul>
            </div>

            <button
              onClick={() => setPhase("upload")}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm btn-glow active:scale-[0.98] transition-transform"
            >
              Scan Another Crop
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
