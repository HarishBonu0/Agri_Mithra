import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface SchemeCard {
  name: string;
  level?: string;
  summary: string;
  reason: string;
  sources: string[];
  applySteps: string[];
}

interface EligibilityResponse {
  profile: {
    state: string;
    landHectares: number;
    annualIncome: number | null;
  };
  eligibleSchemes: SchemeCard[];
  eligibleCount: number;
  message: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function SchemeResults() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState<EligibilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const enteredAnnualIncome = location.state?.profileData?.enteredAnnualIncome as string | undefined;

  useEffect(() => {
    const profileData = location.state?.profileData;
    if (!profileData) {
      navigate("/schemes");
      return;
    }

    const checkEligibility = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/schemes/eligibility`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData),
          }
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: EligibilityResponse = await response.json();
        setResult(data);
      } catch {
        setError(t("schemes.error"));
      } finally {
        setLoading(false);
      }
    };

    checkEligibility();
  }, [location.state, navigate, t]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <button
          onClick={() => navigate("/schemes")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("schemes.back")}
        </button>
        <div className="flex items-center justify-center min-h-96 gap-3 rounded-2xl border border-border bg-card p-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg text-foreground">
            {t("schemes.checking")}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <button
          onClick={() => navigate("/schemes")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("schemes.back")}
        </button>
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-destructive mb-1">{t("schemes.error_title")}</h3>
            <p className="text-sm text-destructive/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const teSchemeContent: Record<string, { name?: string; summary: string; reason: string; steps: string[]; level?: string }> = {
    "PM-KISAN": {
      name: "a¦¬a¦Ça¦Äa¦é-a¦òa¦+a¦+a¦+a¦¿a¦ì",
      level: "a¦£a¦+a¦ña¦Ça¦»",
      summary: "a¦àa¦¦a¦ìa¦¦a¦üa¦¦a¦êa¦¿ a¦¦a¦êa¦ña¦ü a¦òa¦üa¦ƒa¦üa¦éa¦¼a¦+a¦¦a¦òa¦ü a¦¿a¦ça¦¦a¦üa¦ùa¦+ a¦¼a¦ìa¦»a¦+a¦éa¦òa¦ì a¦ûa¦+a¦ña¦+a¦¦a¦ï a¦åa¦¦a¦ìa¦Ña¦+a¦ò a¦+a¦¦a¦+a¦»a¦é a¦àa¦éa¦ªa¦+a¦éa¦Üa¦ç a¦£a¦+a¦ña¦Ça¦» a¦¬a¦Ña¦òa¦é.",
      reason: "a¦«a¦Ç a¦¬a¦ìa¦¦a¦èa¦½a¦êa¦¦a¦ìGÇîa¦¦a¦ï a¦åa¦ªa¦+a¦¦a¦ì, a¦¼a¦ìa¦»a¦+a¦éa¦òa¦ì a¦«a¦¦a¦+a¦»a¦ü a¦¡a¦éa¦«a¦+/a¦¬a¦éa¦ƒ a¦¦a¦+a¦òa¦+a¦¦a¦ìa¦ía¦ü a¦¦a¦+a¦¦a¦¦a¦+a¦¦a¦ü a¦+a¦¦a¦+a¦¬a¦ïa¦¦a¦ía¦éa¦ña¦ï a¦ê a¦¬a¦Ña¦òa¦+a¦¿a¦+a¦òa¦+ a¦àa¦¦a¦ìa¦¦a¦ñ a¦ëa¦éa¦ƒa¦üa¦éa¦ªa¦+.",
      steps: [
        "a¦+a¦«a¦Ça¦¬ CSC a¦¦a¦ça¦ªa¦+ a¦¦a¦ìa¦»a¦¦a¦+a¦+a¦» a¦òa¦+a¦¦a¦ìa¦»a¦+a¦¦a¦»a¦é a¦ªa¦ìa¦¦a¦+a¦¦a¦+ a¦¿a¦«a¦ïa¦ªa¦ü a¦Üa¦ça¦»a¦éa¦ía¦+.",
        "a¦åa¦ºa¦+a¦¦a¦ì, a¦¼a¦ìa¦»a¦+a¦éa¦òa¦ì a¦ûa¦+a¦ña¦+, a¦¡a¦éa¦«a¦+/a¦¬a¦éa¦ƒ a¦¦a¦+a¦¦a¦¦a¦+a¦¦a¦ü a¦+a¦«a¦¦a¦ìa¦¬a¦+a¦éa¦Üa¦éa¦ía¦+.",
        "PM-KISAN a¦¬a¦ïa¦¦a¦ìa¦ƒa¦¦a¦ìGÇîa¦¦a¦ï a¦+a¦ìa¦Ña¦+a¦ña¦+ a¦ña¦¿a¦+a¦ûa¦Ç a¦Üa¦ça¦»a¦éa¦ía¦+.",
      ],
    },
    "Pradhan Mantri Fasal Bima Yojana (PMFBY)": {
      name: "a¦¬a¦ìa¦¦a¦ºa¦+a¦¿a¦ì a¦«a¦éa¦ña¦ìa¦¦a¦+ a¦½a¦+a¦¦a¦ì a¦¼a¦Ça¦«a¦+ a¦»a¦ïa¦£a¦¿ (PMFBY)",
      level: "a¦£a¦+a¦ña¦Ça¦»",
      summary: "a¦¿a¦ïa¦ƒa¦+a¦½a¦ê a¦Üa¦ça¦+a¦+a¦¿ a¦¬a¦éa¦ƒa¦¦a¦òa¦ü a¦ña¦òa¦ìa¦òa¦üa¦¦ a¦¬a¦ìa¦¦a¦Ça¦«a¦+a¦»a¦éa¦ña¦ï a¦¬a¦éa¦ƒ a¦¼a¦Ça¦«a¦+ a¦¦a¦òa¦ìa¦+a¦ú a¦àa¦éa¦ªa¦+a¦éa¦Üa¦ç a¦¬a¦Ña¦òa¦é.",
      reason: "a¦«a¦Ça¦¦a¦ü a¦¬a¦éa¦ƒ a¦+a¦+a¦ùa¦ü a¦Üa¦ça¦+a¦ìa¦ña¦üa¦¿a¦ìa¦¿a¦+a¦¦a¦ü a¦«a¦¦a¦+a¦»a¦ü a¦¬a¦éa¦ƒ a¦¼a¦Ça¦«a¦+ a¦àa¦¦a¦+a¦¦a¦é a¦ëa¦éa¦ªa¦¿a¦+ a¦ña¦åa¦¦a¦+a¦¬a¦+a¦¿a¦éa¦ªa¦üa¦¿ a¦ê a¦¬a¦Ña¦òa¦+a¦¿a¦+a¦òa¦+ a¦+a¦¦a¦+a¦¬a¦ïa¦ña¦+a¦¦a¦ü.",
      steps: [
        "a¦+a¦Ça¦£a¦¿a¦ì a¦ùa¦ía¦üa¦¦a¦üa¦òa¦ü a¦«a¦üa¦éa¦ªa¦ç a¦¼a¦ìa¦»a¦+a¦éa¦òa¦ì/CSC/a¦¼a¦Ça¦«a¦+ a¦¢a¦+a¦¿a¦¦a¦ì a¦ªa¦ìa¦¦a¦+a¦¦a¦+ a¦¿a¦«a¦ïa¦ªa¦ü a¦Üa¦ça¦»a¦éa¦ía¦+.",
        "a¦åa¦ºa¦+a¦¦a¦ì, a¦¼a¦ìa¦»a¦+a¦éa¦òa¦ì a¦ûa¦+a¦ña¦+, a¦¬a¦éa¦ƒ a¦«a¦¦a¦+a¦»a¦ü a¦¡a¦éa¦«a¦+ a¦¦a¦+a¦¦a¦¦a¦+a¦¦a¦ü a¦+a¦«a¦¦a¦ìa¦¬a¦+a¦éa¦Üa¦éa¦ía¦+.",
        "PMFBY a¦¬a¦ïa¦¦a¦ìa¦ƒa¦¦a¦ìGÇîa¦¦a¦ï a¦¬a¦+a¦¦a¦+a¦Ç/a¦òa¦ìa¦¦a¦åa¦»a¦+a¦«a¦ì a¦+a¦ìa¦Ña¦+a¦ña¦+ a¦Üa¦éa¦ía¦éa¦ía¦+.",
      ],
    },
    "PMKSY - Per Drop More Crop (Micro Irrigation)": {
      name: "PMKSY - a¦¬a¦åa¦¦a¦ì a¦ía¦ìa¦¦a¦+a¦¬a¦ì a¦«a¦ïa¦¦a¦ì a¦òa¦ìa¦¦a¦+a¦¬a¦ì (a¦«a¦êa¦òa¦ìa¦¦a¦ï a¦ça¦¦a¦+a¦ùa¦ça¦+a¦¿a¦ì)",
      level: "a¦£a¦+a¦ña¦Ça¦»",
      summary: "a¦ía¦ìa¦¦a¦+a¦¬a¦ì/a¦+a¦ìa¦¬a¦ìa¦¦a¦+a¦éa¦òa¦ìa¦¦a¦¦a¦ì a¦«a¦êa¦òa¦ìa¦¦a¦ï a¦ça¦¦a¦+a¦ùa¦ça¦+a¦¿a¦ìGÇîa¦òa¦ü a¦+a¦¼a¦ìa¦+a¦+a¦ía¦Ç a¦«a¦ªa¦ìa¦ªa¦ña¦ü a¦àa¦éa¦ªa¦+a¦éa¦Üa¦ç a¦¬a¦Ña¦òa¦é.",
      reason: "a¦«a¦Ça¦òa¦ü a¦ça¦¦a¦+a¦ùa¦ça¦+a¦¿a¦ì a¦àa¦¦a¦+a¦¦a¦é a¦ëa¦éa¦ía¦ƒa¦é a¦«a¦¦a¦+a¦»a¦ü a¦¡a¦éa¦«a¦+ a¦¦a¦+a¦òa¦+a¦¦a¦ìa¦ía¦üa¦¦a¦ü a¦ëa¦éa¦ía¦ƒa¦é a¦¦a¦¦a¦ìa¦¦ a¦ê a¦¬a¦Ña¦òa¦+a¦¿a¦+a¦òa¦+ a¦àa¦¦a¦ìa¦¦a¦ñ a¦ëa¦éa¦ƒa¦üa¦éa¦ªa¦+.",
      steps: [
        "a¦¦a¦+a¦+a¦ìa¦ƒa¦ìa¦¦ a¦¦a¦ìa¦»a¦¦a¦+a¦+a¦»/a¦¦a¦+a¦¦a¦ìa¦ƒa¦+a¦òa¦¦a¦ìa¦Üa¦¦a¦ì a¦¦a¦+a¦û a¦ªa¦ìa¦¦a¦+a¦¦a¦+ a¦ªa¦¦a¦ûa¦+a¦+a¦ìa¦ña¦ü a¦Üa¦ça¦»a¦éa¦ía¦+.",
        "a¦åa¦ºa¦+a¦¦a¦ì, a¦¼a¦ìa¦»a¦+a¦éa¦òa¦ì, a¦¡a¦éa¦«a¦+ a¦«a¦¦a¦+a¦»a¦ü a¦¬a¦éa¦ƒ a¦¦a¦+a¦¦a¦¦a¦+a¦¦a¦ü a¦+a¦«a¦¦a¦ìa¦¬a¦+a¦éa¦Üa¦éa¦ía¦+.",
        "a¦½a¦Ça¦¦a¦ìa¦ía¦ì a¦¦a¦åa¦¦a¦+a¦½a¦+a¦òa¦ça¦+a¦¿a¦ì a¦«a¦¦a¦+a¦»a¦ü a¦+a¦¼a¦ìa¦+a¦+a¦ía¦Ç a¦åa¦«a¦ïa¦ª a¦¬a¦ìa¦¦a¦òa¦ìa¦¦a¦+a¦» a¦¬a¦éa¦¦a¦ìa¦ña¦+ a¦Üa¦ça¦»a¦éa¦ía¦+.",
      ],
    },
    "Kisan Credit Card (KCC)": {
      name: "a¦òa¦+a¦+a¦+a¦¿a¦ì a¦òa¦ìa¦¦a¦åa¦ía¦+a¦ƒa¦ì a¦òa¦+a¦¦a¦ìa¦ía¦ì (KCC)",
      level: "a¦£a¦+a¦ña¦Ça¦»",
      summary: "a¦¬a¦éa¦ƒ a¦+a¦+a¦ùa¦ü a¦àa¦¦a¦+a¦¦a¦+a¦¦a¦òa¦ü a¦ña¦òa¦ìa¦+a¦ú a¦òa¦ìa¦¦a¦åa¦ía¦+a¦ƒa¦ì a¦+a¦îa¦òa¦¦a¦ìa¦»a¦é a¦àa¦éa¦ªa¦+a¦éa¦Üa¦ç a¦¬a¦Ña¦òa¦é.",
      reason: "a¦«a¦Ç a¦¦a¦êa¦ña¦ü/a¦+a¦+a¦ùa¦üa¦ªa¦+a¦¦a¦üa¦¦ a¦¬a¦ìa¦¦a¦èa¦½a¦êa¦¦a¦ì a¦òa¦ìa¦¦a¦åa¦ía¦+a¦ƒa¦ì a¦àa¦¦a¦ìa¦¦a¦ñ a¦¿a¦+a¦¼a¦éa¦ºa¦¿a¦¦a¦òa¦ü a¦+a¦¦a¦+a¦¬a¦ïa¦ña¦üa¦éa¦ªa¦+.",
      steps: [
        "a¦¡a¦+a¦ùa¦+a¦ìa¦¦a¦+a¦«a¦ìa¦» a¦¼a¦ìa¦»a¦+a¦éa¦òa¦ìGÇîa¦¦a¦ï KCC a¦òa¦ïa¦+a¦é a¦ªa¦¦a¦ûa¦+a¦+a¦ìa¦ña¦ü a¦Üa¦ça¦»a¦éa¦ía¦+.",
        "a¦åa¦ºa¦+a¦¦a¦ì, a¦¼a¦ìa¦»a¦+a¦éa¦òa¦ì, a¦+a¦+a¦ùa¦ü a¦¦a¦+a¦¦a¦¦a¦+a¦¦a¦ü a¦+a¦«a¦¦a¦ìa¦¬a¦+a¦éa¦Üa¦éa¦ía¦+.",
        "a¦¦a¦åa¦¦a¦+a¦½a¦+a¦òa¦ça¦+a¦¿a¦ì a¦ña¦¦a¦ìa¦¦a¦+a¦ñ a¦òa¦ìa¦¦a¦åa¦ía¦+a¦ƒa¦ì a¦¬a¦¦a¦+a¦«a¦+a¦ña¦+ a¦åa¦«a¦ïa¦ªa¦é a¦¬a¦èa¦éa¦ªa¦éa¦ía¦+.",
      ],
    },
    "YSR Rythu Bharosa": {
      name: "a¦¦a¦êa¦Äa¦+a¦ìa¦+a¦+a¦¦a¦ì a¦¦a¦êa¦ña¦ü a¦¡a¦¦a¦ïa¦+a¦+",
      level: "a¦åa¦éa¦ºa¦ìa¦¦a¦¬a¦ìa¦¦a¦ªa¦ça¦¦a¦ì",
      summary: "a¦åa¦éa¦ºa¦ìa¦¦a¦¬a¦ìa¦¦a¦ªa¦ça¦¦a¦ìGÇîa¦¦a¦ï a¦àa¦¦a¦ìa¦¦a¦üa¦¦a¦êa¦¿ a¦¦a¦êa¦ña¦ü a¦òa¦üa¦ƒa¦üa¦éa¦¼a¦+a¦¦a¦òa¦ü a¦¦a¦+a¦¦a¦ìa¦+a¦+a¦ò a¦åa¦¦a¦ìa¦Ña¦+a¦ò a¦+a¦¦a¦+a¦»a¦é a¦àa¦éa¦ªa¦+a¦éa¦Üa¦ç a¦¬a¦Ña¦òa¦é.",
      reason: "a¦«a¦Ça¦¦a¦ü a¦åa¦éa¦ºa¦ìa¦¦a¦¬a¦ìa¦¦a¦ªa¦ça¦¦a¦ì a¦¦a¦êa¦ña¦ü a¦¬a¦ìa¦¦a¦èa¦½a¦êa¦¦a¦ìGÇîa¦òa¦ü a¦+a¦¦a¦+a¦¬a¦ïa¦¦a¦ía¦éa¦ña¦ï a¦ê a¦¬a¦Ña¦òa¦+a¦¿a¦+a¦òa¦+ a¦àa¦¦a¦ìa¦¦a¦ñ a¦¬a¦èa¦éa¦ªa¦+a¦¦a¦ü.",
      steps: [
        "a¦+a¦«a¦Ça¦¬ RBK/a¦+a¦Üa¦+a¦¦a¦+a¦¦a¦»a¦éa¦¦a¦ï a¦ªa¦¦a¦ûa¦+a¦+a¦ìa¦ña¦ü a¦Üa¦ça¦»a¦éa¦ía¦+.",
        "a¦åa¦ºa¦+a¦¦a¦ì, a¦¡a¦éa¦«a¦+ a¦¦a¦+a¦òa¦+a¦¦a¦ìa¦ía¦ü, a¦¼a¦ìa¦»a¦+a¦éa¦òa¦ì a¦¦a¦+a¦¦a¦¦a¦+a¦¦a¦ü a¦ça¦¦a¦ìa¦¦a¦éa¦ía¦+.",
        "a¦ç-a¦òa¦ìa¦¦a¦+a¦¬a¦ì a¦¦a¦+a¦¦a¦¦a¦+a¦¦a¦ü a¦¿a¦¦a¦Ça¦òa¦¦a¦+a¦éa¦Üa¦éa¦ía¦+.",
      ],
    },
    "YSR Free Crop Insurance": {
      name: "a¦¦a¦êa¦Äa¦+a¦ìa¦+a¦+a¦¦a¦ì a¦ëa¦Üa¦+a¦ñ a¦¬a¦éa¦ƒ a¦¼a¦Ça¦«a¦+",
      level: "a¦åa¦éa¦ºa¦ìa¦¦a¦¬a¦ìa¦¦a¦ªa¦ça¦¦a¦ì",
      summary: "a¦àa¦¦a¦ìa¦¦a¦üa¦¦a¦êa¦¿ a¦¦a¦êa¦ña¦üa¦¦a¦òa¦ü a¦¦a¦+a¦+a¦ìa¦ƒa¦ìa¦¦ a¦àa¦«a¦¦a¦üa¦¦a¦ï a¦ëa¦Üa¦+a¦ñ/a¦«a¦ªa¦ìa¦ªa¦ña¦ü a¦¬a¦éa¦ƒ a¦¼a¦Ça¦«a¦+ a¦àa¦éa¦ªa¦+a¦éa¦Üa¦ç a¦¬a¦Ña¦òa¦é.",
      reason: "a¦«a¦Ç a¦¬a¦éa¦ƒ a¦+a¦+a¦ùa¦ü a¦«a¦¦a¦+a¦»a¦ü a¦¼a¦Ça¦«a¦+ a¦àa¦¦a¦+a¦¦ a¦¦a¦+a¦¦a¦¦a¦+a¦¦a¦ü a¦ê a¦¬a¦Ña¦òa¦+a¦¿a¦+a¦òa¦+ a¦+a¦¦a¦+a¦¬a¦ïa¦ña¦üa¦¿a¦ìa¦¿a¦+a¦»a¦+.",
      steps: [
        "a¦¬a¦éa¦ƒ a¦¦a¦+a¦¦a¦¦a¦+a¦¦a¦ü RBK/a¦¦a¦ìa¦»a¦¦a¦+a¦+a¦» a¦àa¦ºa¦+a¦òa¦+a¦¦a¦üa¦¦ a¦ªa¦ìa¦¦a¦+a¦¦a¦+ a¦¿a¦«a¦ïa¦ªa¦ü a¦Üa¦ça¦»a¦éa¦ía¦+.",
        "a¦åa¦ºa¦+a¦¦a¦ì-a¦¼a¦ìa¦»a¦+a¦éa¦òa¦ì a¦¦a¦+a¦éa¦òa¦ì a¦+a¦¦a¦+a¦Üa¦éa¦ía¦éa¦ía¦+.",
        "a¦òa¦ìa¦¦a¦åa¦»a¦+a¦«a¦ì a¦òa¦ïa¦+a¦é a¦+a¦Ça¦£a¦¿a¦ì/a¦¬a¦éa¦ƒ a¦¦a¦+a¦¦a¦¦a¦+a¦¦a¦ña¦ï a¦òa¦+a¦¦a¦ìa¦»a¦+a¦¦a¦»a¦+a¦¿a¦ìa¦¿a¦+ a¦+a¦éa¦¬a¦ìa¦¦a¦ªa¦+a¦éa¦Üa¦éa¦ía¦+.",
      ],
    },
    "AP Micro Irrigation Project (APMIP)": {
      name: "a¦Åa¦¬a¦Ç a¦«a¦êa¦òa¦ìa¦¦a¦ï a¦ça¦¦a¦+a¦ùa¦ça¦+a¦¿a¦ì a¦¬a¦ìa¦¦a¦+a¦£a¦åa¦òa¦ìa¦ƒa¦ì (APMIP)",
      level: "a¦åa¦éa¦ºa¦ìa¦¦a¦¬a¦ìa¦¦a¦ªa¦ça¦¦a¦ì",
      summary: "a¦ía¦ìa¦¦a¦+a¦¬a¦ì/a¦+a¦ìa¦¬a¦ìa¦¦a¦+a¦éa¦òa¦ìa¦¦a¦¦a¦ì a¦¦a¦ìa¦»a¦¦a¦+a¦ìa¦Ña¦¦a¦¬a¦ê a¦+a¦¼a¦ìa¦+a¦+a¦ía¦Ç a¦àa¦éa¦ªa¦+a¦éa¦Üa¦ç a¦åa¦éa¦ºa¦ìa¦¦a¦¬a¦ìa¦¦a¦ªa¦ça¦¦a¦ì a¦¬a¦Ña¦òa¦é.",
      reason: "a¦«a¦Ça¦òa¦ü a¦ça¦¦a¦+a¦ùa¦ça¦+a¦¿a¦ì a¦àa¦¦a¦+a¦¦a¦é a¦ëa¦éa¦ía¦ƒa¦é a¦¦a¦¦a¦ìa¦¦ a¦ê a¦¬a¦Ña¦òa¦+a¦¿a¦+a¦òa¦+ a¦àa¦¦a¦ìa¦¦a¦ñ a¦ëa¦éa¦ƒa¦üa¦éa¦ªa¦+.",
      steps: [
        "a¦¦a¦ìa¦»a¦¦a¦+a¦+a¦»/a¦¦a¦+a¦¦a¦ìa¦ƒa¦+a¦òa¦¦a¦ìa¦Üa¦¦a¦ì a¦¦a¦+a¦û a¦¢a¦+a¦¿a¦¦a¦ì a¦ªa¦ìa¦¦a¦+a¦¦a¦+ a¦ªa¦¦a¦ûa¦+a¦+a¦ìa¦ña¦ü a¦Üa¦ça¦»a¦éa¦ía¦+.",
        "a¦åa¦ºa¦+a¦¦a¦ì, a¦¡a¦éa¦«a¦+, a¦¬a¦éa¦ƒ a¦«a¦¦a¦+a¦»a¦ü a¦ça¦¦a¦+a¦ùa¦ça¦+a¦¿a¦ì a¦àa¦¦a¦+a¦¦ a¦¦a¦+a¦¦a¦¦a¦+a¦¦a¦ü a¦ça¦¦a¦ìa¦¦a¦éa¦ía¦+.",
        "a¦+a¦êa¦ƒa¦ì a¦¦a¦åa¦¦a¦+a¦½a¦+a¦òa¦ça¦+a¦¿a¦ì a¦ña¦¦a¦ìa¦¦a¦+a¦ñ a¦+a¦¼a¦ìa¦+a¦+a¦ía¦Ç a¦åa¦«a¦ïa¦ªa¦é a¦¬a¦èa¦éa¦ªa¦éa¦ía¦+.",
      ],
    },
  };

  const landInHectares = Number(result.profile.landHectares || 0);
  const landInAcres = landInHectares / 0.404686;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <button
        onClick={() => navigate("/schemes")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("schemes.back_to_form")}
      </button>

      <div className="space-y-2">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          {t("schemes.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("schemes.state")}: {result.profile.state} | {t("schemes.land")}:{" "}
          {landInHectares.toFixed(2)} {t("schemes.unit_hectares")} ({landInAcres.toFixed(2)} {t("schemes.unit_acres")}) |{" "}
          {enteredAnnualIncome
            ? `Gé¦${Number(enteredAnnualIncome.replace(/,/g, "")).toLocaleString("en-IN")}`
            : result.profile.annualIncome
              ? `Gé¦${Number(result.profile.annualIncome).toLocaleString("en-IN")}`
              : t("schemes.not_entered")}
        </p>
      </div>

      <div className="grid gap-4">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <p className="text-foreground font-medium">
            {result.eligibleCount > 0 ? t("schemes.schemes_found") : t("schemes.no_schemes")}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {result.eligibleCount} scheme{result.eligibleCount !== 1 ? "s" : ""}{" "}
            {t("schemes.found")}
          </p>
        </div>

        {result.eligibleSchemes.length > 0 ? (
          <div className="space-y-4">
            {result.eligibleSchemes.map((scheme, idx) => (
              (() => {
                const te = teSchemeContent[scheme.name];
                const schemeName = lang === "te" && te?.name ? te.name : scheme.name;
                const schemeLevel = lang === "te" && te?.level ? te.level : scheme.level;
                const schemeSummary = lang === "te" && te?.summary ? te.summary : scheme.summary;
                const schemeReason = lang === "te" && te?.reason ? te.reason : scheme.reason;
                const schemeSteps = lang === "te" && te?.steps?.length ? te.steps : scheme.applySteps;

                return (
              <motion.div
                key={scheme.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground">
                      {schemeName}
                    </h2>
                    {schemeLevel && (
                      <span className="inline-block mt-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                        {schemeLevel}
                      </span>
                    )}
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                </div>

                <p className="text-sm text-muted-foreground">
                  {schemeSummary}
                </p>

                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-sm font-medium text-foreground mb-2">
                    {t("schemes.why_match")}:
                  </p>
                  <p className="text-sm text-muted-foreground">{schemeReason}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-3">
                    {t("schemes.steps")}:
                  </p>
                  <ol className="space-y-2">
                    {schemeSteps.map((step, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm text-muted-foreground"
                      >
                        <span className="font-semibold text-primary flex-shrink-0">
                          {i + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {scheme.sources && scheme.sources.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      {t("schemes.official_sources")}:
                    </p>
                    <div className="space-y-1">
                      {scheme.sources.map((source) => (
                        <a
                          key={source}
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline break-all"
                        >
                          {source}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
                );
              })()
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {t("schemes.no_schemes")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
