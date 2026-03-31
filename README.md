# AI SSH Terminal

Web-based SSH terminal with real PTY bridging and AI-assisted command planning.

## Features

- Real SSH PTY session backed by `node-pty`
- Password-interactive and private-key login flows
- Terminal key forwarding, including arrow keys and `Ctrl+C`
- AI converts natural language into shell commands
- Inline approval workflow: execute, modify, or reject per suggestion
- Persistent AI conversation stream with per-card status and execution summary
- Docker-based deployment
- Local xterm assets served from `node_modules`

## Stack

- Backend: `server.js`
- Frontend: `index.html`, `app.js`, `styles.css`
- Deployment: `Dockerfile`, `docker-compose.yml`

## Run With Docker

```bash
docker compose up -d --build
```

Default port:

```text
3000
```

Custom port example:

```bash
PORT=8080 docker compose up -d --build
```

Open:

```text
http://YOUR_SERVER_IP:3000
```

## SSH Usage

Fill in:

- Host
- Port
- Username
- Auth mode

For password mode, type the password directly inside the terminal when the remote host prompts for it.

For key mode, provide a key path that exists inside the container, for example:

```text
/root/.ssh/id_rsa
```

If you want to use host keys from the Docker host, mount them read-only:

```yaml
volumes:
  - /root/.ssh:/root/.ssh:ro
```

## AI Configuration

The UI expects a `Base URL`, not the full chat completions endpoint.

The backend automatically appends:

```text
/chat/completions
```

Example:

```text
Base URL: https://ark.cn-beijing.volces.com/api/coding/v3
Model: ark-code-latest
```

## AI Workflow

1. Enter a natural-language request.
2. Generate a command.
3. Review the AI explanation and proposed shell command.
4. Choose `Execute`, `Modify`, or `Reject`.
5. Follow-up instructions continue in the same conversation stream.

Each AI suggestion card keeps:

- Approval status
- Proposed command
- Explanation
- Execution summary linked to that card

## Local Development

```bash
npm install
npm start
```

Then open:

```text
http://127.0.0.1:3000
```

## Troubleshooting

### Page loads but terminal does not respond

Check:

- Browser console errors
- Container logs
- WebSocket connection state

### SSH connection shows no prompt

Check:

- `ssh` is installed in the container
- The target host is reachable on port `22`
- Password input is being entered into the terminal area, not a form field

### AI returns 404

Usually the `Base URL` is wrong. The app expects the base path and appends `/chat/completions` automatically.

### xterm assets fail to load

Rebuild the container and verify `node_modules/xterm` and `node_modules/xterm-addon-fit` exist in the image.

## Redeploy

```bash
docker compose down
docker compose up -d --build
```

## Current Limits

- SSH success detection still relies partly on terminal output heuristics
- AI command safety is approval-based, not sandboxed execution
- Private key paths are interpreted relative to the container filesystem
