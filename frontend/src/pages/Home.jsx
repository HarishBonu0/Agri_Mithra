import { Link, useNavigate } from "react-router-dom";
import { Languages, Sprout, ScrollText, Newspaper, ScanLine, Landmark, MessageSquareText } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { AnimatedHero } from "@/components/AnimatedHero";

const copy = {
  en: {
    heroTitle: "AgriMithra 🌾",
    heroSubtitle: "AI-powered farming assistant in Telugu & English",
    getStarted: "Get Started",
    tryDemo: "Try Demo",
    featuresTitle: "Core Features",
    cropAssistant: "Crop Assistant",
    cropText: "Upload crop photos and get quick disease insights.",
    schemeFinder: "Scheme Finder",
    schemeText: "Discover eligible government schemes in minutes.",
    newsSummarizer: "News Summarizer",
    newsText: "Understand local agri news in simple language.",
    languageTitle: "Choose Your Language",
    languageText: "Switch between English and Telugu across the full UI.",
    english: "English",
    telugu: "Telugu",
    benefitsTitle: "Why Farmers Choose AgriMithra",
    b1: "Instant crop diagnosis",
    b2: "Government scheme guidance",
    b3: "Local news in simple language",
    footer: "AgriMithra - AI support for every field."
  },
  te: {
    heroTitle: "అగ్రిమిత్ర 🌾",
    heroSubtitle: "తెలుగు & ఇంగ్లీష్‌లో AI ఆధారిత వ్యవసాయ సహాయకుడు",
    getStarted: "ప్రారంభించండి",
    tryDemo: "డెమో ప్రయత్నించండి",
    featuresTitle: "ప్రధాన ఫీచర్లు",
    cropAssistant: "పంట సహాయకుడు",
    cropText: "పంట ఫోటో అప్‌లోడ్ చేసి వ్యాధి సమాచారం వెంటనే పొందండి.",
    schemeFinder: "పథకాల శోధకుడు",
    schemeText: "మీకు సరిపడే ప్రభుత్వ పథకాలు త్వరగా కనుగొనండి.",
    newsSummarizer: "న్యూస్ సమ్మరైజర్",
    newsText: "స్థానిక వ్యవసాయ వార్తలను సులభమైన భాషలో అర్థం చేసుకోండి.",
    languageTitle: "మీ భాషను ఎంచుకోండి",
    languageText: "మొత్తం UI ను ఇంగ్లీష్ మరియు తెలుగు మధ్య మార్చండి.",
    english: "ఇంగ్లీష్",
    telugu: "తెలుగు",
    benefitsTitle: "రైతులు అగ్రిమిత్రను ఎందుకు ఎంచుకుంటున్నారు",
    b1: "తక్షణ పంట నిర్ధారణ",
    b2: "ప్రభుత్వ పథకాల మార్గదర్శకం",
    b3: "సులభమైన భాషలో స్థానిక వార్తలు",
    footer: "అగ్రిమిత్ర - ప్రతి పొలానికి AI తోడ్పాటు."
  }
};

export default function Home() {
  const { lang, setLang } = useI18n();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const t = copy[lang];

  const handleModuleClick = (path) => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5fff6] via-[#f8fbf7] to-[#eef7f0] text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        {/* Hero Section with Animated Component */}
        <section className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur-lg p-8 shadow-md md:p-12 hover:shadow-lg transition duration-300 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-heading text-5xl font-bold tracking-tight md:text-6xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t.heroTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
                {t.heroSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
                  className="inline-flex items-center rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  {t.getStarted}
                </button>
                <button
                  onClick={() => handleModuleClick("/dashboard")}
                  className="inline-flex items-center rounded-2xl border-2 border-primary/30 bg-white/50 backdrop-blur px-6 py-3.5 text-sm font-semibold text-primary transition-all duration-300 hover:bg-white hover:border-primary hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  {t.tryDemo}
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <AnimatedHero />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-12 animate-slide-up">
          <h2 className="mb-6 font-heading text-3xl font-bold">{t.featuresTitle}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: ScanLine, title: t.cropAssistant, text: t.cropText, path: "/assistant" },
              { icon: Landmark, title: t.schemeFinder, text: t.schemeText, path: "/schemes" },
              { icon: MessageSquareText, title: t.newsSummarizer, text: t.newsText, path: "/news" },
            ].map((feature, i) => (
              <button
                key={i}
                onClick={() => handleModuleClick(feature.path)}
                className="group rounded-2xl border border-white/40 bg-white/70 backdrop-blur p-6 text-left transition-all duration-300 hover:border-primary/30 hover:bg-white hover:shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-3 group-hover:bg-primary/20 transition">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.text}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Language Section */}
        <section className="mb-12 animate-slide-up rounded-3xl border border-white/50 bg-white/70 backdrop-blur-lg p-6 md:p-8 hover:shadow-lg transition duration-300">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold">{t.languageTitle}</h2>
              <p className="mt-2 text-muted-foreground">{t.languageText}</p>
            </div>
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-white/50 backdrop-blur p-1 gap-1">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  lang === "en"
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.english}
              </button>
              <button
                type="button"
                onClick={() => setLang("te")}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  lang === "te"
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.telugu}
              </button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-12 animate-slide-up">
          <h2 className="mb-6 font-heading text-3xl font-bold">{t.benefitsTitle}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Sprout, text: t.b1 },
              { icon: ScrollText, text: t.b2 },
              { icon: Newspaper, text: t.b3 },
            ].map((benefit, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-white/40 bg-white/70 backdrop-blur p-6 transition-all duration-300 hover:bg-white hover:shadow-lg hover:scale-[1.02]"
              >
                <benefit.icon className="h-7 w-7 text-primary group-hover:scale-110 transition" />
                <p className="mt-4 text-sm font-medium text-foreground">{benefit.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/40 bg-white/50 backdrop-blur px-4 py-6 text-center text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2">
          <Languages className="h-4 w-4" />
          <span>{t.footer}</span>
        </div>
      </footer>
    </div>
  );
}
