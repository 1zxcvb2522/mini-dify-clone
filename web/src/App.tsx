// App.tsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Chat from "./Chat";
import Settings from "./Settings";
import WorkflowEditor from "./workflow/WorkflowEditor";
import "./App.css";

export interface AppData {
  id: string;
  name: string;
  model: string;
  systemPrompt: string;
  temperature: number;
}

const MAX_MESSAGES = 1000;

const trimChatHistory = () => {
  try {
    const raw = localStorage.getItem("chat");
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.messages) && saved.messages.length > MAX_MESSAGES) {
      saved.messages = saved.messages.slice(-MAX_MESSAGES);
      localStorage.setItem("chat", JSON.stringify(saved));
    }
  } catch {
    /* ignore */
  }
};

export default function App() {
  const [apps, setApps] = useState<AppData[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("apps") || "[]");
      return stored.length ? stored : [
        { id: "app1", name: "Мой помощник", model: "gpt-3.5-turbo", systemPrompt: "Ты полезный ассистент.", temperature: 0.7 },
      ];
    } catch {
      return [
        { id: "app1", name: "Мой помощник", model: "gpt-3.5-turbo", systemPrompt: "Ты полезный ассистент.", temperature: 0.7 },
      ];
    }
  });

  const [active, setActive] = useState<string>(apps[0]?.id || "");
  const [page, setPage] = useState<"chat" | "settings">("chat");

  // ограничиваем историю при каждом изменении `apps`
  useEffect(() => {
    trimChatHistory();
  }, [apps]);

  const save = (newList: AppData[]) => {
    setApps(newList);
    localStorage.setItem("apps", JSON.stringify(newList));
  };

  const currentApp = apps.find(a => a.id === active);
  if (!currentApp) {
    // fallback – создаём дефолтное приложение
    const fallback: AppData = {
      id: "app" + Date.now(),
      name: "Демо-приложение",
      model: "gpt-3.5-turbo",
      systemPrompt: "",
      temperature: 0.7,
    };
    save([fallback]);
    setActive(fallback.id);
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="App">
              <nav>
                <ul>
                  {apps.map(a => (
                    <li key={a.id} onClick={() => setActive(a.id)}>
                      {a.name}
                    </li>
                  ))}
                  <li
                    onClick={() => {
                      const id = "app" + Date.now();
                      const newApp: AppData = {
                        id,
                        name: "Новое приложение",
                        model: "gpt-3.5-turbo",
                        systemPrompt: "",
                        temperature: 0.7,
                      };
                      save([...apps, newApp]);
                      setActive(id);
                      setPage("settings");
                    }}
                  >
                    + Новое
                  </li>
                </ul>
                <button onClick={() => setPage(p => (p === "chat" ? "settings" : "chat"))}>
                  {page === "chat" ? "⚙️" : "💬"}
                </button>
              </nav>

              {page === "chat" ? (
                <Chat app={currentApp!} />
              ) : (
                <Settings
                  app={currentApp!}
                  setApp={a => save(apps.map(x => (x.id === a.id ? a : x)))}
                />
              )}
            </div>
          }
        />
        <Route path="/workflow" element={<WorkflowEditor />} />
      </Routes>
    </Router>
  );
}
