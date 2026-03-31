import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import pty from "node-pty";
import { WebSocketServer } from "ws";

const PORT = Number(process.env.PORT || 3000);
const ROOT = process.cwd();
const SSH_BINARY =
  process.env.SSH_BINARY ||
  (process.platform === "win32" ? "C:\\Windows\\System32\\OpenSSH\\ssh.exe" : "ssh");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = http.createServer((req, res) => {
  const requestPath = req.url === "/" ? "/index.html" : req.url;
  const safePath = path.normalize(decodeURIComponent(requestPath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(error.code === "ENOENT" ? 404 : 500, {
        "Content-Type": "text/plain; charset=utf-8"
      });
      res.end(error.code === "ENOENT" ? "Not Found" : "Internal Server Error");
      return;
    }

    res.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    res.end(content);
  });
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  const session = createSession(socket);

  send(socket, "status", { text: "WebSocket connected." });

  socket.on("message", async (buffer) => {
    let payload;
    try {
      payload = JSON.parse(buffer.toString());
    } catch {
      send(socket, "error", { text: "Invalid JSON payload." });
      return;
    }

    try {
      switch (payload.type) {
        case "connect-ssh":
          handleConnectSsh(session, payload.data);
          break;
        case "terminal-input":
          handleTerminalInput(session, payload.data);
          break;
        case "terminal-resize":
          handleTerminalResize(session, payload.data);
          break;
        case "request-ai-command":
          await handleAiCommand(session, payload.data);
          break;
        case "execute-ai-command":
          executeGeneratedCommand(session);
          break;
        case "disconnect-ssh":
          teardownSession(session, "SSH session disconnected.");
          break;
        default:
          send(socket, "error", { text: `Unsupported message type: ${payload.type}` });
      }
    } catch (error) {
      send(socket, "error", { text: error.message || String(error) });
    }
  });

  socket.on("close", () => {
    teardownSession(session);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

function createSession(socket) {
  return {
    socket,
    ptyProcess: null,
    aiConfig: null,
    lastGeneratedCommand: "",
    connectTimers: [],
    sshState: createSshState()
  };
}

function createSshState() {
  return {
    authMode: "key",
    firstOutputSeen: false,
    promptedPassword: false,
    connected: false,
    host: "",
    username: ""
  };
}

function handleConnectSsh(session, data) {
  teardownSession(session);

  const host = String(data.host || "").trim();
  const username = String(data.username || "").trim();
  const port = String(data.port || "22").trim();
  const authMode = data.authMode === "password" ? "password" : "key";
  const privateKeyPath = String(data.privateKeyPath || "").trim();
  const cols = clampDimension(data.cols, 120);
  const rows = clampDimension(data.rows, 30);

  if (!host || !username) {
    throw new Error("SSH host and username are required.");
  }

  const args = ["-tt", "-p", port, "-o", "StrictHostKeyChecking=no"];

  if (authMode === "key") {
    if (privateKeyPath) {
      args.push("-i", privateKeyPath);
    }
    args.push("-o", "PreferredAuthentications=publickey");
  } else {
    args.push("-o", "PubkeyAuthentication=no");
    args.push("-o", "PreferredAuthentications=password,keyboard-interactive");
  }

  args.push(`${username}@${host}`);

  const ptyProcess = pty.spawn(SSH_BINARY, args, {
    name: "xterm-color",
    cols,
    rows,
    cwd: ROOT,
    env: process.env
  });

  session.ptyProcess = ptyProcess;
  session.aiConfig = data.aiConfig || null;
  session.sshState = {
    authMode,
    firstOutputSeen: false,
    promptedPassword: false,
    connected: false,
    host,
    username
  };

  scheduleConnectHints(session);

  ptyProcess.onData((chunk) => {
    inspectSshOutput(session, chunk);
    send(session.socket, "terminal-output", { text: chunk });
  });

  ptyProcess.onExit(({ exitCode, signal }) => {
    clearConnectTimers(session);
    send(session.socket, "status", {
      text: `SSH session closed. exitCode=${exitCode} signal=${signal}`
    });
    session.ptyProcess = null;
  });

  send(session.socket, "status", {
    text:
      authMode === "password"
        ? "Connecting SSH session. Wait for the password prompt, then type the password in the terminal."
        : "Connecting SSH session."
  });
}

function handleTerminalInput(session, data) {
  if (!session.ptyProcess) {
    throw new Error("No active SSH session.");
  }

  session.ptyProcess.write(String(data.text || ""));
}

function handleTerminalResize(session, data) {
  if (!session.ptyProcess) {
    return;
  }

  session.ptyProcess.resize(clampDimension(data.cols, 120), clampDimension(data.rows, 30));
}

async function handleAiCommand(session, data) {
  if (!session.ptyProcess) {
    throw new Error("Connect SSH before using AI command generation.");
  }

  const aiConfig = data.aiConfig || session.aiConfig;
  if (!resolveChatCompletionsUrl(aiConfig) || !aiConfig?.model || !aiConfig?.apiKey) {
    throw new Error("AI baseUrl, model, and API key are required.");
  }

  const instruction = String(data.instruction || "").trim();
  if (!instruction) {
    throw new Error("Natural language instruction is required.");
  }

  session.aiConfig = aiConfig;
  send(session.socket, "status", { text: "Generating shell command with AI..." });

  const commandPlan = await generateCommand(aiConfig, instruction);
  session.lastGeneratedCommand = commandPlan.command;
  send(session.socket, "ai-command", commandPlan);

  if (data.autoExecute) {
    executeGeneratedCommand(session);
  }
}

function executeGeneratedCommand(session) {
  if (!session.ptyProcess) {
    throw new Error("No active SSH session.");
  }

  if (!session.lastGeneratedCommand) {
    throw new Error("No AI-generated command available.");
  }

  session.ptyProcess.write(`${session.lastGeneratedCommand}\r`);
  send(session.socket, "status", {
    text: `Executed AI command: ${session.lastGeneratedCommand}`
  });
}

async function generateCommand(aiConfig, instruction) {
  const extraHeaders = parseJson(aiConfig.headers || "{}", "Extra headers");
  const extraBody = parseJson(aiConfig.requestTemplate || "{}", "Advanced params");
  const requestUrl = resolveChatCompletionsUrl(aiConfig);

  if (!requestUrl) {
    throw new Error("AI baseUrl is required.");
  }

  const systemPrompt =
    aiConfig.systemPrompt ||
    [
      "You translate user intent into safe shell commands for a Linux SSH terminal.",
      "Return JSON only.",
      'Schema: {"command":"string","explanation":"string","risk":"low|medium|high"}',
      "Prefer one command line when possible.",
      "Do not wrap output in markdown fences."
    ].join(" ");

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${aiConfig.apiKey}`,
      ...extraHeaders
    },
    body: JSON.stringify({
      model: aiConfig.model,
      temperature: Number(aiConfig.temperature || 0.2),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a shell command for this request: ${instruction}` }
      ],
      ...extraBody
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data?.error?.message || data?.message || `AI request failed with status ${response.status}`
    );
  }

  const text =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    data?.output?.[0]?.content?.[0]?.text ||
    "";

  if (!text) {
    throw new Error("AI returned no command content.");
  }

  const parsed = parseModelJson(text);
  if (!parsed.command) {
    throw new Error("AI response does not include a command.");
  }

  return {
    command: String(parsed.command).trim(),
    explanation: String(parsed.explanation || ""),
    risk: String(parsed.risk || "unknown")
  };
}

