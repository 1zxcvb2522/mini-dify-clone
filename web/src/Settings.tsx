import { useState } from "react";

export default function Settings({ app, setApp }) {
  return (
    <div className="settings">
      <h2>Настройки «{app.name}»</h2>
      <label>
        Системный prompt
        <textarea
          value={app.systemPrompt}
          onChange={(e) =>
            setApp({ ...app, systemPrompt: e.target.value })
          }
          rows={6}
        />
      </label>
      <label>
        Модель
        <input
          value={app.model}
          onChange={(e) => setApp({ ...app, model: e.target.value })}
        />
      </label>
      <label>
        Temperature
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={app.temperature}
          onChange={(e) =>
            setApp({ ...app, temperature: parseFloat(e.target.value) })
          }
        />
        {app.temperature}
      </label>
    </div>
  );
}