const STORAGE_KEY = "ai-ssh-terminal-config";

if (typeof Terminal === "undefined" || typeof FitAddon === "undefined") {
  const status = document.querySelector("#connectionStatus");
  const terminalHost = document.querySelector("#terminal");

  if (status) {
    status.textContent = "终端依赖未加载";
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
terminal.writeln("AI SSH Terminal ready.");
terminal.writeln("All keys are forwarded to the SSH PTY.");
terminal.writeln("Use the AI workflow panel to generate or refine shell commands.");
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
  aiDecisionHint: document.querySelector("#aiDecisionHint"),
  aiDecisionCommand: document.querySelector("#aiDecisionCommand"),
  decisionExecute: document.querySelector("#decisionExecute"),
  decisionCancel: document.querySelector("#decisionCancel"),
  aiRefineInput: document.querySelector("#aiRefineInput"),
  aiRefineButton: document.querySelector("#aiRefineButton")
};

const state = {
  socket: null,
  latestAiCommand: "",
  pendingAiDecision: false,
  lastAiInstruction: "",
  selectedDecision: "execute"
};

bindEvents();
loadConfig();
connectSocket();
renderAuthMode();
observeTerminalResize();
syncDecisionButtons();
setAiIdleState();

function bindEvents() {
  refs.connectButton.addEventListener("click", connectSsh);
  refs.disconnectButton.addEventListener("click", disconnectSsh);
  refs.runAiButton.addEventListener("click", () => refs.aiInstructionInput.focus());
  refs.runSuggestedButton.addEventListener("click", executeLatestAiCommand);
  refs.aiGenerateButton.addEventListener("click", submitInitialInstruction);
  refs.decisionExecute.addEventListener("click", () => {
    setDecisionSelection("execute");
    confirmCurrentDecision();
  });
  refs.decisionCancel.addEventListener("click", () => {
    setDecisionSelection("cancel");
    confirmCurrentDecision();
  });
  refs.aiRefineButton.addEventListener("click", submitRefinement);
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

  refs.aiRefineInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitRefinement();
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
      return;
    }

    if (!state.pendingAiDecision) {
      return;
    }

    if (document.activeElement === refs.aiInstructionInput || document.activeElement === refs.aiRefineInput) {
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      setDecisionSelection("execute");
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      setDecisionSelection("cancel");
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      confirmCurrentDecision();
    }
  });
}

function connectSocket() {
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${location.host}`);
  state.socket = socket;

  socket.addEventListener("open", () => {
    terminal.writeln("[system] WebSocket connected.");
    syncTerminalSize();
  });

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);

    if (payload.type === "terminal-output") {
      terminal.write(payload.data.text);
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
    updateConnectionStatus("WebSocket disconnected.", "error");
    terminal.writeln("\r\n[system] WebSocket disconnected.");
  });
}

function handleAiCommandResponse(data) {
  state.latestAiCommand = data.command;
  state.pendingAiDecision = true;
  state.selectedDecision = "execute";

  refs.aiPreview.textContent = `AI: ${data.command} | risk: ${data.risk}`;
  refs.aiDecisionCommand.textContent = data.command;
  refs.aiDecisionHint.textContent = data.explanation || "请选择是否执行，或补充要求后重新思考。";
  refs.aiRefineInput.value = "";
  syncDecisionButtons();
  setAiDecisionState();

  terminal.writeln(`\r\n[ai] command: ${data.command}`);
  if (data.explanation) {
    terminal.writeln(`[ai] note: ${data.explanation}`);
  }
  terminal.writeln("[ai] use the workflow panel to execute, cancel, or refine.");
}

function connectSsh() {
  updateConnectionStatus(
    refs.authMode.value === "password"
      ? "正在连接 SSH，等待密码提示..."
      : "正在连接 SSH...",
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
  updateConnectionStatus("SSH disconnected.", "muted");
  send("disconnect-ssh", {});
}

function submitInitialInstruction() {
  const instruction = refs.aiInstructionInput.value.trim();
  if (!instruction) {
    refs.aiInstructionInput.focus();
    return;
  }

  requestAiCommand(instruction);
}

function requestAiCommand(instruction) {
  state.lastAiInstruction = instruction;
  state.pendingAiDecision = false;
  refs.aiInstructionInput.value = instruction;
  setAiLoadingState();
  send("request-ai-command", {
    instruction,
    autoExecute: false,
    aiConfig: readAiConfig()
  });
}

function executeLatestAiCommand() {
  if (!state.latestAiCommand) {
    terminal.writeln("\r\n[error] No AI-generated command available.");
    return;
  }

  state.pendingAiDecision = false;
  setAiIdleState();
  send("execute-ai-command", {});
}

function confirmCurrentDecision() {
  if (!state.pendingAiDecision) {
    return;
  }

  if (state.selectedDecision === "cancel") {
    state.pendingAiDecision = false;
    setAiIdleState("已取消执行。你可以修改需求后重新生成。");
    terminal.writeln("[ai] canceled.");
    return;
  }

  executeLatestAiCommand();
}

function submitRefinement() {
  const extraInstruction = refs.aiRefineInput.value.trim();
  if (!extraInstruction) {
    refs.aiRefineInput.focus();
    return;
  }

  terminal.writeln(`[ai] refine: ${extraInstruction}`);
  requestAiCommand(composeRefinementInstruction(extraInstruction));
}

function composeRefinementInstruction(extraInstruction) {
  if (!state.lastAiInstruction) {
    return extraInstruction;
  }

  return [state.lastAiInstruction, "", `Additional requirement: ${extraInstruction}`].join("\n");
}

function setDecisionSelection(value) {
  state.selectedDecision = value;
  syncDecisionButtons();
}

function syncDecisionButtons() {
  refs.decisionExecute.classList.toggle("is-active", state.selectedDecision === "execute");
  refs.decisionCancel.classList.toggle("is-active", state.selectedDecision === "cancel");
}

function setAiIdleState(hint) {
  refs.aiWorkflowPanel.classList.remove("is-loading");
  refs.aiDecisionHint.textContent = hint || "先输入自然语言需求，AI 生成命令后再确认是否执行。";
  refs.aiDecisionCommand.textContent = state.latestAiCommand || "这里会显示 AI 生成的命令。";
}

function setAiLoadingState() {
  refs.aiWorkflowPanel.classList.add("is-loading");
  refs.aiDecisionHint.textContent = "AI 正在思考，请稍候。";
  refs.aiDecisionCommand.textContent = "Generating...";
}

function setAiDecisionState() {
  refs.aiWorkflowPanel.classList.remove("is-loading");
}

function renderAuthMode() {
  const useKey = refs.authMode.value === "key";
  refs.keyAuthFields.classList.toggle("hidden", !useKey);
  refs.authHint.innerHTML = useKey
    ? "&#25512;&#33616;&#65306;&#20351;&#29992;&#31169;&#38053;&#30331;&#24405;&#12290;"
    : "&#23494;&#30721;&#19981;&#20877;&#36890;&#36807;&#34920;&#21333;&#20256;&#36755;&#65292;&#35831;&#22312;&#32456;&#31471;&#37324;&#30452;&#25509;&#36755;&#20837;&#23494;&#30721;&#12290;";
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
      terminal.writeln("\r\n[error] WebSocket is not connected.");
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
