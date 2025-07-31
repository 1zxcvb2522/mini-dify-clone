import { useEffect, useRef, useState } from "react";
import { streamChat } from "./api";

export default function Chat({ app }) {
  const [msgs, setMsgs] = useState<{ role: string; content: string }[]>(
    JSON.parse(localStorage.getItem(app.id) || "[]")
  );
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(app.id, JSON.stringify(msgs));
  }, [msgs, app.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");

    const system = { role: "system", content: app.systemPrompt };
    const messages = [system, ...newMsgs];
    let botContent = "";
    setMsgs((prev) => [...prev, { role: "assistant", content: "" }]);

    for await (const chunk of streamChat(messages, app.model, app.temperature)) {
      botContent += chunk;
      setMsgs((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, content: botContent } : m
        )
      );
    }
  };

  return (
    <div className="chat">
      <div className="messages">
        {msgs.map((m, i) => (
          <div key={i} className={m.role}>
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="inputArea">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Спросите что-нибудь..."
        />
        <button onClick={send}>➤</button>
      </div>
    </div>
  );
}