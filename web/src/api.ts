export async function* streamChat(
  messages: any[],
  model = "gpt-3.5-turbo",
  temperature = 0.7
) {
  const res = await fetch("http://localhost:8001/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature, stream: true }),
  });
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop()!;
    for (const line of lines) {
      if (line.startsWith("data: ") && line !== "data: [DONE]") {
        try {
          const json = JSON.parse(line.slice(6));
          const delta = json.choices[0]?.delta?.content;
          if (delta) yield delta;
        } catch {}
      }
    }
  }
}