function resolveChatCompletionsUrl(aiConfig) {
  const raw = String(aiConfig?.baseUrl || aiConfig?.endpoint || "").trim();
  if (!raw) {
    return "";
  }

  if (/\/chat\/completions\/?$/i.test(raw)) {
    return raw.replace(/\/+$/, "");
  }

  return `${raw.replace(/\/+$/, "")}/chat/completions`;
}

function parseModelJson(text) {
  const trimmed = String(text).trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("AI output is not valid JSON.");
    }
    return JSON.parse(match[0]);
  }
}

function parseJson(text, label) {
  try {
    return JSON.parse(text || "{}");
  } catch (error) {
    throw new Error(`${label} JSON parse failed: ${error.message}`);
  }
}

function inspectSshOutput(session, chunk) {
  const text = stripAnsi(String(chunk || ""));
  if (!text) {
    return;
  }

  if (!session.sshState.firstOutputSeen) {
    session.sshState.firstOutputSeen = true;
    clearConnectTimers(session);
    send(session.socket, "status", {
      text: "SSH server responded. Authentication is in progress."
    });
  }

  if (
    !session.sshState.promptedPassword &&
    /(password|密码).{0,20}[:：]\s*$/im.test(text)
  ) {
    session.sshState.promptedPassword = true;
    send(session.socket, "status", {
      text: "Password prompt detected. Type the password directly in the terminal and press Enter."
    });
  }

  if (/are you sure you want to continue connecting/i.test(text)) {
    send(session.socket, "status", {
      text: "Host key confirmation detected. Type yes in the terminal to continue."
    });
  }

  if (/permission denied/i.test(text)) {
    clearConnectTimers(session);
    send(session.socket, "error", {
      text: "SSH authentication failed. Check username, password, or key."
    });
  }

  if (
    /connection refused|connection timed out|no route to host|could not resolve hostname/i.test(text)
  ) {
    clearConnectTimers(session);
    send(session.socket, "error", {
      text: `SSH connection failed: ${text.trim()}`
    });
  }

  if (!session.sshState.connected && looksLikeShellReady(text)) {
    session.sshState.connected = true;
    clearConnectTimers(session);
    send(session.socket, "ssh-connected", {
      text: "SSH session established."
    });
  }
}

