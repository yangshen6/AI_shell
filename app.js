const STORAGE_KEY = "ai-ssh-terminal-config";

const TEXT = {
  xtermMissing: "\u7ec8\u7aef\u4f9d\u8d56\u672a\u52a0\u8f7d",
  terminalReady: "AI SSH Terminal ready.",
  terminalForwarding: "All keys are forwarded to the SSH PTY.",
  terminalHint: "Use the AI conversation stream to generate and approve shell commands.",
  hintDefault: "\u63d0\u95ee\u3001AI \u89e3\u91ca\u3001\u547d\u4ee4\u5ba1\u6279\u548c\u8865\u5145\u8981\u6c42\u4f1a\u6301\u7eed\u8ffd\u52a0\u5230\u8fd9\u91cc\u3002",
  hintLoading: "AI \u6b63\u5728\u601d\u8003\uff0c\u8bf7\u7a0d\u5019\u3002",
  hintReady: "AI \u5df2\u7ed9\u51fa\u547d\u4ee4\u65b9\u6848\u3002\u4f60\u53ef\u4ee5\u76f4\u63a5\u6267\u884c\u3001\u4fee\u6539\u540e\u91cd\u8bd5\uff0c\u6216\u8005\u62d2\u7edd\u3002",
  hintModify: "\u5df2\u8fdb\u5165\u4fee\u6539\u6a21\u5f0f\u3002\u8f93\u5165\u8865\u5145\u8981\u6c42\u540e\u70b9\u51fb\u201c\u57fa\u4e8e\u5f53\u524d\u8f93\u5165\u91cd\u65b0\u601d\u8003\u201d\u3002",
  hintRejected: "\u672c\u6b21\u547d\u4ee4\u5df2\u62d2\u7edd\u3002\u4f60\u53ef\u4ee5\u7ee7\u7eed\u8f93\u5165\u65b0\u7684\u81ea\u7136\u8bed\u8a00\u9700\u6c42\u3002",
  webSocketConnected: "WebSocket connected.",
  webSocketDisconnected: "WebSocket disconnected.",
  noAiCommand: "No AI-generated command available.",
  connectPendingPassword: "\u6b63\u5728\u8fde\u63a5 SSH\uff0c\u7b49\u5f85\u5bc6\u7801\u63d0\u793a...",
  connectPending: "\u6b63\u5728\u8fde\u63a5 SSH...",
  sshDisconnected: "SSH disconnected.",
  authHintKey: "\u63a8\u8350\uff1a\u4f7f\u7528\u79c1\u94a5\u767b\u5f55\u3002",
  authHintPassword: "\u5bc6\u7801\u4e0d\u4f1a\u901a\u8fc7\u8868\u5355\u4f20\u8f93\uff0c\u8bf7\u5728\u7ec8\u7aef\u91cc\u76f4\u63a5\u8f93\u5165\u5bc6\u7801\u3002",
  userRequest: "\u81ea\u7136\u8bed\u8a00\u9700\u6c42",
  userRefine: "\u8865\u5145\u8981\u6c42",
  systemError: "\u9519\u8bef",
  systemApproved: "\u5df2\u540c\u610f",
  systemRejected: "\u5df2\u62d2\u7edd",
  rejectedText: "\u672c\u6b21 AI \u547d\u4ee4\u672a\u6267\u884c\u3002",
  aiSuggestion: "AI \u547d\u4ee4\u5efa\u8bae",
  riskLabel: "\u98ce\u9669\u7b49\u7ea7",
  statusPending: "\u5f85\u786e\u8ba4",
  statusRunning: "\u6267\u884c\u4e2d",
  statusExecuted: "\u5df2\u6267\u884c",
  statusRejected: "\u5df2\u62d2\u7edd",
  statusModified: "\u5df2\u4fee\u6539",
  executionSummary: "\u6267\u884c\u6458\u8981",
  executionSent: "\u547d\u4ee4\u5df2\u53d1\u9001\u5230 SSH \u7ec8\u7aef\uff0c\u6b63\u5728\u7b49\u5f85\u8fd4\u56de\u3002",
  executionNoOutput: "\u6682\u672a\u6355\u83b7\u5230\u8be5\u6b21\u6267\u884c\u7684\u8f93\u51fa\u3002",
  executionRejected: "\u4f60\u62d2\u7edd\u4e86\u8fd9\u6b21\u547d\u4ee4\u6267\u884c\u3002",
  executionModified: "\u5df2\u8fdb\u5165\u4fee\u6539\u6d41\u7a0b\uff0c\u7b49\u5f85\u65b0\u7684\u8865\u5145\u8981\u6c42\u3002",
  execute: "\u6267\u884c",
  modify: "\u4fee\u6539",
  reject: "\u62d2\u7edd",
  generating: "Generating..."
};

