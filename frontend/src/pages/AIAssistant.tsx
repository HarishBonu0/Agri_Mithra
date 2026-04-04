import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Send, Plus, Mic, Volume2, Paperclip, MessageSquare, Sparkles, Trash2, VolumeX } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  handleSendMessage,
  handleVoiceInput,
  handleVoiceOutput,
  handleFileUploadForCropEvidence,
  type AssistantLanguage,
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
  language?: AssistantLanguage;
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

type QueryMode = "text" | "voice";

const detectVoiceLanguageHint = (text: string): AssistantLanguage | undefined => {
  if (!text) return undefined;
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  if (/(nenu|meeru|panta|raithu|vari|biyyam|nela)\b/i.test(text)) return "te";
  return undefined;
};

const LOCAL_STORAGE_KEY = (mobile?: string) => `agrimitra-ai-chats-${mobile || "guest"}`;

const createSession = (title: string, greeting: string): ChatSession => ({
  id: `chat-${Date.now()}`,
  title,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [{ id: `msg-${Date.now()}`, role: "bot", text: greeting }],
});

const normalizeMessages = (messages: unknown, greeting: string): ChatMessage[] => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return [{ id: `msg-init-${Date.now()}`, role: "bot", text: greeting }];
  }

  return messages.map((m, index) => {
    const item = (m || {}) as Partial<ChatMessage>;
    return {
      id: item.id || `msg-${Date.now()}-${index}`,
      role: item.role === "user" ? "user" : "bot",
      text: String(item.text || ""),
      language: item.language,
      sourceText: item.sourceText,
      sourceResponse: item.sourceResponse,
      actions: Array.isArray(item.actions) ? item.actions : undefined,
      attachments: Array.isArray(item.attachments) ? item.attachments : undefined,
    };
  });
};

