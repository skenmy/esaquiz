# esaquiz

Quiz overlay system for ESA marathon streams — a stripped-down sibling
of [esalowerthird](https://github.com/skenmy/esalowerthird) focused
exclusively on the quiz format.

- **`/source.html`** — the OBS browser source. Transparent background;
  renders the active question, answer reveal, holding screen and
  leaderboard on cue.
- **`/control.html`** — the operator panel. Imports a question file,
  steps through questions, reveals answers, manages player scores,
  shows/hides the leaderboard. State persists in `localStorage`.

Visiting `/` redirects to `control.html`.

Live at **<https://esaquiz.skenmy.com>** — `/control.html` is gated
behind a Twitch sign-in via [tools.skenmy.com](https://tools.skenmy.com).

## What the relay does

`relay.js` (~100 lines) serves the two HTML files and relays JSON
messages between connected clients on `/ws`. There are no external
APIs to poll — questions live in `localStorage` on the operator's
machine and are broadcast on demand. The only dependency is `ws`.

The relay also sends a `clients` count broadcast on connect/disconnect
and a `ping` every 30s; everything else it doesn't recognise is
forwarded verbatim to all *other* clients.

## Question file format

Tab-separated `.txt` / `.tsv` / `.csv`, header row skipped. Columns:

| col | field |
|---|---|
| 0 | round number |
| 1 | question number |
| 2 | question text |
| 3 | image URL (optional) |
| 4 | answer text |
| 5 | notes (optional) |

## WebSocket protocol

Every message is `{ type, … }`. The relay forwards every message it
doesn't recognise to every other client. Control → source unless
stated otherwise.

| type | payload |
|---|---|
| `show_question` | `{ roundNo, questionNo, questionText, imageUrl }` |
| `hide_question` | `{}` |
| `show_answer` | `{ answerText, notes }` |
| `hide_answer` | `{}` |
| `show_holding` | `{ title, subtitle, logoUrl }` |
| `hide_holding` | `{}` |
| `show_leaderboard` | `{ players: [{ name, score }] }` |
| `hide_leaderboard` | `{}` |
| `hide_all` | `{}` |
| `clients` | `{ count }` — relay → all |
| `ping` / `pong` | `{}` — keepalive, 30s interval |

## Env

| var | notes |
|---|---|
| `PORT` | default `8080` |

## Local dev

```sh
npm install
./serve.sh                       # http://localhost:8080
# or: npm start
```

OBS browser source URL: `http://localhost:8080/source.html`
Control: `http://localhost:8080/control.html`

## Deploy

Standard skenmy-vps pattern: push to `main` → CI builds and pushes
`ghcr.io/skenmy/esaquiz`, then fires the skenmy-vps deploy workflow.