function looksLikeShellReady(text) {
  return (
    /last login/i.test(text) ||
    /welcome/i.test(text) ||
    /\r?\n[^@\r\n\s]+@[^:\r\n]+:[^\r\n]*[$#] ?$/m.test(text) ||
    /[$#>] ?$/m.test(text)
  );
}

function scheduleConnectHints(session) {
  clearConnectTimers(session);

  session.connectTimers.push(
    setTimeout(() => {
      if (!session.ptyProcess || session.sshState.firstOutputSeen || session.sshState.connected) {
        return;
      }

      send(session.socket, "status", {
        text:
          session.sshState.authMode === "password"
            ? "Still waiting for SSH output. Click the terminal and press Enter once to trigger the password prompt."
            : "Still waiting for SSH output. Check the server address, port, and network reachability."
      });
    }, 2500)
  );

  session.connectTimers.push(
    setTimeout(() => {
      if (!session.ptyProcess || session.sshState.connected) {
        return;
      }

      send(session.socket, "status", {
        text: `Connection to ${session.sshState.username}@${session.sshState.host} is still pending. Watch the terminal for password or host key prompts.`
      });
    }, 6000)
  );
}

function clearConnectTimers(session) {
  for (const timer of session.connectTimers) {
    clearTimeout(timer);
  }
  session.connectTimers = [];
}

function clampDimension(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.max(10, Math.min(500, Math.floor(number)));
}

function stripAnsi(text) {
  return text.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, "");
}

function teardownSession(session, message) {
  clearConnectTimers(session);

  if (session.ptyProcess) {
    session.ptyProcess.kill();
    session.ptyProcess = null;
  }

  session.lastGeneratedCommand = "";
  session.sshState = createSshState();

  if (message && session.socket.readyState === 1) {
    send(session.socket, "status", { text: message });
  }
}

function send(socket, type, data) {
  if (socket.readyState === 1) {
    socket.send(JSON.stringify({ type, data }));
  }
}