export default function AIAssistant() {
  const { t, lang } = useI18n();
  const { isLoggedIn, user, token } = useAuth();
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
  const [dbLoaded, setDbLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inFlightRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId]
  );

  const storageKey = useMemo(() => LOCAL_STORAGE_KEY(user?.mobile), [user?.mobile]);

  const quickSuggestions = useMemo(
    () => [t("ai.suggestion1"), t("ai.suggestion2"), t("ai.suggestion3")],
    [t]
  );

  // ── Load sessions: DB first (if logged in), fallback localStorage ────────────
  useEffect(() => {
    const greeting = t("ai.welcome");

    const loadFromLocal = () => {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as ChatSession[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalized = parsed.map((session, sIndex) => ({
              ...session,
              id: session.id || `chat-${Date.now()}-${sIndex}`,
              messages: normalizeMessages(session.messages, greeting),
            }));
            setSessions(normalized);
            setActiveSessionId(normalized[0].id);
            return;
          }
        } catch { /* fall through */ }
      }
      const first = createSession(t("ai.newChat"), greeting);
      setSessions([first]);
      setActiveSessionId(first.id);
    };

    if (!isLoggedIn || !token) {
      loadFromLocal();
      setDbLoaded(true);
      return;
    }

    api.chat.listSessions(token)
      .then(async (res) => {
        if (!res.data || res.data.length === 0) {
          loadFromLocal();
          setDbLoaded(true);
          return;
        }

        // Load the most recent session fully; load others lazily
        const firstDbSession = res.data[0];
        const fullRes = await api.chat.getSession(token, firstDbSession.sessionId);
        const fullSession: ChatSession = {
          id: fullRes.data.sessionId,
          title: fullRes.data.title,
          messages: normalizeMessages(fullRes.data.messages, greeting),
          createdAt: new Date(firstDbSession.updatedAt).getTime(),
          updatedAt: new Date(firstDbSession.updatedAt).getTime(),
        };

        // Build stub sessions for the rest (load on click)
        const stubs: ChatSession[] = res.data.slice(1).map((s) => ({
          id: s.sessionId,
          title: s.title,
          messages: [],
          createdAt: new Date(s.updatedAt).getTime(),
          updatedAt: new Date(s.updatedAt).getTime(),
        }));

        setSessions([fullSession, ...stubs]);
        setActiveSessionId(fullSession.id);
        setDbLoaded(true);
      })
      .catch(() => {
        loadFromLocal();
        setDbLoaded(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, token, storageKey]);

  // ── Auto-save sessions to localStorage and DB ─────────────────────────────────
  useEffect(() => {
    if (!dbLoaded || sessions.length === 0) return;
    localStorage.setItem(storageKey, JSON.stringify(sessions));

    if (!isLoggedIn || !token || !activeSession) return;

    // Debounce DB save by 1.5s to avoid hammering on every keystroke
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      api.chat.saveSession(token, {
        sessionId: activeSession.id,
        title: activeSession.title,
        messages: activeSession.messages.map((m) => ({
          role: m.role,
          text: m.text,
          attachments: m.attachments?.map((a) => ({ name: a.name, type: a.type })),
        })),
      }).catch(() => { /* non-fatal */ });
    }, 1500);
  }, [sessions, storageKey, isLoggedIn, token, activeSession, dbLoaded]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, typing]);

  // ── Cleanup TTS and preview URL on unmount ────────────────────────────────────
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (fileContext?.previewUrl) URL.revokeObjectURL(fileContext.previewUrl);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [fileContext?.previewUrl]);

  const updateActiveSession = useCallback(
    (updater: (session: ChatSession) => ChatSession) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? updater(s) : s))
      );
    },
    [activeSessionId]
  );

  const createNewChat = () => {
    const newSession = createSession(t("ai.newChat"), t("ai.welcome"));
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInput("");
    setTyping(false);
  };

  // Load a session from DB on demand (for stub sessions)
  const selectSession = async (session: ChatSession) => {
    if (session.messages.length > 0) {
      setActiveSessionId(session.id);
      return;
    }

    // Stub session — load from DB
    if (token) {
      try {
        const res = await api.chat.getSession(token, session.id);
        const loaded = normalizeMessages(res.data.messages, t("ai.welcome"));
        setSessions((prev) =>
          prev.map((s) => (s.id === session.id ? { ...s, messages: loaded } : s))
        );
      } catch { /* show empty */ }
    }
    setActiveSessionId(session.id);
  };

  const deleteCurrentSession = async () => {
    if (!activeSession) return;

    if (token) {
      api.chat.deleteSession(token, activeSession.id).catch(() => { /* non-fatal */ });
    }

    const remaining = sessions.filter((s) => s.id !== activeSessionId);
    if (remaining.length === 0) {
      const newSession = createSession(t("ai.newChat"), t("ai.welcome"));
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    } else {
      setSessions(remaining);
      setActiveSessionId(remaining[0].id);
    }
  };

  const getWeatherHint = (): string | undefined => {
    try {
      const raw = localStorage.getItem("agrimitra-weather-cache");
      if (!raw) return undefined;
      const cached = JSON.parse(raw) as { data?: { weather?: Array<{ main?: string }> } };
      const main = cached?.data?.weather?.[0]?.main?.toLowerCase() || "";
      if (main.includes("rain") || main.includes("thunder")) return t("ai.responses.weatherRainTip");
      return undefined;
    } catch {
      return undefined;
    }
  };

  const send = async (
    overrideText?: string,
    queryMode: QueryMode = "text",
    explicitLanguage?: AssistantLanguage
  ) => {
    const messageText = (overrideText ?? input).trim();
    if (!activeSession || (!messageText && !selectedFile)) return;
    if (inFlightRef.current || typing) return;

    inFlightRef.current = true;
    const userText = messageText || t("ai.fileOnlyMessage");

    const fileAttachment: ChatAttachment[] | undefined = selectedFile
      ? [{ name: selectedFile.name, type: selectedFile.type || "application/octet-stream", preview: fileContext?.previewUrl }]
      : undefined;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      text: userText,
      attachments: fileAttachment,
    };

    updateActiveSession((s) => ({
      ...s,
      title: s.messages.length <= 1 && messageText ? messageText.slice(0, 40) : s.title,
      updatedAt: Date.now(),
      messages: [...s.messages, userMessage],
    }));

    setInput("");
    setTyping(true);

    // Build history from current session for context (exclude the greeting message, last 12 msgs)
    const history = (activeSession.messages || [])
      .filter((m, idx) => !(m.role === "bot" && idx === 0 && typeof m.id === "string" && m.id.startsWith("msg-")))
      .slice(-12)
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      const result = await handleSendMessage({
        message: userText,
        appLang: lang,
        explicitLanguage,
        apiBaseUrl,
        weatherHint: getWeatherHint(),
        file: selectedFile || undefined,
        fileContext: fileContext || undefined,
        token: token || undefined,
        history,
      });

      const actions: ChatAction[] = [];
      if (result.analysis.intent === "govt_scheme") {
        actions.push({ labelKey: "ai.actions.openSchemes", to: "/schemes" });
      }
      if (["pest_disease", "crop_selection", "sowing"].includes(result.analysis.intent)) {
        actions.push({ labelKey: "ai.actions.openCropAssistant", to: "/assistant" });
      }
      if (result.analysis.intent === "weather_risk") {
        actions.push({ labelKey: "ai.actions.openDashboard", to: "/dashboard" });
      }

      const botMessage: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        role: "bot",
        text: result.formattedText,
        language: result.language,
        sourceText: userText,
        sourceResponse: result.formattedText,
        actions: actions.length > 0 ? actions : undefined,
      };

      updateActiveSession((s) => ({
        ...s,
        updatedAt: Date.now(),
        messages: [...s.messages, botMessage],
      }));

      // Voice query: auto-read assistant response aloud.
      if (queryMode === "voice") {
        await speakMessage(botMessage.text, result.language);
      }
    } catch {
      const fallbackText = t("ai.responses.defaultHelp");
      updateActiveSession((s) => ({
        ...s,
        updatedAt: Date.now(),
        messages: [
          ...s.messages,
          {
            id: `msg-${Date.now()}-bot-err`,
            role: "bot",
            text: fallbackText,
            actions: [{ labelKey: "ai.actions.openCropAssistant", to: "/assistant" }],
          },
        ],
      }));

      if (queryMode === "voice") {
        await speakMessage(fallbackText);
      }
    } finally {
      setTyping(false);
      setSelectedFile(null);
      if (fileContext?.previewUrl) URL.revokeObjectURL(fileContext.previewUrl);
      setFileContext(null);
      inFlightRef.current = false;
    }
  };

  const onFileChange = (file?: File) => {
    if (!file) return;
    setSelectedFile(file);
    if (fileContext?.previewUrl) URL.revokeObjectURL(fileContext.previewUrl);
    setFileContext(handleFileUploadForCropEvidence(file));
  };

  const startVoiceInput = async () => {
    try {
      setRecognizing(true);
      const preferredLanguage: AssistantLanguage = lang === "te" ? "te" : "en";
      const transcript = await handleVoiceInput({ preferredLanguage, apiBaseUrl });
      if (!transcript) return;

      // Voice mode: send immediately and return spoken answer automatically.
      setInput(transcript);
      const detectedVoiceLang = detectVoiceLanguageHint(transcript);
      await send(transcript, "voice", detectedVoiceLang || preferredLanguage);
    } finally {
      setRecognizing(false);
    }
  };

  const speakMessage = async (
    text: string,
    preferredLanguage?: AssistantLanguage
  ) => {
    setSpeaking(true);
    try {
      await handleVoiceOutput({
        text,
        preferredLanguage: preferredLanguage || (lang === "te" ? "te" : "en"),
        apiBaseUrl,
      });
    } finally {
      setSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    handleVoiceOutput({ text: "", preferredLanguage: "en", apiBaseUrl, stop: true });
    setSpeaking(false);
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
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-72 glass-card p-4 flex-col">
        <button
          onClick={createNewChat}
          className="w-full mb-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" />
          {t("ai.newChat")}
        </button>

        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{t("ai.history")}</p>
        <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
          {sessions.map((session) => (
            <div key={session.id} className="group flex items-center gap-1">
              <button
                onClick={() => selectSession(session)}
                className={`flex-1 text-left rounded-lg px-3 py-2 text-sm border transition truncate ${
                  activeSessionId === session.id
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-card border-border text-foreground hover:bg-muted"
                }`}
              >
                <span className="truncate block">{session.title || t("ai.newChat")}</span>
              </button>
              <button
                onClick={() => {
                  if (session.id === activeSessionId) {
                    deleteCurrentSession();
                  } else {
                    const remaining = sessions.filter((s) => s.id !== session.id);
                    if (token) api.chat.deleteSession(token, session.id).catch(() => {});
                    setSessions(remaining.length > 0 ? remaining : [createSession(t("ai.newChat"), t("ai.welcome"))]);
                    if (session.id === activeSessionId && remaining.length > 0) setActiveSessionId(remaining[0].id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-destructive transition"
                title="Delete chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-xs text-muted-foreground">{t("ai.noHistory")}</p>
          )}
        </div>
      </aside>

      {/* ── Chat area ───────────────────────────────────────────────────────── */}
      <section className="flex-1 glass-card p-4 md:p-5 flex flex-col min-h-0">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">{t("ai.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("ai.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={createNewChat}
              className="md:hidden inline-flex items-center gap-1.5 rounded-lg px-3 py-2 bg-primary text-primary-foreground text-xs font-medium"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("ai.newChat")}
            </button>
            {activeSession && (
              <button
                onClick={deleteCurrentSession}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                title="Delete this chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {/* Quick suggestion chips */}
          <div className="flex flex-wrap gap-2 pb-2">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => void send(suggestion)}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {suggestion}
              </button>
            ))}
          </div>

          {activeSession?.messages.map((msg, idx) => (
            <motion.div
              key={msg.id || `${msg.role}-${idx}`}
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
                {/* Message text */}
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                {/* File attachments */}
                {msg.attachments?.map((a) => (
                  <div key={a.name} className="mt-2 rounded-lg border border-white/40 p-2 bg-white/30">
                    <p className="text-xs font-medium truncate">{a.name}</p>
                    {a.preview && (
                      <img src={a.preview} alt={a.name} className="mt-1 max-h-32 rounded-md object-cover" />
                    )}
                  </div>
                ))}

                {/* Action buttons */}
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

                {/* Bot message controls */}
                {msg.role === "bot" && (
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => speakMessage(msg.text, msg.language)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      title={t("ai.listen")}
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

        {/* ── Input bar ─────────────────────────────────────────────────────── */}
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
            {/* File attach */}
            <label className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-muted transition cursor-pointer" title="Attach file">
              <Paperclip className="h-4 w-4" />
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={(e) => onFileChange(e.target.files?.[0])}
              />
            </label>

            {/* Mic */}
            <button
              onClick={startVoiceInput}
              disabled={recognizing}
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition ${
                recognizing ? "bg-primary/20 text-primary animate-pulse" : "hover:bg-muted"
              }`}
              title={t("ai.mic")}
            >
              <Mic className="h-4 w-4" />
            </button>

            {/* Stop speaking */}
            {speaking ? (
              <button
                onClick={stopSpeaking}
                className="h-10 w-10 rounded-xl flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
                title={t("ai.stop")}
              >
                <VolumeX className="h-4 w-4" />
              </button>
            ) : null}

            {/* Text input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void send()}
              placeholder={t("ai.placeholder")}
              className="flex-1 bg-transparent text-sm outline-none px-1 text-foreground placeholder:text-muted-foreground"
            />

            {/* Send */}
            <button
              onClick={() => void send()}
              disabled={typing || (!input.trim() && !selectedFile)}
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
