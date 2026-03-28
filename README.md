<h1 align="center">chrome-devtools-axi</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/chrome-devtools-axi"><img alt="npm" src="https://img.shields.io/npm/v/chrome-devtools-axi?style=flat-square" /></a>
  <a href="https://github.com/kunchenguid/chrome-devtools-axi/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/kunchenguid/chrome-devtools-axi/ci.yml?style=flat-square&label=CI" /></a>
  <a href="https://github.com/kunchenguid/chrome-devtools-axi/actions/workflows/release-please.yml"><img alt="Release" src="https://img.shields.io/github/actions/workflow/status/kunchenguid/chrome-devtools-axi/release-please.yml?style=flat-square&label=Release" /></a>
  <a href="#"><img alt="Platform" src="https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue?style=flat-square" /></a>
  <a href="https://x.com/kunchenguid"><img alt="X" src="https://img.shields.io/badge/X-@kunchenguid-black?style=flat-square" /></a>
  <a href="https://discord.gg/BW4aJuQhTf"><img alt="Discord" src="https://img.shields.io/discord/1439901831038763092?style=flat-square&label=discord" /></a>
</p>

<h3 align="center">Highly agent-ergonomic browser automation</h3>

`chrome-devtools-axi` wraps [chrome-devtools-mcp](https://www.npmjs.com/package/chrome-devtools-mcp) with an [AXI](https://axi.md)-compliant CLI. Every command returns a compact accessibility snapshot with just enough context and a hint about what to do next.

- **Token-efficient** — TOON-encoded output cuts token usage ~40% vs raw JSON
- **Combined operations** — one command navigates, captures, and suggests next steps
- **Contextual suggestions** — every response includes actionable next-step hints

## Quick Start

```sh
$ chrome-devtools-axi open https://example.com
page: {title: "Example Domain", url: "https://example.com", refs: 1}
snapshot:
RootWebArea "Example Domain"
  heading "Example Domain"
  paragraph "This domain is for use in illustrative examples..."
  uid=1 link "More information..."
help[1]:
  Run `chrome-devtools-axi click @1` to click the "More information..." link

$ chrome-devtools-axi click @1
page: {title: "IANA — IANA-Managed Reserved Domains", refs: 12}
snapshot:
...
```

## Install

**npm**

```sh
npm install -g chrome-devtools-axi
```

**From source**

```sh
git clone https://github.com/kunchenguid/chrome-devtools-axi.git
cd chrome-devtools-axi
npm install && npm run build
npm link
```

## How It Works

```
┌───────────────────────┐
│  chrome-devtools-axi  │  CLI — parse args, format output
└──────────┬────────────┘
           │ HTTP (localhost:9224)
           ▼
┌───────────────────────┐
│     Bridge Server     │  Persistent process, manages MCP session
└──────────┬────────────┘
           │ stdio
           ▼
┌───────────────────────┐
│  chrome-devtools-mcp  │  Headless Chrome via DevTools Protocol
└───────────────────────┘
```

- **Persistent bridge** — a detached process keeps the MCP session alive across commands, so Chrome doesn't restart every invocation
- **Auto-lifecycle** — the bridge starts on first command and writes a PID file to `~/.chrome-devtools-axi/bridge.pid`
- **Snapshot parsing** — accessibility tree snapshots are extracted and analyzed for interactive elements (`uid=` refs)
- **TOON encoding** — structured metadata uses [TOON format](https://www.npmjs.com/package/@toon-format/toon) for compact, token-efficient output

## CLI Reference

| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `open <url>`         | Navigate to URL and snapshot        |
| `snapshot`           | Capture current page state          |
| `click @<uid>`       | Click an element by ref             |
| `fill @<uid> <text>` | Fill a form field                   |
| `type <text>`        | Type text at current focus          |
| `press <key>`        | Press a keyboard key                |
| `scroll <dir>`       | Scroll: up, down, top, bottom       |
| `back`               | Navigate back                       |
| `wait <ms\|text>`    | Wait for time or text to appear     |
| `eval <js>`          | Evaluate JavaScript in page context |
| `start`              | Start the bridge server             |
| `stop`               | Stop the bridge server              |

Running with no command is equivalent to `snapshot`.

### Flags

| Flag     | Description            |
| -------- | ---------------------- |
| `--help` | Show usage information |

## Configuration

The bridge server port defaults to `9224`. Override it with an environment variable:

```sh
export CHROME_DEVTOOLS_AXI_PORT=9225
```

State is stored in `~/.chrome-devtools-axi/`:

| File         | Purpose                            |
| ------------ | ---------------------------------- |
| `bridge.pid` | PID and port of the running bridge |

## Development

```sh
npm run build      # Compile TypeScript to dist/
npm run dev        # Run CLI directly with tsx
npm test           # Run tests with vitest
npm run test:watch # Run tests in watch mode
```
