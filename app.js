const STORAGE_KEY = "ai-ssh-terminal-config";
const SIDEBAR_KEY = "ai-ssh-terminal-sidebar-collapsed";

const TEXT = {
  xtermMissing: "\u7ec8\u7aef\u4f9d\u8d56\u672a\u52a0\u8f7d",
  terminalReady: "AI SSH Terminal ready.",
  terminalForwarding: "All keys are forwarded to the SSH PTY.",
  terminalHint: "Use the unified command bar for shell commands or natural-language requests.",
  hintDefault: "\u76f4\u63a5\u5728\u547d\u4ee4\u680f\u8f93\u5165 shell \u547d\u4ee4\u6216\u81ea\u7136\u8bed\u8a00\uff0cAI \u4f1a\u628a\u5206\u6790\u4e0e\u5ba1\u6279\u7ed3\u679c\u8ffd\u52a0\u5230\u4e3b\u4f1a\u8bdd\u533a\u57df\u3002",
  hintLoading: "AI \u6b63\u5728\u601d\u8003\uff0c\u8bf7\u7a0d\u5019\u3002",
  hintReady: "AI \u5df2\u7ed9\u51fa\u547d\u4ee4\u65b9\u6848\u3002\u4f60\u53ef\u4ee5\u76f4\u63a5\u6267\u884c\u3001\u4fee\u6539\u540e\u91cd\u8bd5\uff0c\u6216\u8005\u62d2\u7edd\u3002",
  hintModify: "\u5df2\u8fdb\u5165\u4fee\u6539\u6a21\u5f0f\u3002\u8f93\u5165\u8865\u5145\u8981\u6c42\u540e\u70b9\u51fb\u201c\u57fa\u4e8e\u5f53\u524d\u8f93\u5165\u91cd\u65b0\u601d\u8003\u201d\u3002",
  hintRejected: "\u672c\u6b21\u547d\u4ee4\u5df2\u62d2\u7edd\u3002\u4f60\u53ef\u4ee5\u7ee7\u7eed\u8f93\u5165\u65b0\u7684\u81ea\u7136\u8bed\u8a00\u9700\u6c42\u3002",
  hintShell: "\u5df2\u6309\u666e\u901a shell \u547d\u4ee4\u53d1\u9001\u5230 SSH \u4f1a\u8bdd\u3002",
  inlineAiHeader: "\u667a\u80fd\u52a9\u624b",
  inlineCommandLabel: "\u5efa\u8bae\u547d\u4ee4",
  inlineApproveHint: "\u6309 Ctrl+Y \u6267\u884c\uff0cCtrl+E \u4fee\u6539\uff0cCtrl+X \u62d2\u7edd\u3002",
  inlineRejected: "\u5df2\u62d2\u7edd\u672c\u6b21 AI \u547d\u4ee4\u3002",
  inlineModify: "\u5df2\u8fdb\u5165\u4fee\u6539\u6a21\u5f0f\uff0c\u8bf7\u5728\u4e0b\u65b9\u547d\u4ee4\u680f\u8f93\u5165\u8865\u5145\u8981\u6c42\u3002",
  inlineExecuting: "\u6b63\u5728\u6267\u884c AI \u547d\u4ee4...",
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
  commandPlaceholder: "\u76f4\u63a5\u8f93\u5165 shell \u547d\u4ee4\u6216\u81ea\u7136\u8bed\u8a00\uff0c\u4f8b\u5982\uff1a\u67e5\u770b\u5185\u5b58\u4f7f\u7528\u7387",
  refinePlaceholder: "\u7ee7\u7eed\u8865\u5145\u8981\u6c42\uff0c\u4f8b\u5982\uff1a\u53ea\u67e5\u770b\uff0c\u4e0d\u5220\u9664",
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
  toggleSidebarButton: document.querySelector("#toggleSidebarButton"),
  runSuggestedButton: document.querySelector("#runSuggestedButton"),
  connectionStatus: document.querySelector("#connectionStatus"),
  aiPreview: document.querySelector("#aiPreview"),
  keyAuthFields: document.querySelector("#keyAuthFields"),
  assistantStreamShell: document.querySelector("#assistantStreamShell"),
  aiDecisionHint: document.querySelector("#aiDecisionHint"),
  aiConversation: document.querySelector("#aiConversation"),
  commandInput: document.querySelector("#commandInput"),
  commandSubmitButton: document.querySelector("#commandSubmitButton")
};

const state = {
  socket: null,
  latestAiCommand: "",
  lastAiInstruction: "",
  messageSeq: 0,
  cardSeq: 0,
  cardMap: new Map(),
  activeExecution: null,
  inputMode: "smart",
  pendingInlineDecision: false
};

bindEvents();
loadConfig();
restoreSidebarState();
connectSocket();
renderAuthMode();
observeTerminalResize();
setAiHint(TEXT.hintDefault);
autoResizeCommandInput();

