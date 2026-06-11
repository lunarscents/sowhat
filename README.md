# So What?!

**Turn conference ideas into evidence-driven action**

So What?! is a lightweight conference game that helps attendees turn conference ideas into practical follow-up. Instead of leaving with vague excitement, attendees collect evidence, convert it into practical loot, defeat a hype monster, and leave with one useful insight and one concrete next action.

## What It Does

Attendees choose a hype monster, capture signals from sessions, Q&A, sponsors, and hallway conversations, then convert those signals into practical loot. Each piece of loot reduces the monster's HP. Once enough useful evidence has been collected, the Final Boss unlocks and generates a final insight, next action, and team share summary.

## Why It Matters

Tech conferences are full of big claims, new tools, and high-energy demos. The hard part is deciding what actually matters after the event. So What?! gives attendees a playful structure for separating hype from useful action, while giving organizers aggregate signals about what attendees found practical.

## Judging Criteria Fit

| Criterion | Where it appears |
| --- | --- |
| Better content discovery | Attendees hunt for evidence across sessions, Q&A, sponsor booths, and hallway conversations. |
| Smarter interactions | Source-aware suggested questions help attendees ask more practical questions. |
| Meaningful interactions at scale | Organizer dashboard turns collected evidence and loot into aggregate signals and recommendations. |
| Kendo UI components | Cards, Dialogs, Forms, ProgressBars, Grid, Charts, and Notifications are used in the core app flow. |
| Real-world impact | Final Boss output gives attendees a shareable insight, next action, and team summary. |

## Core Game Loop

1. Pick a hype monster.
2. Add evidence from the conference.
3. Convert evidence into practical loot.
4. Reduce the monster's HP.
5. Store loot in the inventory.
6. Unlock the Final Boss after enough loot or a defeated monster.
7. Generate a final insight, next action, and team share summary.
8. Review aggregate signals in the organizer dashboard.

## Features

- Selectable hype monsters, including the demo-ready AI Hype Hydra.
- Evidence capture for sessions, Q&A, sponsors, hallway conversations, and reflection.
- Rule-based loot generation for quick local demos.
- Demo data loader with realistic hackathon-ready content.
- Monster HP tracking and Final Boss unlock state.
- Loot inventory with practical takeaways.
- Final Boss result with insight, next action, and share summary.
- Organizer dashboard with aggregate signal charts.
- Local state persistence with localStorage.

## Kendo UI Usage

So What?! uses KendoReact components throughout the MVP:

- `Card` for monster, battle, result, and dashboard surfaces.
- `Dialog` for evidence input and Final Boss.
- `Form`, `Input`, `TextArea`, and `DropDownList` for evidence collection.
- `ProgressBar` for monster HP.
- `Grid` for loot inventory.
- `Chart` for organizer dashboard signals.
- `Notification` for loot and boss feedback.

## Tech Stack

- React
- TypeScript
- Vite
- KendoReact
- Local state and localStorage
- Mock/rule-based AI logic
- No backend
- No login
- No external AI API

## How To Run Locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

To build:

```bash
npm run build
```

Note: the project includes a small Vite runner because the workspace folder name contains `?`, which can confuse Vite package resolution on some systems.

## Demo Flow

1. Click **Load Demo Data**.
2. Review the selected monster: **AI Hype Hydra**.
3. Show the seeded loot inventory:
   - Trust Loop Crystal
   - Guardrail Shard
   - Human Review Rune
4. Point out the reduced monster HP and unlocked Final Boss.
5. Click **Challenge final boss**.
6. Click **Defeat boss**.
7. Present the final insight, next action, and team share summary.
8. Open the Organizer tab to show aggregate dashboard charts.
9. Use **Reset Demo** to restart the story.

For a timed presentation, use [DEMO_SCRIPT.md](./DEMO_SCRIPT.md).

## Future Extensions

- Event-specific monster and loot packs.
- Exportable team recap cards.
- Organizer-configurable prompts and categories.
- Optional QR-based session collection.
- Anonymous aggregate reporting across attendees.
- Optional integration with real AI services after the MVP.
