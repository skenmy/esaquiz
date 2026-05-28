# esaquiz

Quiz overlay system for ESA marathon streams — a stripped-down sibling
of [esalowerthird](https://github.com/skenmy/esalowerthird) focused
exclusively on the quiz format.

- **`/source.html`** — the OBS browser source. Transparent background;
  renders the active quiz question + answer reveals on cue. Listen
  only.
- **`/control.html`** — the operator panel. Loads question banks,
  picks the next question, reveals answers, shows scores.

Live at **<https://esaquiz.skenmy.com>** — `/control.html` is gated
behind a Twitch sign-in via [tools.skenmy.com](https://tools.skenmy.com).

## What the relay does

`relay.js` is small (~100 lines): it serves the two HTML files and
relays JSON messages between connected clients. There are no external
APIs to poll — questions live in `localStorage` on the operator's
machine and are broadcast on demand.

## WebSocket protocol

Every message is `{ type, … }`. The relay forwards every message it
doesn't recognise to every other client.

| type | direction | payload |
|---|---|---|
| `question_show` | control → source | `{ question, choices?, image? }` |
| `answer_reveal` | control → source | `{ answer, explanation? }` |
| `scores_show` | control → source | `{ scores: [{name, points}] }` |
| `hide` | control → source | `{}` |

## Env

| var | notes |
|---|---|
| `PORT` | default `8080` |

## Local dev

```sh
./serve.sh                       # http://localhost:8080
```

OBS browser source URL: `http://localhost:8080/source.html`
Control: `http://localhost:8080/control.html`

## Deploy

Standard skenmy-vps pattern: push to `main` → CI builds and pushes
`ghcr.io/skenmy/esaquiz`, then fires the skenmy-vps deploy workflow.
