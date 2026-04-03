import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, CornerDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "bot";
  text?: string;
  key?: string;
  params?: Record<string, string | number>;
}

const quickQuestions = [
  "schemes.q1",
  "schemes.q2",
  "schemes.q3",
  "schemes.q4",
];

export default function SchemeFinder() {
  const { t, lang } = useI18n();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", key: "schemes.greeting" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    setMessages([{ role: "bot", key: "schemes.greeting" }]);
    setTyping(false);
  }, [lang]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center h-[300px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-4">{t("auth.loginRequired")}</p>
          <p className="text-muted-foreground mb-6">{t("schemes.loginPrompt")}</p>
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

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setTyping(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/api/schemes/chat?lang=${lang}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, lang }),
      });

      if (response.ok) {
        const payload = await response.json();
        const reply = payload?.reply;
        if (typeof reply === "string" && reply.trim()) {
          setMessages((prev) => [...prev, { role: "bot", text: reply }]);
          return;
        }
      }
    } catch {
      // Fall through to localized offline template.
    } finally {
      setTyping(false);
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "bot",
        key: "schemes.botTemplate",
        params: { query: text },
      },
    ]);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      <div className="mb-5">
        <h1 className="font-heading text-2xl font-bold text-foreground">{t("schemes.title")}</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line shadow-md ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-br-md hover:shadow-lg transition"
                  : "glass-card rounded-bl-md text-foreground"
              }`}
            >
              {msg.text ?? t(msg.key || "", msg.params)}
            </div>
          </motion.div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 shadow-md">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        {messages.length === 1 && !typing && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground font-medium mb-2">{t("schemes.quick")}</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => send(t(q))}
                  className="px-3.5 py-2 rounded-full bg-white/70 backdrop-blur-lg shadow-md text-xs font-medium text-foreground hover:bg-white hover:scale-[1.02] transition-all duration-300 active:scale-[0.97] inline-flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-secondary" />
                  {t(q)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 bg-white/70 backdrop-blur-lg shadow-md rounded-2xl border border-white/50 p-2.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder={t("schemes.ask")}
          className="flex-1 bg-transparent text-sm outline-none px-2 text-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim()}
          className="h-10 rounded-xl px-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground flex items-center justify-center gap-1.5 hover:shadow-lg hover:scale-[1.02] transition duration-300 disabled:opacity-40 active:scale-[0.95]"
        >
          <CornerDownRight className="h-3.5 w-3.5" />
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
