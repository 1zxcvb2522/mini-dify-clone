import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Chat from "./Chat";
import Settings from "./Settings";
import WorkflowEditor from "./workflow/WorkflowEditor";
import "./App.css";

export default function App() {
  const [apps, setApps] = useState(
    JSON.parse(localStorage.getItem("apps") || "[]") || [
      { id: "app1", name: "Мой помощник", model: "gpt-3.5-turbo", systemPrompt: "Ты полезный ассистент.", temperature: 0.7 },
    ]
  );
  const [active, setActive] = useState(apps[0]?.id);
  const [page, setPage] = useState<"chat" | "settings">("chat");

  const app = apps.find((a) => a.id === active)!;

  const save = (newList) => {
    setApps(newList);
    localStorage.setItem("apps", JSON.stringify(newList));
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="App">
            <nav>
              <ul>
                {apps.map((a) => (
                  <li key={a.id} onClick={() => setActive(a.id)}>
                    {a.name}
                  </li>
                ))}
                <li
                  onClick={() => {
                    const id = "app" + Date.now();
                    save([...apps, { id, name: "Новое приложение", model: "gpt-3.5-turbo", systemPrompt: "", temperature: 0.7 }]);
                    setActive(id);
                    setPage("settings");
                  }}
                  // ограничиваем историю
const MAX = 1000;
const raw = localStorage.getItem("chat");
if (raw) {
  const saved = JSON.parse(raw);
  saved.messages = saved.messages?.slice(-MAX);
  localStorage.setItem("chat", JSON.stringify(saved));
}
                >     
                  + Новое
                </li>
              </ul>
              <button onClick={() => setPage(page === "chat" ? "settings" : "chat")}>
                {page === "chat" ? "⚙️" : "💬"}
              </button>
            </nav>

            {page === "chat" ? (
              <Chat app={app} />
            ) : (
              <Settings
                app={app}
                setApp={(a) => save(apps.map((x) => (x.id === a.id ? a : x)))}
              />
            )}
          </div>
        } />
        <Route path="/workflow" element={<WorkflowEditor />} />
      </Routes>
    </Router>
  );
