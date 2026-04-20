# Living Dex • 1025 Pokémon

![Living Dex Banner](https://raw.githubusercontent.com/jackjdn163/Living-Dex-v2/main/preview.jpg)  
*(Add a nice screenshot here once you take one!)*

**A beautiful, fully interactive Living Pokédex built for tracking your complete collection of all 1025 Pokémon.**

Live Demo → **[https://jackjdn163.github.io/Living-Dex-v2/](https://jackjdn163.github.io/Living-Dex-v2/)**

---

## ✨ Features

### Core Pokédex Experience
- **All 1025 Pokémon** from Generation 1 through 9
- Click any card to **catch / uncatch** it (saved automatically in your browser)
- Beautiful Pokémon cards with official sprites
- **Shiny toggle** – instantly switches every sprite to its shiny version
- **Dark / Light mode** toggle (persists between visits)

### Progress Tracking
- **Total Living Dex percentage bar** with live fill + count (`0 / 1025`)
- **Per-generation completion bars** (Gen 1–9) with colored progress
- Celebration animation when you hit 100% or complete a generation
- Real-time updates everywhere

### Navigation & Filters
- **Search** by name or Pokédex number
- **Sort** by:
  - Pokédex Number (default)
  - Name (A–Z)
  - Uncaught First
- **Random Uncaught Pokémon** button – instantly shows a random Pokémon you haven’t caught yet

### Details Modal
- Click the `⋮` menu on any card to open a full detail view
- Shows **official typing** with colored badges
- Complete **evolution chain** with pre-evolution, post-evolution, and exact evolution method (level, item, etc.)

### Loading Experience
- 5-second animated loading screen with spinning Pokéball
- Ball shakes, then turns green when ready (or click “Skip Loading”)

### Tools Menu (Top-right)
- Hamburger menu (three lines) in the top-right corner
- Ready for future tools: Export/Import, Shiny Stats, Advanced Filters, etc.
- Currently shows placeholder text – more features coming soon!

### Extra Polish
- Smooth animations on catch, progress bars, and completion
- Fully responsive (works great on mobile & desktop)
- Everything saved locally in your browser – no account needed

---

## How to Use

1. Visit the **[live demo](https://jackjdn163.github.io/Living-Dex-v2/)**
2. Wait for the Pokéball to finish loading
3. Start clicking Pokémon to catch them!
4. Use the toggles, search, sort, and random button to navigate
5. Open the detail menu (`⋮`) for typing + evolution info
6. Your progress is automatically saved – come back anytime!

**Reset button** is there if you want to start over.

---

## Tech Stack

- **HTML5**, **CSS3** (with CSS variables for dark/light mode)
- **Vanilla JavaScript** (no frameworks)
- [PokéAPI](https://pokeapi.co/) for all data & sprites
- Fully client-side – works offline after first load

---

## Running Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/jackjdn163/Living-Dex-v2.git
