# Living Dex • 1025 Pokémon
**A beautiful, fully interactive Living Pokédex for tracking your complete collection of all 1025 Pokémon.**

Live Demo → **[https://jackjdn163.github.io/Living-Dex-v2/](https://jackjdn163.github.io/Living-Dex-v2/)**

---

## ✨ Features

### Core Pokédex Experience
- **All 1025 Pokémon** from Generation 1 through 9
- Click any card to **catch / uncatch** (progress saved automatically in your browser)
- Official sprites with **Shiny toggle** that instantly updates every card
- **Dark / Light mode** toggle (persists between visits)

### Progress Tracking
- **Total Living Dex percentage bar** with live fill + count (`0 / 1025`)
- **Per-generation completion bars** (Gen 1–9) with colored progress
- Celebration animation when you complete a generation or the full dex
- Real-time updates everywhere

### Navigation & Filters
- **Search** by name or Pokédex number
- **Sort** by Pokédex Number, Name (A–Z), or Uncaught First
- **Random Uncaught Pokémon** button – pulls a random Pokémon you haven’t caught yet

### Details Modal
- Click the `⋮` menu on any card
- Shows **official typing** with colored badges
- Full **evolution chain** with sprites, pre-evolution, post-evolution, and exact method (level, item, etc.)
- Complete **Switch Games** availability with beautifully colored badges (base games + all DLCs)

### Loading Experience
- 5-second animated loading screen with spinning Pokéball
- Ball shakes, then turns green when ready (or click “Skip Loading”)

### Tools Menu (Top-right)
- Hamburger menu in the top-right corner
- **Resizable** – drag the left edge to make it bigger or smaller (resets automatically when closed)
- **Quick Notes** – auto-saving notepad for anything you want to remember
- **EXP Calculator** – search any Pokémon, adjust level with a slider, see:
  - EXP to next level
  - EXP until next evolution (level-based)
  - EXP until level 100
  - Candy needed (XS–XL) for each goal

### Extra Polish
- Smooth animations on catch, progress bars, and completion
- Fully responsive (great on mobile and desktop)
- Everything saved locally in your browser – no account needed

---

## How to Use
1. Visit the **[live demo](https://jackjdn163.github.io/Living-Dex-v2/)**
2. Wait for the Pokéball loading animation to finish
3. Start clicking Pokémon to catch them!
4. Use the toggles, search, sort, and random button
5. Open the `⋮` menu on any card for full details
6. Open the Tools menu (top-right) for Quick Notes and the EXP Calculator

Your progress is automatically saved. Use the **Reset** button if you want to start fresh.

---

## Tech Stack
- **HTML5**, **CSS3** (with CSS variables for dark/light mode)
- **Vanilla JavaScript** (no frameworks)
- [PokéAPI](https://pokeapi.co/) for all data, sprites, evolution chains, and growth rates
- Fully client-side – works offline after first load

---

## Running Locally
1. Clone the repo:
   ```bash
   git clone https://github.com/jackjdn163/Living-Dex-v2.git
