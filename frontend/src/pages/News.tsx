import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Tags } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

const categories = ["news.all", "news.crops", "news.market", "news.policy", "news.technology"];

const articles = [
  { title: "Government announces increased MSP for Kharif crops", category: "news.policy", summary: "The central government has announced a 5-7% increase in Minimum Support Prices for major kharif crops for the upcoming season.", image: "🌾" },
  { title: "New drought-resistant rice variety developed", category: "news.crops", summary: "Indian Agricultural Research Institute has developed a new rice variety that can withstand drought conditions for up to 14 days.", image: "🌱" },
  { title: "Tomato prices surge 40% across major markets", category: "news.market", summary: "Unseasonal rains in major producing states have led to a significant shortage, pushing tomato prices up across the country.", image: "🍅" },
  { title: "AI-powered soil testing kits now available", category: "news.technology", summary: "A new startup has launched affordable soil testing kits that use AI to provide detailed nutrient analysis within minutes.", image: "🔬" },
  { title: "PM Fasal Bima Yojana claims simplified", category: "news.policy", summary: "The claim process for crop insurance has been streamlined with a new mobile app that allows farmers to file claims directly.", image: "📋" },
  { title: "Cotton exports expected to rise 20% this year", category: "news.market", summary: "With increased production and favorable global prices, India's cotton exports are projected to grow significantly.", image: "🏭" },
];

export default function News() {
  const { t } = useI18n();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("news.all");

  if (!isLoggedIn) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center h-[300px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-4">Login Required</p>
          <p className="text-muted-foreground mb-6">Please login to access News</p>
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

  const filtered = active === "news.all" ? articles : articles.filter((a) => a.category === active);

  return (
    <div className="max-w-5xl mx-auto space-y-7">
      <h1 className="font-heading text-2xl font-bold text-foreground">{t("news.title")}</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 inline-flex items-center gap-1.5 ${
              active === cat
                ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg"
                : "bg-white/70 backdrop-blur-lg shadow-md text-muted-foreground hover:bg-white hover:scale-[1.02]"
            }`}
          >
            <Tags className="h-3.5 w-3.5" />
            {t(cat)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((article, i) => (
          <motion.article
            key={article.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className="group glass-card-hover overflow-hidden cursor-pointer border border-white/40 hover:border-primary/30 rounded-2xl hover:shadow-lg transition-all"
          >
            <div className="h-32 bg-muted/50 flex items-center justify-center text-5xl group-hover:scale-110 transition duration-300">
              {article.image}
            </div>
            <div className="p-5">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                {t(article.category)}
              </span>
              <h3 className="font-heading font-semibold text-foreground mt-2 text-sm leading-snug group-hover:text-primary transition">
                {article.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{article.summary}</p>
              <button className="mt-4 text-xs font-semibold text-primary inline-flex items-center gap-1.5 hover:scale-[1.05] transition-transform">
                {t("news.read_more")}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
