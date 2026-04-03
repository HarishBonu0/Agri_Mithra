import { useState, useRef } from "react";
import { Upload, Mic, Leaf, AlertTriangle, CheckCircle2, ShieldAlert, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

type Phase = "upload" | "analyzing" | "result";

export default function CropAssistant() {
  const { t } = useI18n();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [phase, setPhase] = useState<Phase>("upload");
  const [hasImage, setHasImage] = useState(false);
  const [error, setError] = useState("");

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-[200px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-4">{t("auth.loginRequired")}</p>
          <p className="text-muted-foreground mb-6">{t("assistant.loginPrompt")}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:scale-105 transition"
          >
            {t("auth.goToLogin")}
          </button>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError(t("assistant.invalidImageType"));
      setHasImage(false);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t("assistant.invalidImageSize"));
      setHasImage(false);
      return;
    }

    setError("");
    setHasImage(true);
  };

  const handleAnalyze = () => {
    if (!hasImage) {
      setError(t("assistant.no_image"));
      return;
    }
    setPhase("analyzing");
    setTimeout(() => setPhase("result"), 2500);
  };

  const handleReset = () => {
    setPhase("upload");
    setHasImage(false);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-7">
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div
              onClick={() => fileInputRef.current?.click()}
              className="glass-card-hover p-10 flex flex-col items-center justify-center gap-4 cursor-pointer border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors min-h-[250px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center hover:scale-110 transition">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{t("assistant.upload_prompt")}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {hasImage ? t("assistant.uploaded") : t("assistant.imageFormat")}
                </p>
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive text-center mt-2">{error}</p>
            )}

            {hasImage && (
              <button
                onClick={handleAnalyze}
                className="mt-4 w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium text-sm hover:shadow-lg hover:scale-[1.02] transition duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {t("assistant.analyze")}
              </button>
            )}

            {!hasImage && (
              <button
                disabled
                className="mt-4 w-full py-3.5 rounded-2xl bg-muted text-muted-foreground font-medium text-sm cursor-not-allowed opacity-50 flex items-center justify-center gap-2"
              >
                {t("assistant.analyze")}
              </button>
            )}

            <button className="mt-2 w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-white/70 backdrop-blur-lg shadow-md text-foreground font-medium text-sm hover:scale-[1.02] transition duration-300 active:scale-[0.98]">
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
            className="glass-card p-10 flex flex-col items-center gap-4 min-h-[250px] justify-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center pulse-gentle">
              <Leaf className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">{t("assistant.analyzing")}</p>
            <div className="w-48 h-2 rounded-full overflow-hidden bg-muted">
              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shimmer" />
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
            <div className="glass-card p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{t("assistant.disease")}</p>
                <p className="text-lg font-heading font-bold text-foreground">{t("assistant.diseaseName")}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5">
                <p className="text-xs text-muted-foreground font-medium">{t("assistant.confidence")}</p>
                <p className="text-2xl font-heading font-bold text-primary mt-1">94%</p>
              </div>
              <div className="glass-card p-5">
                <p className="text-xs text-muted-foreground font-medium">{t("assistant.risk")}</p>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                  <span className="text-lg font-heading font-bold text-destructive">{t("assistant.highRisk")}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold text-foreground">{t("assistant.solution")}</p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-primary font-bold">•</span>{t("assistant.step1")}</li>
                <li className="flex gap-2"><span className="text-primary font-bold">•</span>{t("assistant.step2")}</li>
                <li className="flex gap-2"><span className="text-primary font-bold">•</span>{t("assistant.step3")}</li>
                <li className="flex gap-2"><span className="text-primary font-bold">•</span>{t("assistant.step4")}</li>
              </ul>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium text-sm hover:shadow-lg hover:scale-[1.02] transition duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t("assistant.scan_another")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
