import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

interface Message {
  role: "user" | "bot";
  text: string;
}

const quickQuestions = [
  "PM Kisan eligibility",
  "Crop insurance schemes",
  "Subsidy for drip irrigation",
  "Organic farming support",
];

export default function SchemeFinder() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hello! I can help you find government schemes for agriculture. What would you like to know?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `Here's what I found about "${text}":\n\n✅ PM-KISAN provides ₹6,000/year to eligible farmer families in 3 installments.\n\n📋 Eligibility: All landholding farmer families with cultivable land.\n\n📞 Contact your nearest Agriculture Office or visit pmkisan.gov.in for more details.`,
        },
      ]);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      <div className="mb-4">
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
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "glass-card rounded-bl-md text-foreground"
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
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
                  onClick={() => send(q)}
                  className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-foreground hover:bg-secondary transition-colors active:scale-[0.97]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 bg-card rounded-xl border border-border p-2">
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
          className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-40 active:scale-[0.95]"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