if (typeof Terminal === "undefined" || typeof FitAddon === "undefined") {
  const status = document.querySelector("#connectionStatus");
  const terminalHost = document.querySelector("#terminal");

  if (status) {
    status.textContent = TEXT.xtermMissing;
    status.classList.remove("muted", "success", "pending");
    status.classList.add("error");
  }

  if (terminalHost) {
    terminalHost.innerHTML =
      '<div style="padding:16px;color:#ff7b72;font-family:\'IBM Plex Mono\',monospace;">xterm.js failed to load. The container must serve local xterm assets instead of relying on external CDN files.</div>';
  }

  throw new Error("xterm assets failed to load");
}

const terminalElement = document.querySelector("#terminal");
const fitAddon = new FitAddon.FitAddon();
const terminal = new Terminal({
  cursorBlink: true,
  convertEol: false,
  allowTransparency: true,
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: 14,
  scrollback: 5000,
  theme: {
    background: "#08111f",
    foreground: "#e8f0ff",
    cursor: "#76e4c3",
    selectionBackground: "rgba(118,228,195,0.25)"
  }
});

terminal.loadAddon(fitAddon);
terminal.open(terminalElement);
fitAddon.fit();
terminal.focus();
terminal.writeln(TEXT.terminalReady);
terminal.writeln(TEXT.terminalForwarding);
terminal.writeln(TEXT.terminalHint);
terminal.writeln("");

const refs = {
  sshHost: document.querySelector("#sshHost"),
  sshPort: document.querySelector("#sshPort"),
  sshUser: document.querySelector("#sshUser"),
  authMode: document.querySelector("#authMode"),
  privateKeyPath: document.querySelector("#privateKeyPath"),
  authHint: document.querySelector("#authHint"),
  baseUrl: document.querySelector("#baseUrl"),
  model: document.querySelector("#model"),
  apiKey: document.querySelector("#apiKey"),
  temperature: document.querySelector("#temperature"),
  headers: document.querySelector("#headers"),
  systemPrompt: document.querySelector("#systemPrompt"),
  requestTemplate: document.querySelector("#requestTemplate"),
  connectButton: document.querySelector("#connectButton"),
  disconnectButton: document.querySelector("#disconnectButton"),
  runAiButton: document.querySelector("#runAiButton"),
  runSuggestedButton: document.querySelector("#runSuggestedButton"),
  connectionStatus: document.querySelector("#connectionStatus"),
  aiPreview: document.querySelector("#aiPreview"),
  keyAuthFields: document.querySelector("#keyAuthFields"),
  aiWorkflowPanel: document.querySelector("#aiWorkflowPanel"),
  aiInstructionInput: document.querySelector("#aiInstructionInput"),
  aiGenerateButton: document.querySelector("#aiGenerateButton"),
  aiRefineButton: document.querySelector("#aiRefineButton"),
  aiDecisionHint: document.querySelector("#aiDecisionHint"),
  aiConversation: document.querySelector("#aiConversation")
};

const state = {
  socket: null,
  latestAiCommand: "",
  lastAiInstruction: "",
  messageSeq: 0,
  cardSeq: 0,
  cardMap: new Map(),
  activeExecution: null
};

bindEvents();
loadConfig();
connectSocket();
renderAuthMode();
observeTerminalResize();
setAiHint(TEXT.hintDefault);

