import { useState } from "react";
import { Send, Sparkles, Landmark } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

type Scheme = {
  name?: string;
  description?: string;
  eligibility?: string;
  benefit?: string;
  applyAt?: string;
};

export default function SchemeFinder() {
  const { t } = useI18n();
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    land: "",
    crop: "",
    income: "",
    state: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [schemes, setSchemes] = useState<Scheme[]>([]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center h-[300px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-4">Login Required</p>
          <p className="text-muted-foreground mb-6">Please login to access Scheme Finder</p>
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

  const submit = async () => {
    if (!token) return;

    if (!form.land || !form.crop || !form.income) {
      setError("Land, crop, and income are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.schemes.find(token, {
        land: Number(form.land),
        crop: form.crop,
        income: Number(form.income),
        state: form.state || undefined,
      });
      setSchemes(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch schemes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{t("schemes.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">Find government schemes based on your farm profile.</p>
      </div>

      <div className="glass-card p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground">Land (acres)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={form.land}
            onChange={(e) => setForm((prev) => ({ ...prev, land: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            placeholder="2"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Crop</label>
          <input
            type="text"
            value={form.crop}
            onChange={(e) => setForm((prev) => ({ ...prev, crop: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            placeholder="paddy"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Annual Income (INR)</label>
          <input
            type="number"
            min="0"
            value={form.income}
            onChange={(e) => setForm((prev) => ({ ...prev, income: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            placeholder="120000"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">State (optional)</label>
          <input
            type="text"
            value={form.state}
            onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            placeholder="Telangana"
          />
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-3.5 text-sm font-semibold text-primary-foreground hover:shadow-lg hover:scale-[1.01] transition disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {loading ? "Finding schemes..." : "Find Schemes"}
        </button>

        {error && <p className="md:col-span-2 text-sm text-destructive">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schemes.map((scheme, i) => (
          <motion.div
            key={`${scheme.name || "scheme"}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            className="glass-card p-5 border border-white/40"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Landmark className="h-4 w-4 text-primary" />
              </div>
              <p className="font-semibold text-foreground">{scheme.name || "Scheme"}</p>
            </div>
            <p className="text-sm text-muted-foreground">{scheme.description}</p>
            {scheme.eligibility && <p className="text-sm mt-2"><span className="font-semibold">Eligibility:</span> {scheme.eligibility}</p>}
            {scheme.benefit && <p className="text-sm mt-2"><span className="font-semibold">Benefit:</span> {scheme.benefit}</p>}
            {scheme.applyAt && <p className="text-sm mt-2"><span className="font-semibold">Apply at:</span> {scheme.applyAt}</p>}
          </motion.div>
        ))}
      </div>

      {!loading && schemes.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Enter farm details to get personalized scheme suggestions.</p>
        </div>
      )}
    </div>
  );
}
