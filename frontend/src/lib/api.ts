const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
  formData?: FormData;
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = "GET", token, body, formData } = options;

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!formData) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: formData ? formData : body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return payload as T;
};

export const api = {
  baseUrl: API_BASE_URL,

  auth: {
    signup: (data: { name: string; phone: string; password: string }) =>
      request<{ success: boolean; data: { token: string; user: { id: string; name: string; phone: string } } }>("/api/auth/signup", {
        method: "POST",
        body: data,
      }),

    login: (data: { phone: string; password: string }) =>
      request<{ success: boolean; data: { token: string; user: { id: string; name: string; phone: string } } }>("/api/auth/login", {
        method: "POST",
        body: data,
      }),

    me: (token: string) =>
      request<{ success: boolean; data: { user: { id: string; name: string; phone: string } } }>("/api/auth/me", {
        token,
      }),
  },

  crop: {
    analyze: (token: string, file: File, lang: "en" | "te" = "en") => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("lang", lang);
      return request<{ success: boolean; data: any }>("/api/crop/analyze", {
        method: "POST",
        token,
        formData,
      });
    },

    history: (token: string) =>
      request<{ success: boolean; data: any[] }>("/api/crop/history", { token }),
  },

  schemes: {
    find: (token: string, data: { land: number; crop: string; income: number; state?: string }) =>
      request<{ success: boolean; data: any[] }>("/api/schemes", {
        method: "POST",
        token,
        body: data,
      }),
  },

  news: {
    list: (token: string) => request<{ success: boolean; data: any[] }>("/api/news", { token }),
  },

  chat: {
    listSessions: (token: string) =>
      request<{ success: boolean; data: Array<{ sessionId: string; title: string; updatedAt: string }> }>(
        "/api/chat/sessions",
        { token }
      ),

    getSession: (token: string, sessionId: string) =>
      request<{ success: boolean; data: { sessionId: string; title: string; messages: any[] } }>(
        `/api/chat/sessions/${sessionId}`,
        { token }
      ),

    saveSession: (
      token: string,
      data: { sessionId: string; title: string; messages: Array<{ role: string; text: string; attachments?: any[] }> }
    ) =>
      request<{ success: boolean; data: { sessionId: string; title: string } }>("/api/chat/sessions", {
        method: "POST",
        token,
        body: data,
      }),

    deleteSession: (token: string, sessionId: string) =>
      request<{ success: boolean }>(`/api/chat/sessions/${sessionId}`, {
        method: "DELETE",
        token,
      }),
  },
};
