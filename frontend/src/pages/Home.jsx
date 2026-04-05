import { useNavigate } from "react-router-dom";
import { Languages, Sprout, ScrollText, Newspaper, ScanLine, Landmark, MessageSquareText, LayoutDashboard, Bot, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { AnimatedHero } from "@/components/AnimatedHero";

const copy = {
  en: {
    heroTitle: "AgriMithra 🌾",
    heroSubtitle: "AI-powered farming assistant in Telugu & English",
    getStarted: "Get Started",
    tryDemo: "Explore Preview",
    demoHint: "Login required for full access.",
    gatedHint: "Sign up to save, personalize, or continue.",
    featuresTitle: "Core Features",
    cropAssistant: "Crop Assistant",
    cropText: "Upload crop photos and receive disease detection, confidence score, and actionable first-step treatment guidance.",
    schemeFinder: "Scheme Finder",
    schemeText: "Find matching central and state schemes based on crop, land profile, and farmer eligibility details.",
    newsSummarizer: "News Summarizer",
    newsText: "Get local agricultural headlines with simple AI summaries, key impact, and practical next-step recommendations.",
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
    tryDemo: "ప్రీవ్యూ చూడండి",
    demoHint: "పూర్తి యాక్సెస్ కోసం లాగిన్ అవసరం.",
    gatedHint: "సేవ్ చేయడానికి, వ్యక్తిగతీకరించడానికి లేదా కొనసాగడానికి సైన్ అప్ చేయండి.",
    featuresTitle: "ప్రధాన ఫీచర్లు",
    cropAssistant: "పంట సహాయకుడు",
    cropText: "పంట ఫోటోలు అప్‌లోడ్ చేసి వ్యాధి గుర్తింపు, కాన్ఫిడెన్స్ స్కోర్ మరియు ప్రారంభ చికిత్స సూచనలు పొందండి.",
    schemeFinder: "పథకాల శోధకుడు",
    schemeText: "పంట, భూమి వివరాలు, అర్హత ఆధారంగా మీకు సరిపడే కేంద్ర మరియు రాష్ట్ర పథకాలు తెలుసుకోండి.",
    newsSummarizer: "న్యూస్ సమ్మరైజర్",
    newsText: "స్థానిక వ్యవసాయ వార్తలను AI సమ్మరీతో, ప్రభావం మరియు తదుపరి చర్యలతో సులభంగా తెలుసుకోండి.",
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
  const { lang, setLang, t: tr } = useI18n();
  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const homeCopy = copy[lang];

  const navItems = [
    { key: "nav.dashboard", path: "/dashboard", gated: false, icon: LayoutDashboard },
    { key: "nav.assistant", path: "/assistant", gated: true, icon: ScanLine },
    { key: "nav.schemes", path: "/schemes", gated: true, icon: Landmark },
    { key: "nav.news", path: "/news", gated: true, icon: Newspaper },
    { key: "nav.aiAssistant", path: "/ai-assistant", gated: true, icon: Bot },
    ...(isAdmin ? [{ key: "nav.admin", path: "/admin", gated: true, icon: ShieldCheck }] : []),
  ];

  const handleNavClick = (item) => {
    if (isLoggedIn) {
      navigate(item.path);
      return;
    }

    if (item.path === "/dashboard") {
      navigate("/preview");
      return;
    }

    if (item.gated) {
      navigate("/signup");
      return;
    }

    navigate(item.path);
  };

  const handleModuleClick = (path) => {
    if (!isLoggedIn) {
      navigate("/signup");
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5fff6] via-[#f8fbf7] to-[#eef7f0] text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/65 backdrop-blur-xl">
        <div className="w-full px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3 md:gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-heading font-bold text-sm">AM</span>
            </div>
            <span className="font-heading font-semibold text-foreground text-base sm:text-lg">{tr("brand.name")}</span>
          </button>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/70 bg-white/55 px-2 py-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-foreground/85 hover:text-foreground hover:bg-white transition flex items-center gap-1.5"
              >
                <item.icon className="h-3.5 w-3.5" />
                {tr(item.key)}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            {!isLoggedIn && (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-full px-4 py-2 text-xs sm:text-sm font-semibold border border-primary/30 bg-white/80 text-primary hover:bg-white transition-all duration-300"
                >
                  {tr("btn.login")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="rounded-full px-4 py-2 text-xs sm:text-sm font-semibold bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {tr("btn.signup")}
                </button>
              </>
            )}

            <div className="inline-flex items-center rounded-full border border-primary/20 bg-white/70 backdrop-blur p-1 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold transition-all duration-300 ${
                  lang === "en"
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("te")}
                className={`rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold transition-all duration-300 ${
                  lang === "te"
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                తె
              </button>
            </div>
          </div>
        </div>

        <div className="lg:hidden border-t border-white/60 bg-white/55 px-3 py-2">
          <div className="grid grid-cols-5 gap-1">
            {navItems.slice(0, 5).map((item) => (
              <button
                key={`mobile-${item.path}`}
                onClick={() => handleNavClick(item)}
                className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-foreground/70 hover:text-primary hover:bg-white/60 transition"
              >
                <item.icon className="h-4 w-4" />
                <span className="text-[10px] font-medium leading-tight text-center">{tr(item.key)}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Hero Section with Animated Component */}
        <section className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur-lg p-7 shadow-md md:p-10 hover:shadow-lg transition duration-300 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {homeCopy.heroTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
                {homeCopy.heroSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(isLoggedIn ? "/dashboard" : "/signup")}
                  className="inline-flex items-center rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  {homeCopy.getStarted}
                </button>
                <button
                  onClick={() => navigate("/preview")}
                  className="inline-flex items-center rounded-2xl border-2 border-primary/30 bg-white/50 backdrop-blur px-6 py-3.5 text-sm font-semibold text-primary transition-all duration-300 hover:bg-white hover:border-primary hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  {homeCopy.tryDemo}
                </button>
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">{homeCopy.demoHint}</p>
            </div>
            <div className="flex justify-center">
              <AnimatedHero />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-10 animate-slide-up">
          <h2 className="mb-6 font-heading text-3xl font-bold">{homeCopy.featuresTitle}</h2>
          {!isLoggedIn && <p className="mb-4 text-sm text-muted-foreground">{homeCopy.gatedHint}</p>}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: ScanLine, title: homeCopy.cropAssistant, text: homeCopy.cropText, path: "/assistant" },
              { icon: Landmark, title: homeCopy.schemeFinder, text: homeCopy.schemeText, path: "/schemes" },
              { icon: MessageSquareText, title: homeCopy.newsSummarizer, text: homeCopy.newsText, path: "/news" },
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
        <section className="mb-10 animate-slide-up rounded-3xl border border-white/50 bg-white/70 backdrop-blur-lg p-6 md:p-8 hover:shadow-lg transition duration-300">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold">{homeCopy.languageTitle}</h2>
              <p className="mt-2 text-muted-foreground">{homeCopy.languageText}</p>
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
                {homeCopy.english}
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
                {homeCopy.telugu}
              </button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-6 animate-slide-up">
          <h2 className="mb-6 font-heading text-3xl font-bold">{homeCopy.benefitsTitle}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Sprout, text: homeCopy.b1 },
              { icon: ScrollText, text: homeCopy.b2 },
              { icon: Newspaper, text: homeCopy.b3 },
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
          <span>{homeCopy.footer}</span>
        </div>
      </footer>
    </div>
  );
}
