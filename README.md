# Twin Canvas — Spot the Difference

A complete, original spot-the-difference game built for the [make.fun](https://make.fun) "Make the best spot the difference game" bounty.

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Xysuffff/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Xysuffff/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

## About

Twin Canvas is a polished spot-the-difference game with 6 beautifully themed levels. Each level presents two near-identical scenes side by side, challenging players to find all differences before time runs out.

### Features

- **6 Unique Themes**: Garden, Workshop, Library, Observatory, Conservatory, Atelier
- **Procedural Generation**: Every playthrough generates fresh scenes with 5-10 differences
- **7 Difference Types**: Color changes, missing/extra elements, size shifts, position changes, rotations, shape changes
- **Smart UI**: Real-time HUD with level, found/remaining counters, timer, and hint system
- **Visual Feedback**: Pulsing markers on unfound differences, expanding rings on finds, hint highlights
- **Persistent Best Time**: Tracks your best completion time across sessions
- **Zero Dependencies**: Pure vanilla JavaScript/TypeScript, no build step required

### Play Locally

```bash
node serve.ts
# Open http://localhost:8080
```

### Controls

- **Mouse/Touch**: Click/tap on differences in either panel
- **H Key**: Use hint (3 per level)
- **Space/Enter**: Start game, confirm actions
- **Escape/P**: Pause/resume

### Tech Stack

- **Language**: TypeScript (run directly on Node 22+)
- **Rendering**: HTML5 Canvas 2D
- **Architecture**: Modular ES modules (config, random, world, input, render, shots, main)
- **Art**: 100% procedural — no external assets, no network requests

## License

MIT License — see [LICENSE](LICENSE) for details.

Built with 🤖 for make.fun
