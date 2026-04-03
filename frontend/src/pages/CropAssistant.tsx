import { useMemo, useRef, useState } from "react";
import { Upload, Mic, Leaf, AlertTriangle, CheckCircle2, RotateCcw, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

type Phase = "upload" | "analyzing" | "result";

type AnalysisResult = {
  diseaseLabel: string;
  diagnosisStatus?: "confirmed" | "low_confidence" | "unknown";
  confidence?: number;
  topPredictions?: Array<{ label: string; confidence: number }>;
  whatIsHappening: string;
  whyItHappens: string;
  doThisNow: string[];
  next7DaysPlan: string[];
  preventNextTime: string[];
  saveYourYield: string[];
  warningSigns: string[];
  pesticideOptions: Array<{
    name: string;
    useWhen?: string;
    dosage?: string;
    timing?: string;
    safety?: string;
  }>;
};

export default function CropAssistant() {
  const { t } = useI18n();
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const hasImage = useMemo(() => !!selectedFile, [selectedFile]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-[200px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-4">{t("assistant.login_required")}</p>
          <p className="text-muted-foreground mb-6">{t("assistant.login_prompt")}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:scale-105 transition"
          >
            {t("assistant.go_login")}
          </button>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("assistant.invalid_file"));
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("assistant.file_too_large"));
      setSelectedFile(null);
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !token) {
      setError(t("assistant.no_image"));
      return;
    }

    setPhase("analyzing");
    setError("");

    try {
      const response = await api.crop.analyze(token, selectedFile);
      const payload: any = response.data || {};
      setResult({
        diseaseLabel: payload.disease || payload.diseaseLabel || t("assistant.unknown"),
        diagnosisStatus: payload.diagnosisStatus,
        confidence: typeof payload.confidence === "number" ? payload.confidence : undefined,
        topPredictions: Array.isArray(payload.topPredictions) ? payload.topPredictions : [],
        whatIsHappening: payload.whatIsHappening || payload.explanation || "",
        whyItHappens: payload.whyItHappens || "",
        doThisNow: payload.doThisNow || [],
        next7DaysPlan: payload.next7DaysPlan || [],
        preventNextTime: payload.preventNextTime || [],
        saveYourYield: payload.saveYourYield || [],
        warningSigns: payload.warningSigns || [],
        pesticideOptions: payload.pesticideOptions || [],
      });
      setPhase("result");
    } catch (err: any) {
      setError(err.message || t("assistant.failed"));
      setPhase("upload");
    }
  };

  const handleReset = () => {
    setPhase("upload");
    setSelectedFile(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
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
                  {hasImage ? `${t("assistant.selected")}: ${selectedFile?.name}` : t("assistant.file_hint")}
                </p>
              </div>
            </div>

            {error && <p className="text-xs text-destructive text-center mt-2">{error}</p>}

            <button
              onClick={handleAnalyze}
              disabled={!hasImage}
              className={`mt-4 w-full py-3.5 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition duration-300 active:scale-[0.98] ${
                hasImage
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-lg hover:scale-[1.02]"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              }`}
            >
              {t("assistant.analyze")}
            </button>

            <button className="mt-2 w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-white/70 backdrop-blur-lg shadow-md text-foreground font-medium text-sm opacity-60 cursor-not-allowed">
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

        {phase === "result" && result && (
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
                <p className="text-lg font-heading font-bold text-foreground">{result.diseaseLabel}</p>
                {typeof result.confidence === "number" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("assistant.confidence")} : {result.confidence.toFixed(1)}%
                  </p>
                )}
                {result.diagnosisStatus && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("assistant.status")}: {result.diagnosisStatus === "confirmed" ? t("assistant.status_confirmed") : result.diagnosisStatus === "low_confidence" ? t("assistant.status_low") : t("assistant.status_unknown")}
                  </p>
                )}
              </div>
            </div>

            {result.topPredictions && result.topPredictions.length > 1 && (
              <div className="glass-card p-6">
                <p className="text-sm font-semibold text-foreground mb-3">{t("assistant.alternatives")}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.topPredictions.slice(1, 4).map((pred, idx) => (
                    <li key={`alt-${idx}`} className="flex justify-between gap-3">
                      <span>{pred.label}</span>
                      <span className="font-medium">{Number(pred.confidence || 0).toFixed(1)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="glass-card p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{t("assistant.what_happening")}</p>
                <p className="text-sm text-muted-foreground mt-1">{result.whatIsHappening || t("assistant.not_available")}</p>
              </div>
              {result.whyItHappens && (
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("assistant.why_happens")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{result.whyItHappens}</p>
                </div>
              )}
            </div>

            <div className="glass-card p-6">
              <p className="text-sm font-semibold text-foreground mb-3">{t("assistant.now")}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(result.doThisNow || []).map((step, idx) => (
                  <li key={`now-${idx}`} className="flex gap-2">
                    <span className="text-primary font-bold">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6">
              <p className="text-sm font-semibold text-foreground mb-3">{t("assistant.next7")}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(result.next7DaysPlan || []).map((step, idx) => (
                  <li key={`week-${idx}`} className="flex gap-2">
                    <span className="text-primary font-bold">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6">
              <p className="text-sm font-semibold text-foreground mb-3">{t("assistant.prevent")}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(result.preventNextTime || []).map((tip, idx) => (
                  <li key={`prev-${idx}`} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6">
              <p className="text-sm font-semibold text-foreground mb-3">{t("assistant.loss_reduce")}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(result.saveYourYield || []).map((tip, idx) => (
                  <li key={`loss-${idx}`} className="flex gap-2">
                    <Shield className="h-4 w-4 text-secondary mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {result.pesticideOptions?.length > 0 && (
              <div className="glass-card p-6">
                <p className="text-sm font-semibold text-foreground mb-3">{t("assistant.pesticides")}</p>
                <div className="space-y-3">
                  {result.pesticideOptions.map((p, idx) => (
                    <div key={`pest-${idx}`} className="rounded-xl bg-white/60 p-3 border border-white/50">
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      {p.useWhen && <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">{t("assistant.when")}:</span> {p.useWhen}</p>}
                      {p.dosage && <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">{t("assistant.dose")}:</span> {p.dosage}</p>}
                      {p.timing && <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">{t("assistant.timing")}:</span> {p.timing}</p>}
                      {p.safety && <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">{t("assistant.safety")}:</span> {p.safety}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.warningSigns?.length > 0 && (
              <div className="glass-card p-6">
                <p className="text-sm font-semibold text-foreground mb-3">{t("assistant.warning_signs")}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.warningSigns.map((w, idx) => (
                    <li key={`warn-${idx}`} className="flex gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
