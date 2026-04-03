import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Send, Plus, Mic, Volume2, Paperclip, MessageSquare, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import {
  handleSendMessage,
  handleVoiceInput,
  handleFileUploadForCropEvidence,
  type FileEvidenceContext,
} from "@/lib/agriAssistant";

type MessageRole = "user" | "bot";

interface ChatAction {
  labelKey: string;
  to: string;
}

interface ChatAttachment {
  name: string;
  type: string;
  preview?: string;
}

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  sourceText?: string;
  sourceResponse?: string;
  actions?: ChatAction[];
  attachments?: ChatAttachment[];
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

const getStorageKey = (mobile?: string) => `agrimitra-ai-chats-${mobile || "guest"}`;

const createSession = (title: string, greeting: string): ChatSession => ({
  id: `chat-${Date.now()}`,
  title,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [
    {
      id: `msg-${Date.now()}`,
      role: "bot",
      text: greeting,
    },
  ],
});

const speakText = (text: string, lang: string) => {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "te" ? "te-IN" : "en-US";
  utterance.rate = 0.9;

  window.speechSynthesis.speak(utterance);
};

export default function AIAssistant() {
  const { t, lang } = useI18n();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContext, setFileContext] = useState<FileEvidenceContext | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inFlightRef = useRef(false);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId]
  );
  const storageKey = useMemo(() => getStorageKey(user?.mobile), [user?.mobile]);
  const quickSuggestions = useMemo(
    () => [t("ai.suggestion1"), t("ai.suggestion2"), t("ai.suggestion3")],
    [t]
  );

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    const greeting = t("ai.welcome");

    if (!raw) {
      const first = createSession(t("ai.newChat"), greeting);
      setSessions([first]);
      setActiveSessionId(first.id);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as ChatSession[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const first = createSession(t("ai.newChat"), greeting);
        setSessions([first]);
        setActiveSessionId(first.id);
        return;
      }
      setSessions(parsed);
      setActiveSessionId(parsed[0].id);
    } catch {
      const first = createSession(t("ai.newChat"), greeting);
      setSessions([first]);
      setActiveSessionId(first.id);
    }
  }, [t]);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(sessions));
    }
  }, [sessions, storageKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, typing]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (fileContext?.previewUrl) URL.revokeObjectURL(fileContext.previewUrl);
    };
  }, [fileContext?.previewUrl]);

  const createNewChat = () => {
    const newSession = createSession(t("ai.newChat"), t("ai.welcome"));
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInput("");
    setTyping(false);
    setLastQuestion("");
    setLastResponse("");
  };

  const updateActiveSession = (updater: (session: ChatSession) => ChatSession) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId ? updater(session) : session
      )
    );
  };

  const getWeatherHint = (): string | undefined => {
    try {
      const cachedRaw = localStorage.getItem("agrimitra-weather-cache");
      if (!cachedRaw) return undefined;
      const cached = JSON.parse(cachedRaw) as {
        data?: { weather?: Array<{ main?: string }> };
      };
      const weatherMain = cached?.data?.weather?.[0]?.main?.toLowerCase() || "";
      if (weatherMain.includes("rain") || weatherMain.includes("thunder")) {
        return t("ai.responses.weatherRainTip");
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  const send = async (overrideText?: string, actionMode: "normal" | "detail" | "repeat" = "normal") => {
    const messageText = (overrideText ?? input).trim();
    if (!activeSession || (!messageText && !selectedFile)) return;
    if (inFlightRef.current || typing) return;

    inFlightRef.current = true;
    const userText = messageText || t("ai.fileOnlyMessage");
    const fileAttachment: ChatAttachment[] | undefined = selectedFile
      ? [
          {
            name: selectedFile.name,
            type: selectedFile.type || "application/octet-stream",
            preview: fileContext?.previewUrl,
          },
        ]
      : undefined;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      text: userText,
      attachments: fileAttachment,
    };

    updateActiveSession((session) => {
      const nextTitle =
        session.messages.length <= 1 && messageText
          ? messageText.slice(0, 28)
          : session.title;

      return {
        ...session,
        title: nextTitle,
        updatedAt: Date.now(),
        messages: [...session.messages, userMessage],
      };
    });

    const weatherHint = getWeatherHint();
    setInput("");
    setTyping(true);

    try {
      const normalizedQuestion = messageText.toLowerCase();
      const repeatCount = (activeSession.messages || []).filter(
        (msg) => msg.role === "user" && msg.text.trim().toLowerCase() === normalizedQuestion
      ).length;
      const previousResponseText = activeSession.messages
        .slice()
        .reverse()
        .find((msg) => msg.role === "bot")?.text || "";

      const result = await handleSendMessage({
        message: userText,
        appLang: lang,
        apiBaseUrl,
        weatherHint,
        file: selectedFile || undefined,
        fileContext: fileContext || undefined,
        actionMode: actionMode === "normal" && repeatCount > 0 ? "repeat" : actionMode,
        repeatCount,
        previousQuestion:
          lastQuestion ||
          [...activeSession.messages].reverse().find((msg) => msg.role === "user")?.text,
        previousResponse: actionMode === "detail" ? (lastResponse || previousResponseText) : undefined,
      });

      const actions: ChatAction[] = [];
      if (result.analysis.intent === "govt_scheme") {
        actions.push({ labelKey: "ai.actions.openSchemes", to: "/schemes" });
      }
      if (result.analysis.intent === "pest_disease" || result.analysis.intent === "crop_selection" || result.analysis.intent === "sowing") {
        actions.push({ labelKey: "ai.actions.openCropAssistant", to: "/assistant" });
      }
      if (result.analysis.intent === "weather_risk") {
        actions.push({ labelKey: "ai.actions.openDashboard", to: "/dashboard" });
      }
      if (actions.length === 0 && result.sections.confidenceLevel === "Low") {
        actions.push({ labelKey: "ai.actions.openCropAssistant", to: "/assistant" });
      }

      const botMessage: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        role: "bot",
        text: result.formattedText,
        sourceText: userText,
        sourceResponse: result.formattedText,
        actions: actions.length > 0 ? actions : undefined,
      };

      setLastQuestion(userText);
      setLastResponse(result.formattedText);

      updateActiveSession((session) => ({
        ...session,
        updatedAt: Date.now(),
        messages: [...session.messages, botMessage],
      }));
    } catch {
      const fallback: ChatMessage = {
        id: `msg-${Date.now()}-bot-fallback`,
        role: "bot",
        text: t("ai.responses.defaultHelp"),
        actions: [{ labelKey: "ai.actions.openCropAssistant", to: "/assistant" }],
      };
      updateActiveSession((session) => ({
        ...session,
        updatedAt: Date.now(),
        messages: [...session.messages, fallback],
      }));
      setLastQuestion(userText);
      setLastResponse(t("ai.responses.defaultHelp"));
    } finally {
      setTyping(false);
      setSelectedFile(null);
      if (fileContext?.previewUrl) URL.revokeObjectURL(fileContext.previewUrl);
      setFileContext(null);
      inFlightRef.current = false;
    }
  };

  const sendExpanded = (sourceText?: string, sourceResponse?: string) => {
    const question = sourceText || lastQuestion;
    if (question) {
      setLastQuestion(question);
    }
    if (sourceResponse) {
      setLastResponse(sourceResponse);
    }
    void send(question, "detail");
  };

  const onFileChange = (file?: File) => {
    if (!file) return;
    setSelectedFile(file);
    if (fileContext?.previewUrl) URL.revokeObjectURL(fileContext.previewUrl);
    const context = handleFileUploadForCropEvidence(file);
    setFileContext(context);
  };

  const startVoiceInput = async () => {
    try {
      setRecognizing(true);
      const transcript = await handleVoiceInput({
        preferredLanguage: lang === "te" ? "te" : "en",
        apiBaseUrl,
      });
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    } finally {
      setRecognizing(false);
    }
  };

  const speak = async (text: string) => {
    setSpeaking(true);
    try {
      speakText(text, lang);
    } finally {
      setSpeaking(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center h-[300px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-4">{t("auth.loginRequired")}</p>
          <p className="text-muted-foreground mb-6">{t("ai.loginPrompt")}</p>
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

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex gap-4">
      <aside className="hidden md:flex w-72 glass-card p-4 flex-col">
        <button
          onClick={createNewChat}
          className="w-full mb-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" />
          {t("ai.newChat")}
        </button>

        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{t("ai.history")}</p>
        <div className="space-y-2 overflow-y-auto pr-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm border transition ${
                activeSessionId === session.id
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              <div className="font-medium truncate">{session.title || t("ai.newChat")}</div>
            </button>
          ))}
          {sessions.length === 0 && (
            <p className="text-xs text-muted-foreground">{t("ai.noHistory")}</p>
          )}
        </div>
      </aside>

      <section className="flex-1 glass-card p-4 md:p-5 flex flex-col min-h-0">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">{t("ai.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("ai.subtitle")}</p>
          </div>
          <button
            onClick={createNewChat}
            className="md:hidden inline-flex items-center gap-1.5 rounded-lg px-3 py-2 bg-primary text-primary-foreground text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("ai.newChat")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          <div className="flex flex-wrap gap-2 pb-2">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInput(suggestion);
                  void send(suggestion, "normal");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {suggestion}
              </button>
            ))}
          </div>

          {activeSession?.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-md ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-br-md"
                    : "bg-white/70 border border-white/60 text-foreground rounded-bl-md"
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {msg.attachments?.map((a) => (
                  <div key={a.name} className="mt-2 rounded-lg border border-white/40 p-2 bg-white/30">
                    <p className="text-xs font-medium truncate">{a.name}</p>
                    {a.preview && (
                      <img
                        src={a.preview}
                        alt={a.name}
                        className="mt-1 max-h-32 rounded-md object-cover"
                      />
                    )}
                  </div>
                ))}

                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.actions.map((action) => (
                      <button
                        key={`${msg.id}-${action.to}`}
                        onClick={() => navigate(action.to)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {t(action.labelKey)}
                      </button>
                    ))}
                  </div>
                )}

                {msg.role === "bot" && (
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => sendExpanded(msg.sourceText, msg.sourceResponse)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {t("ai.needMoreDetail")}
                    </button>
                    <button
                      onClick={() => speak(msg.text)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      {t("ai.listen")}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="bg-white/70 border border-white/60 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 shadow-md">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="sticky bottom-0 pt-2 bg-transparent">
          {selectedFile && (
            <div className="mb-2 p-2 rounded-lg bg-muted text-xs text-muted-foreground flex items-center justify-between">
              <span className="truncate">{selectedFile.name}</span>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  if (fileContext?.previewUrl) URL.revokeObjectURL(fileContext.previewUrl);
                  setFileContext(null);
                }}
                className="ml-2 text-foreground"
              >
                {t("ai.remove")}
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white/75 backdrop-blur-lg shadow-md rounded-2xl border border-white/50 p-2.5">
            <label className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-muted transition cursor-pointer">
              <Paperclip className="h-4 w-4" />
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={(e) => onFileChange(e.target.files?.[0])}
              />
            </label>

            <button
              onClick={startVoiceInput}
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition ${
                recognizing ? "bg-primary/20 text-primary" : "hover:bg-muted"
              }`}
              title={t("ai.mic")}
            >
              <Mic className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                setSpeaking(false);
              }}
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition ${
                speaking ? "bg-destructive/20 text-destructive" : "hover:bg-muted"
              }`}
              title={t("ai.stop")}
            >
              <Volume2 className="h-4 w-4" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t("ai.placeholder")}
              className="flex-1 bg-transparent text-sm outline-none px-1 text-foreground placeholder:text-muted-foreground"
            />

            <button
              onClick={() => void send()}
              disabled={typing || inFlightRef.current || (!input.trim() && !selectedFile)}
              className="h-10 rounded-xl px-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground flex items-center justify-center gap-1.5 hover:shadow-lg transition disabled:opacity-40"
            >
              <Bot className="h-3.5 w-3.5" />
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
