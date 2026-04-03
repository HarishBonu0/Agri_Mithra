import { useMemo, useRef, useState } from "react";
import { Upload, Mic, Leaf, AlertTriangle, CheckCircle2, ShieldAlert, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

type Phase = "upload" | "analyzing" | "result";

type AnalysisResult = {
  diseaseLabel: string;
  confidence: number;
  explanation: string;
  solution: string;
  prevention: string;
  riskLevel: string;
  teluguTranslation: string;
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
          <p className="text-lg font-semibold text-foreground mb-4">Login Required</p>
          <p className="text-muted-foreground mb-6">Please login to access Crop Assistant</p>
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
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
        diseaseLabel: payload.diseaseLabel || payload.disease || "Unknown",
        confidence: payload.confidence || 0,
        explanation: payload.explanation || "",
        solution: payload.solution || "",
        prevention: payload.prevention || "",
        riskLevel: payload.riskLevel || payload.risk || "Unknown",
        teluguTranslation: payload.teluguTranslation || "",
      });
      setPhase("result");
    } catch (err: any) {
      setError(err.message || "Failed to analyze crop image");
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
                  {hasImage ? `Selected: ${selectedFile?.name}` : "PNG, JPG up to 5MB"}
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5">
                <p className="text-xs text-muted-foreground font-medium">{t("assistant.confidence")}</p>
                <p className="text-2xl font-heading font-bold text-primary mt-1">{result.confidence}%</p>
              </div>
              <div className="glass-card p-5">
                <p className="text-xs text-muted-foreground font-medium">{t("assistant.risk")}</p>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                  <span className="text-lg font-heading font-bold text-destructive">{result.riskLevel}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Explanation</p>
                <p className="text-sm text-muted-foreground mt-1">{result.explanation || "Not available"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Solution</p>
                <p className="text-sm text-muted-foreground mt-1">{result.solution || "Not available"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Prevention</p>
                <p className="text-sm text-muted-foreground mt-1">{result.prevention || "Not available"}</p>
              </div>
              {result.teluguTranslation && (
                <div>
                  <p className="text-sm font-semibold text-foreground">Telugu</p>
                  <p className="text-sm text-muted-foreground mt-1">{result.teluguTranslation}</p>
                </div>
              )}
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
