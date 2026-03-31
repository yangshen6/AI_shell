# AI SSH Terminal

一个基于 `Node.js + WebSocket + node-pty + xterm.js` 的网页 SSH 终端。

它提供两类能力：

- 通过网页连接远程 Linux SSH，会话是真实 PTY，不是聊天模拟
- 通过 AI 把自然语言转换成 shell 命令，并在执行前由用户确认

## 功能特性

- 真实 SSH PTY 会话
- 支持密码交互和私钥登录
- 支持方向键、`Ctrl+C`、终端 resize
- AI 自然语言生成命令
- AI 命令先生成，再由用户确认是否执行
- 支持补充要求后让 AI 重新思考
- 支持 Docker 部署
- 前端终端资源本地提供，不依赖外部 CDN

## 技术结构

- 后端: `server.js`
  负责静态文件、WebSocket、SSH PTY 管理、AI 请求转发
- 前端: `index.html` + `app.js` + `styles.css`
  负责终端显示、SSH 配置、AI 工作流面板
- 容器部署: `Dockerfile` + `docker-compose.yml`

## 目录说明

- [server.js](web_trum\server.js)
- [app.js](web_trum\app.js)
- [index.html](web_trum\index.html)
- [styles.css](web_trum\styles.css)
- [Dockerfile](web_trum\Dockerfile)
- [docker-compose.yml](web_trum\docker-compose.yml)

## 环境要求

- Docker
- Docker Compose

如果不用 Docker，本地运行需要：

- Node.js 24+
- 可用的 `ssh` 客户端

## Docker 部署

### 1. 构建并启动

```bash
docker compose up -d --build
```

默认端口是 `3000`。

如果你想修改暴露端口：

```bash
PORT=8080 docker compose up -d --build
```

### 2. 查看日志

```bash
docker logs -f web-trum
```

如果启动成功，会看到类似输出：

```text
Server running at http://localhost:3000
```

### 3. 访问页面

浏览器打开：

```text
http://你的服务器IP:3000
```

如果改了端口，就替换成对应端口。

## Docker Compose 配置

当前 [docker-compose.yml](C:\Users\mm\Documents\New project\web_trum\docker-compose.yml) 默认配置如下：

```yml
services:
  web-trum:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: web-trum
    restart: unless-stopped
    ports:
      - "${PORT:-3000}:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      SSH_BINARY: /usr/bin/ssh
```

## SSH 使用方式

页面左侧填写：

- 主机
- 端口
- 用户名
- 登录方式

### 私钥登录

选择“私钥”，并填写容器内部可访问的私钥路径。

示例：

```text
/root/.ssh/id_rsa
```

如果你要在 Docker 中使用私钥，建议把宿主机 `.ssh` 目录挂载进容器。

例如：

```yml
volumes:
  - /root/.ssh:/root/.ssh:ro
```

### 密码登录

选择“密码交互”后，密码不会通过表单传输。

正确流程是：

1. 点击“连接”
2. 等终端出现密码提示
3. 直接在终端区域输入密码并回车

## AI 配置说明

页面中的 AI 配置字段含义如下：

- `Base URL`
- `模型名称`
- `API Key`
- `温度`
- `附加请求头 JSON`
- `AI 系统提示词`
- `高级参数 JSON`

### 重要说明

页面里填的是 `Base URL`，不是完整 `chat/completions` 地址。

后端会自动补全：

```text
/chat/completions
```

例如你填写：

```text
https://api.openai.com/v1
```

后端实际请求：

```text
https://api.openai.com/v1/chat/completions
```

### 火山方舟示例

如果你使用火山方舟 Coding API：

```text
Base URL:
https://ark.cn-beijing.volces.com/api/coding/v3

Model:
ark-code-latest
```

## AI 工作流

当前 AI 交互已经收敛为页面内完整工作流：

1. 在“首次提问”输入自然语言需求
2. 点击“生成命令”
3. AI 返回命令和说明
4. 选择：
   - 执行命令
   - 取消执行
   - 在“补充要求”中输入更多限制条件，再点“重新思考”

示例：

```text
首次提问:
查看 /var/log 中最大的 20 个文件

补充要求:
不要删除任何文件，只显示大小和路径
```

## 本地开发

如果你在本地直接运行：

```bash
npm install
npm start
```

访问：

```text
http://127.0.0.1:3000
```

## 常见问题

### 1. 页面能打开，但终端没有反应

优先检查：

- 浏览器控制台是否报错
- 容器日志是否正常
- WebSocket 是否连接成功

### 2. SSH 连接没有提示

先确认：

- 容器内 `ssh` 是否可用
- 目标主机 `22` 端口是否可达
- 密码登录时是否在终端区域输入了密码

### 3. AI 返回 404

通常是 `Base URL` 配置不对。

请确认填写的是基础地址，而不是错误路径。

本项目会自动补 `/chat/completions`。

### 4. 终端库加载失败

当前版本已经从本地 `node_modules` 提供 `xterm` 和 `xterm-addon-fit`，不依赖 CDN。

如果仍然失败，优先检查：

- 镜像是否重新构建
- 容器中 `node_modules` 是否存在
- 浏览器是否访问的是新容器

## 重新部署

代码更新后，建议执行：

```bash
docker compose down
docker compose up -d --build
```

## 当前限制

- SSH 连接成功识别依赖终端输出特征，不是 SSH 协议级确认
- AI 命令安全策略目前依赖提示词和用户确认，不是命令沙箱
- 私钥路径默认按容器内部路径理解

## 后续建议

- 增加命令审计日志
- 增加 SSH 主机白名单
- 增加 AI 风险等级可视化
- 增加命令历史和执行记录