function bindEvents() {
  refs.connectButton.addEventListener("click", connectSsh);
  refs.disconnectButton.addEventListener("click", disconnectSsh);
  refs.runAiButton.addEventListener("click", () => refs.aiInstructionInput.focus());
  refs.runSuggestedButton.addEventListener("click", executeLatestAiCommand);
  refs.aiGenerateButton.addEventListener("click", submitInitialInstruction);
  refs.aiRefineButton.addEventListener("click", submitRefinementFromInput);
  refs.authMode.addEventListener("change", () => {
    renderAuthMode();
    saveConfig();
  });

  for (const key of [
    "sshHost",
    "sshPort",
    "sshUser",
    "privateKeyPath",
    "baseUrl",
    "model",
    "apiKey",
    "temperature",
    "headers",
    "systemPrompt",
    "requestTemplate"
  ]) {
    refs[key].addEventListener("change", saveConfig);
    refs[key].addEventListener("input", saveConfig);
  }

  refs.aiInstructionInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitInitialInstruction();
    }
  });

  terminal.onData((data) => {
    send("terminal-input", { text: data });
  });

  terminalElement.addEventListener("click", () => {
    terminal.focus();
  });

  window.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      refs.aiInstructionInput.focus();
    }
  });
}

function connectSocket() {
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${location.host}`);
  state.socket = socket;

  socket.addEventListener("open", () => {
    terminal.writeln(`[system] ${TEXT.webSocketConnected}`);
    syncTerminalSize();
  });

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);

    if (payload.type === "terminal-output") {
      terminal.write(payload.data.text);
      captureExecutionOutput(payload.data.text);
      return;
    }

    if (payload.type === "status") {
      updateConnectionStatus(payload.data.text, "muted");
      terminal.writeln(`\r\n[status] ${payload.data.text}`);
      return;
    }

    if (payload.type === "error") {
      updateConnectionStatus(payload.data.text, "error");
      terminal.writeln(`\r\n[error] ${payload.data.text}`);
      appendSystemCard(TEXT.systemError, payload.data.text, "error");
      return;
    }

    if (payload.type === "ssh-connected") {
      updateConnectionStatus(payload.data.text, "success");
      terminal.writeln(`\r\n[status] ${payload.data.text}`);
      return;
    }

    if (payload.type === "ai-command") {
      handleAiCommandResponse(payload.data);
    }
  });

  socket.addEventListener("close", () => {
    updateConnectionStatus(TEXT.webSocketDisconnected, "error");
    terminal.writeln(`\r\n[system] ${TEXT.webSocketDisconnected}`);
  });
}

function handleAiCommandResponse(data) {
  state.latestAiCommand = data.command;
  refs.aiPreview.textContent = `AI: ${data.command} | risk: ${data.risk}`;
  setAiHint(TEXT.hintReady);
  appendAiApprovalCard(data);

  terminal.writeln(`\r\n[ai] command: ${data.command}`);
  if (data.explanation) {
    terminal.writeln(`[ai] note: ${data.explanation}`);
  }
}

function connectSsh() {
  updateConnectionStatus(
    refs.authMode.value === "password" ? TEXT.connectPendingPassword : TEXT.connectPending,
    "pending"
  );
  send("connect-ssh", {
    host: refs.sshHost.value.trim(),
    port: refs.sshPort.value.trim(),
    username: refs.sshUser.value.trim(),
    authMode: refs.authMode.value,
    privateKeyPath: refs.privateKeyPath.value.trim(),
    cols: terminal.cols,
    rows: terminal.rows,
    aiConfig: readAiConfig()
  });
  terminal.focus();
}

function disconnectSsh() {
  updateConnectionStatus(TEXT.sshDisconnected, "muted");
  send("disconnect-ssh", {});
}

function submitInitialInstruction() {
  const instruction = refs.aiInstructionInput.value.trim();
  if (!instruction) {
    refs.aiInstructionInput.focus();
    return;
  }

  requestAiCommand(instruction, "user");
}

function submitRefinementFromInput() {
  const extraInstruction = refs.aiInstructionInput.value.trim();
  if (!extraInstruction) {
    refs.aiInstructionInput.focus();
    return;
  }

  requestAiCommand(composeRefinementInstruction(extraInstruction), "refine", extraInstruction);
}

function requestAiCommand(instruction, mode, displayText) {
  state.lastAiInstruction = instruction;
  appendUserCard(displayText || instruction, mode);
  refs.aiInstructionInput.value = "";
  setAiHint(TEXT.hintLoading);
  send("request-ai-command", {
    instruction,
    autoExecute: false,
    aiConfig: readAiConfig()
  });
}

function executeLatestAiCommand() {
  if (!state.latestAiCommand) {
    terminal.writeln(`\r\n[error] ${TEXT.noAiCommand}`);
    return;
  }

  send("execute-ai-command", {});
}

function composeRefinementInstruction(extraInstruction) {
  if (!state.lastAiInstruction) {
    return extraInstruction;
  }

  return [state.lastAiInstruction, "", `Additional requirement: ${extraInstruction}`].join("\n");
}

function appendUserCard(text, mode) {
  const title = mode === "refine" ? TEXT.userRefine : TEXT.userRequest;
  const card = createConversationCard("user", title);
  card.querySelector(".conversation-body").textContent = text;
  refs.aiConversation.appendChild(card);
  scrollConversationToBottom();
}

function appendSystemCard(title, text, tone) {
  const card = createConversationCard(`system ${tone || ""}`.trim(), title);
  card.querySelector(".conversation-body").textContent = text;
  refs.aiConversation.appendChild(card);
  scrollConversationToBottom();
}

function appendAiApprovalCard(data) {
  const cardId = `ai-card-${++state.cardSeq}`;
  const card = createConversationCard("assistant", TEXT.aiSuggestion);
  card.dataset.cardId = cardId;
  const body = card.querySelector(".conversation-body");
  body.innerHTML = "";

  const headerRow = document.createElement("div");
  headerRow.className = "conversation-header-row";

  const statusBadge = document.createElement("span");
  statusBadge.className = "conversation-status status-pending";
  statusBadge.textContent = TEXT.statusPending;
  headerRow.appendChild(statusBadge);

  body.appendChild(headerRow);

  if (data.explanation) {
    const desc = document.createElement("p");
    desc.className = "conversation-text";
    desc.textContent = data.explanation;
    body.appendChild(desc);
  }

  const risk = document.createElement("p");
  risk.className = "conversation-risk";
  risk.textContent = `${TEXT.riskLabel}: ${data.risk || "unknown"}`;
  body.appendChild(risk);

  const pre = document.createElement("pre");
  pre.className = "conversation-command";
  pre.textContent = data.command;
  body.appendChild(pre);

  const summary = document.createElement("section");
  summary.className = "conversation-summary hidden";

  const summaryLabel = document.createElement("div");
  summaryLabel.className = "conversation-summary-label";
  summaryLabel.textContent = TEXT.executionSummary;

  const summaryOutput = document.createElement("pre");
  summaryOutput.className = "conversation-summary-output";

  summary.appendChild(summaryLabel);
  summary.appendChild(summaryOutput);
  body.appendChild(summary);

  const actions = document.createElement("div");
  actions.className = "conversation-actions";

  const executeButton = document.createElement("button");
  executeButton.type = "button";
  executeButton.className = "primary";
  executeButton.textContent = TEXT.execute;
  executeButton.addEventListener("click", () => {
    state.latestAiCommand = data.command;
    beginExecutionCapture(cardId, data.command);
    setCardStatus(cardId, "running");
    executeLatestAiCommand();
    appendSystemCard(TEXT.systemApproved, data.command, "success");
  });

  const modifyButton = document.createElement("button");
  modifyButton.type = "button";
  modifyButton.className = "secondary";
  modifyButton.textContent = TEXT.modify;
  modifyButton.addEventListener("click", () => {
    finalizeExecutionCapture(cardId, TEXT.executionModified);
    setCardStatus(cardId, "modified");
    refs.aiInstructionInput.value = "";
    refs.aiInstructionInput.placeholder =
      "\u7ee7\u7eed\u8865\u5145\u8981\u6c42\uff0c\u4f8b\u5982\uff1a\u53ea\u67e5\u770b\uff0c\u4e0d\u5220\u9664";
    refs.aiInstructionInput.focus();
    setAiHint(TEXT.hintModify);
  });

  const rejectButton = document.createElement("button");
  rejectButton.type = "button";
  rejectButton.className = "ghost";
  rejectButton.textContent = TEXT.reject;
  rejectButton.addEventListener("click", () => {
    finalizeExecutionCapture(cardId, TEXT.executionRejected);
    setCardStatus(cardId, "rejected");
    appendSystemCard(TEXT.systemRejected, TEXT.rejectedText, "muted");
    setAiHint(TEXT.hintRejected);
  });

  actions.appendChild(executeButton);
  actions.appendChild(modifyButton);
  actions.appendChild(rejectButton);
  body.appendChild(actions);

  refs.aiConversation.appendChild(card);
  state.cardMap.set(cardId, {
    card,
    statusBadge,
    summary,
    summaryOutput,
    command: data.command
  });
  scrollConversationToBottom();
}

function createConversationCard(type, title) {
  const card = document.createElement("article");
  card.className = `conversation-card ${type}`;
  card.dataset.seq = String(++state.messageSeq);

  const heading = document.createElement("div");
  heading.className = "conversation-title";
  heading.textContent = title;

  const body = document.createElement("div");
  body.className = "conversation-body";

  card.appendChild(heading);
  card.appendChild(body);
  return card;
}

function setAiHint(text) {
  refs.aiDecisionHint.textContent = text;
}

function setCardStatus(cardId, status) {
  const entry = state.cardMap.get(cardId);
  if (!entry) {
    return;
  }

  const badge = entry.statusBadge;
  badge.className = "conversation-status";

  if (status === "running") {
    badge.classList.add("status-running");
    badge.textContent = TEXT.statusRunning;
    return;
  }

  if (status === "executed") {
    badge.classList.add("status-executed");
    badge.textContent = TEXT.statusExecuted;
    return;
  }

  if (status === "rejected") {
    badge.classList.add("status-rejected");
    badge.textContent = TEXT.statusRejected;
    return;
  }

  if (status === "modified") {
    badge.classList.add("status-modified");
    badge.textContent = TEXT.statusModified;
    return;
  }

  badge.classList.add("status-pending");
  badge.textContent = TEXT.statusPending;
}

function beginExecutionCapture(cardId, command) {
  if (state.activeExecution) {
    finalizeExecutionCapture(state.activeExecution.cardId);
  }

  const entry = state.cardMap.get(cardId);
  if (!entry) {
    return;
  }

  entry.summary.classList.remove("hidden");
  entry.summaryOutput.textContent = `${TEXT.executionSent}\n\n$ ${command}`;

  state.activeExecution = {
    cardId,
    command,
    chunks: [],
    timer: null
  };
}

function captureExecutionOutput(chunk) {
  const active = state.activeExecution;
  if (!active || !chunk) {
    return;
  }

  const entry = state.cardMap.get(active.cardId);
  if (!entry) {
    return;
  }

  active.chunks.push(chunk);
  if (active.chunks.length > 24) {
    active.chunks = active.chunks.slice(-24);
  }

  const cleanedOutput = formatExecutionOutput(active.chunks.join(""));
  entry.summary.classList.remove("hidden");
  entry.summaryOutput.textContent = `$ ${active.command}\n${cleanedOutput || TEXT.executionNoOutput}`;
  scrollConversationToBottom();

  if (active.timer) {
    clearTimeout(active.timer);
  }

  active.timer = window.setTimeout(() => {
    finalizeExecutionCapture(active.cardId);
  }, 1200);
}

function finalizeExecutionCapture(cardId, fallbackText) {
  const active = state.activeExecution;
  if (!active || active.cardId !== cardId) {
    if (fallbackText) {
      const entry = state.cardMap.get(cardId);
      if (entry) {
        entry.summary.classList.remove("hidden");
        entry.summaryOutput.textContent = fallbackText;
      }
    }
    return;
  }

  if (active.timer) {
    clearTimeout(active.timer);
  }

  const entry = state.cardMap.get(cardId);
  if (entry) {
    const cleanedOutput = formatExecutionOutput(active.chunks.join(""));
    entry.summary.classList.remove("hidden");
    entry.summaryOutput.textContent = cleanedOutput
      ? `$ ${active.command}\n${cleanedOutput}`
      : fallbackText || `${TEXT.executionSent}\n\n$ ${active.command}\n${TEXT.executionNoOutput}`;
  }

  setCardStatus(cardId, "executed");
  state.activeExecution = null;
  scrollConversationToBottom();
}

function formatExecutionOutput(text) {
  return String(text || "")
    .replace(/\u001b\][^\u0007]*\u0007/g, "")
    .replace(/\u001b\[[0-9;?]*[A-Za-z]/g, "")
    .replace(/\r/g, "")
    .trim()
    .split("\n")
    .slice(-14)
    .join("\n")
    .slice(-1600);
}

function scrollConversationToBottom() {
  refs.aiConversation.scrollTop = refs.aiConversation.scrollHeight;
}

function renderAuthMode() {
  const useKey = refs.authMode.value === "key";
  refs.keyAuthFields.classList.toggle("hidden", !useKey);
  refs.authHint.textContent = useKey ? TEXT.authHintKey : TEXT.authHintPassword;
}

function updateConnectionStatus(text, tone) {
  refs.connectionStatus.textContent = text;
  refs.connectionStatus.classList.remove("muted", "error", "success", "pending");
  refs.connectionStatus.classList.add(tone);
}

function observeTerminalResize() {
  const resize = () => {
    fitAddon.fit();
    syncTerminalSize();
  };

  const observer = new ResizeObserver(resize);
  observer.observe(terminalElement);
  window.addEventListener("resize", resize);
}

function syncTerminalSize() {
  send("terminal-resize", { cols: terminal.cols, rows: terminal.rows });
}

function send(type, data) {
  if (!state.socket || state.socket.readyState !== WebSocket.OPEN) {
    if (type !== "terminal-resize") {
      terminal.writeln(`\r\n[error] ${TEXT.webSocketDisconnected}`);
    }
    return;
  }

  state.socket.send(JSON.stringify({ type, data }));
}

function readAiConfig() {
  return {
    baseUrl: refs.baseUrl.value.trim(),
    model: refs.model.value.trim(),
    apiKey: refs.apiKey.value.trim(),
    temperature: refs.temperature.value.trim(),
    headers: refs.headers.value.trim() || "{}",
    systemPrompt: refs.systemPrompt.value.trim(),
    requestTemplate: refs.requestTemplate.value.trim() || "{}"
  };
}

function saveConfig() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      sshHost: refs.sshHost.value,
      sshPort: refs.sshPort.value,
      sshUser: refs.sshUser.value,
      authMode: refs.authMode.value,
      privateKeyPath: refs.privateKeyPath.value,
      baseUrl: refs.baseUrl.value,
      model: refs.model.value,
      apiKey: refs.apiKey.value,
      temperature: refs.temperature.value,
      headers: refs.headers.value,
      systemPrompt: refs.systemPrompt.value,
      requestTemplate: refs.requestTemplate.value
    })
  );
}

function loadConfig() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  const saved = JSON.parse(raw);
  if (saved.endpoint && !saved.baseUrl) {
    saved.baseUrl = normalizeBaseUrl(saved.endpoint);
  }

  for (const [key, value] of Object.entries(saved)) {
    if (refs[key]) {
      refs[key].value = value;
    }
  }
}

function normalizeBaseUrl(value) {
  return String(value || "").replace(/\/chat\/completions\/?$/i, "").trim();
}