function bindEvents() {
  refs.connectButton.addEventListener("click", connectSsh);
  refs.disconnectButton.addEventListener("click", disconnectSsh);
  refs.runAiButton.addEventListener("click", () => refs.commandInput.focus());
  refs.toggleSidebarButton.addEventListener("click", toggleSidebar);
  refs.runSuggestedButton.addEventListener("click", executeLatestAiCommand);
  refs.commandSubmitButton.addEventListener("click", submitCommandBar);
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

  refs.commandInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitCommandBar();
    }
  });
  refs.commandInput.addEventListener("input", autoResizeCommandInput);

  terminal.onData((data) => {
    send("terminal-input", { text: data });
  });

  terminalElement.addEventListener("click", () => {
    terminal.focus();
  });

  window.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      refs.commandInput.focus();
      return;
    }

    if (!state.pendingInlineDecision || !event.ctrlKey) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key === "y") {
      event.preventDefault();
      approveInlineCommand();
      return;
    }

    if (key === "e") {
      event.preventDefault();
      modifyInlineCommand();
      return;
    }

    if (key === "x") {
      event.preventDefault();
      rejectInlineCommand();
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
  state.pendingInlineDecision = true;
  refs.aiPreview.textContent = `AI: ${data.command} | risk: ${data.risk}`;
  setAiHint(TEXT.hintReady);
  printInlineAiDecision(data);
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

function submitCommandBar() {
  const text = refs.commandInput.value.trim();
  if (!text) {
    refs.commandInput.focus();
    return;
  }

  if (state.inputMode === "refine") {
    submitRefinementFromInput(text);
    return;
  }

  if (looksLikeNaturalLanguage(text)) {
    submitInitialInstruction(text);
    return;
  }

  submitShellCommand(text);
}

function submitInitialInstruction(instruction) {
  if (!instruction) {
    refs.commandInput.focus();
    return;
  }

  terminal.writeln(`\r\n${instruction}`);
  requestAiCommand(instruction, "user");
}

function submitRefinementFromInput(extraInstruction) {
  if (!extraInstruction) {
    refs.commandInput.focus();
    return;
  }

  terminal.writeln(`\r\n${extraInstruction}`);
  requestAiCommand(composeRefinementInstruction(extraInstruction), "refine", extraInstruction);
}

function submitShellCommand(command) {
  refs.commandInput.value = "";
  autoResizeCommandInput();
  state.inputMode = "smart";
  refs.commandInput.placeholder = TEXT.commandPlaceholder;
  setAiHint(TEXT.hintShell);
  send("terminal-input", { text: `${command}\r` });
}

function requestAiCommand(instruction, mode, displayText) {
  state.lastAiInstruction = instruction;
  refs.commandInput.value = "";
  autoResizeCommandInput();
  state.inputMode = "smart";
  refs.commandInput.placeholder = TEXT.commandPlaceholder;
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

  state.pendingInlineDecision = false;
  send("execute-ai-command", {});
}

function composeRefinementInstruction(extraInstruction) {
  if (!state.lastAiInstruction) {
    return extraInstruction;
  }

  return [state.lastAiInstruction, "", `Additional requirement: ${extraInstruction}`].join("\n");
}

function appendUserCard(text, mode) {
  return;
}

function appendSystemCard(title, text, tone) {
  terminal.writeln(`\r\n[${title}] ${text}`);
  return;
}

function appendAiApprovalCard(data) {
  return;
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

function showAssistantStream() {
  return;
}

function looksLikeNaturalLanguage(text) {
  const value = String(text || "").trim();
  if (!value) {
    return false;
  }

  if (/[\u4e00-\u9fff]/.test(value)) {
    return true;
  }

  if (/^(\/|\.\/|~\/|[A-Za-z0-9_.-]+=|sudo\s+|ssh\s+|cd\s+|ls\b|pwd\b|cat\b|grep\b|find\b|ps\b|top\b|free\b|df\b|du\b|docker\b|podman\b|kubectl\b|systemctl\b|journalctl\b|tail\b|head\b|chmod\b|chown\b|mkdir\b|rm\b|cp\b|mv\b|tar\b|curl\b|wget\b|git\b|npm\b|pnpm\b|yarn\b|python\b|node\b)/.test(value)) {
    return false;
  }

  if (/[|&;<>(){}\[\]$`]/.test(value)) {
    return false;
  }

  return /\s/.test(value) || value.split(/\s+/).length > 1;
}

function autoResizeCommandInput() {
  refs.commandInput.style.height = "auto";
  refs.commandInput.style.height = `${Math.min(refs.commandInput.scrollHeight, 160)}px`;
}

function printInlineAiDecision(data) {
  terminal.writeln("");
  terminal.writeln(`[${TEXT.inlineAiHeader}] ${data.explanation || ""}`);
  terminal.writeln(`[${TEXT.riskLabel}] ${data.risk || "unknown"}`);
  terminal.writeln(`[${TEXT.inlineCommandLabel}] ${data.command}`);
  terminal.writeln(`[hint] ${TEXT.inlineApproveHint}`);
  terminal.writeln("");
}

function approveInlineCommand() {
  if (!state.pendingInlineDecision) {
    return;
  }

  terminal.writeln(`\r\n[status] ${TEXT.inlineExecuting}`);
  executeLatestAiCommand();
}

function modifyInlineCommand() {
  if (!state.pendingInlineDecision) {
    return;
  }

  state.pendingInlineDecision = false;
  state.inputMode = "refine";
  refs.commandInput.value = "";
  refs.commandInput.placeholder = TEXT.refinePlaceholder;
  autoResizeCommandInput();
  refs.commandInput.focus();
  setAiHint(TEXT.hintModify);
  terminal.writeln(`\r\n[status] ${TEXT.inlineModify}`);
}

function rejectInlineCommand() {
  if (!state.pendingInlineDecision) {
    return;
  }

  state.pendingInlineDecision = false;
  setAiHint(TEXT.hintRejected);
  terminal.writeln(`\r\n[status] ${TEXT.inlineRejected}`);
}

function restoreSidebarState() {
  const collapsed = localStorage.getItem(SIDEBAR_KEY) !== "expanded";
  document.body.classList.toggle("sidebar-collapsed", collapsed);
}

function toggleSidebar() {
  const collapsed = !document.body.classList.contains("sidebar-collapsed");
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  localStorage.setItem(SIDEBAR_KEY, collapsed ? "collapsed" : "expanded");
  window.setTimeout(() => {
    fitAddon.fit();
    syncTerminalSize();
  }, 220);
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
