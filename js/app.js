let allPokemon = [];
let caught = new Set(JSON.parse(localStorage.getItem("caught")) || []);
let shinyMode = false;
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
const typeColors = { normal:"#A8A878", fire:"#F08030", water:"#6890F0", grass:"#78C850", electric:"#F8D030", ice:"#98D8D8", fighting:"#C03028", poison:"#A040A0", ground:"#E0C068", flying:"#A890F0", psychic:"#F85888", bug:"#A8B820", rock:"#B8A038", ghost:"#705898", dragon:"#7038F8", dark:"#705848", steel:"#B8B8D0", fairy:"#EE99AC" };
const genRanges = [
  {gen:1, start:1, end:151}, {gen:2, start:152, end:251}, {gen:3, start:252, end:386},
  {gen:4, start:387, end:493}, {gen:5, start:494, end:649}, {gen:6, start:650, end:721},
  {gen:7, start:722, end:809}, {gen:8, start:810, end:905}, {gen:9, start:906, end:1025}
];
document.addEventListener("DOMContentLoaded", () => { preloadAllAssets(); });
async function preloadAllAssets() {
  const loading = document.getElementById("loading");
  const pokeball = document.getElementById("pokeball");
  const skipBtn = document.getElementById("skip-loading");
  // ←←← SKIP BUTTON WORKS IMMEDIATELY (fixed)
  skipBtn.addEventListener("click", () => {
    pokeball.classList.remove("shaking");
    pokeball.classList.add("success");
    finishLoading(loading);
  });
  // Fetch Pokémon list
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
  const data = await res.json();
  allPokemon = data.results.map((p, i) => ({
    id: i + 1,
    name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i+1}.png`,
    shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${i+1}.png`
  }));
  // Proper preloading (so sprites are ready when grid appears)
  const preloadPromises = allPokemon.flatMap(p => [
    new Promise(r => { const img = new Image(); img.src = p.sprite; img.onload = r; }),
    new Promise(r => { const img = new Image(); img.src = p.shiny; img.onload = r; })
  ]);
  // Start the shake animation after a short delay
  setTimeout(() => {
    pokeball.classList.add("shaking");
    pokeball.style.animation = "shake 0.6s 3";
  }, 800);
  // Wait for BOTH the 5-second timer AND all images to preload
  await Promise.all([
    new Promise(r => setTimeout(r, 5000)),
    Promise.all(preloadPromises)
  ]);
  // Finish loading
  pokeball.classList.remove("shaking");
  pokeball.classList.add("success");
  finishLoading(loading);
}
function finishLoading(loading) {
  initApp();
  setTimeout(() => {
    loading.style.transition = "opacity 0.8s";
    loading.style.opacity = "0";
    setTimeout(() => loading.remove(), 800);
  }, 1100);
}
async function initApp() {
  setupEventListeners();
  renderGrid();
  renderCompletionBars();
}
function getSprite(p) { return shinyMode ? p.shiny : p.sprite; }
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}
function renderGrid(filterTerm = "") {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  let filtered = [...allPokemon];
  if (filterTerm) {
    const term = filterTerm.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(term) || p.id.toString().padStart(4,"0").includes(term)
    );
  }
  const sortType = document.getElementById("sort-select").value;
  if (sortType === "name") filtered.sort((a,b) => a.name.localeCompare(b.name));
  else if (sortType === "uncaught") {
    filtered.sort((a,b) => {
      const aC = caught.has(a.id), bC = caught.has(b.id);
      return aC === bC ? a.id - b.id : aC ? 1 : -1;
    });
  }
  filtered.forEach(p => {
    const isCaught = caught.has(p.id);
    const card = document.createElement("div");
    card.className = `pokemon-card ${isCaught ? "caught" : ""}`;
    card.innerHTML = `
      <button class="menu-btn">⋮</button>
      <img src="${getSprite(p)}" alt="${p.name}">
      <strong>#${p.id.toString().padStart(4,"0")}</strong><br>
      <span>${p.name}</span>
    `;
    card.addEventListener("click", e => { if (!e.target.classList.contains("menu-btn")) toggleCaught(p.id); });
    card.querySelector(".menu-btn").addEventListener("click", e => { e.stopImmediatePropagation(); showDetail(p); });
    grid.appendChild(card);
  });
  updateTotalProgress();
}
function renderCompletionBars() {
  console.log("✅ renderCompletionBars() started");
  const gensDiv = document.getElementById("completion-gens");
  if (!gensDiv) {
    console.error("❌ #completion-gens element NOT FOUND in the DOM!");
    return;
  }
  console.log("✅ Found #completion-gens, clearing it...");
  gensDiv.innerHTML = "";
  const colors = ["#ef4036","#f4a261","#f2c94c","#7ed321","#4a90e2","#9b59b6","#e74c3c","#f1c40f","#8e44ad"];
  genRanges.forEach(g => {
    const genCaught = [...caught].filter(id => id >= g.start && id <= g.end).length;
    const total = g.end - g.start + 1;
    const percent = Math.round((genCaught / total) * 100);
    const div = document.createElement("div");
    div.className = "completion-bar";
    div.innerHTML = `
      <span>Gen ${g.gen}</span>
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width: ${percent}%; background-color: ${colors[g.gen-1]};"></div>
      </div>
      <span>${genCaught}/${total} — ${percent}%</span>
    `;
    gensDiv.appendChild(div);
    console.log(` Gen ${g.gen}: ${genCaught}/${total} (${percent}%)`);
  });
  console.log("✅ All generation bars added successfully!");
}
async function showDetail(p) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-name").textContent = `#${p.id} ${p.name}`;
  document.getElementById("modal-sprite").src = getSprite(p);
  const typesDiv = document.getElementById("modal-types");
  const evoDiv = document.getElementById("modal-evo");
  const gamesDiv = document.getElementById("modal-games");
  // Clear previous content
  typesDiv.innerHTML = "<strong>Types:</strong><br>";
  evoDiv.innerHTML = "";
  gamesDiv.innerHTML = "<strong>Switch Games:</strong><br>";
  // Fetch Pokémon data (for types + moves + evo)
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`);
  const data = await res.json();
  // === TYPES ===
  data.types.forEach(t => {
    const color = typeColors[t.type.name] || "#777";
    const badge = document.createElement("span");
    badge.className = "type-badge";
    badge.style.backgroundColor = color;
    badge.textContent = t.type.name.toUpperCase();
    typesDiv.appendChild(badge);
  });
  // === EVOLUTION CHAIN ===
  const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${p.id}`);
  const species = await speciesRes.json();
  if (species.evolution_chain) {
    const chainRes = await fetch(species.evolution_chain.url);
    const chainData = await chainRes.json();
    evoDiv.innerHTML = await buildFullEvoHTML(chainData.chain, p.id);
  } else {
    evoDiv.innerHTML = "No evolution data";
  }

  // ===================== SWITCH GAMES (Base + DLC) =====================
  const switchGameMap = {
    "lets-go-pikachu-lets-go-eevee": "Let's Go, Pikachu! / Let's Go, Eevee!",
    "sword-shield": "Sword / Shield (Base)",
    "brilliant-diamond-shining-pearl": "Brilliant Diamond / Shining Pearl",
    "legends-arceus": "Legends: Arceus",
    "scarlet-violet": "Scarlet / Violet (Base)",
    "crown-tundra": "Crown Tundra DLC",
    "teal-mask": "Teal Mask DLC",
    "indigo-disk": "Indigo Disk DLC",
    "legends-z-a": "Legends: Z-A"
  };

  const gamesSet = new Set();

  // PokéAPI data for base games
  data.moves.forEach(move => {
    move.version_group_details.forEach(detail => {
      const vgName = detail.version_group.name;
      if (switchGameMap[vgName]) gamesSet.add(vgName);
    });
  });

  // Static DLC lists (main vs DLC distinction)
  const crownTundraDLC = new Set([898]);           // Calyrex + any future Crown Tundra exclusives
  const tealMaskDLC     = new Set([1017]);         // Ogerpon + any future Teal Mask exclusives
  const indigoDiskDLC   = new Set([]);             // Add Indigo Disk exclusives here later

  if (crownTundraDLC.has(p.id)) gamesSet.add("crown-tundra");
  if (tealMaskDLC.has(p.id))     gamesSet.add("teal-mask");
  if (indigoDiskDLC.has(p.id))   gamesSet.add("indigo-disk");

  // Legends: Z-A (already in your code)
  const legendsZA = new Set([
    152,153,154,498,499,500,158,159,160,661,662,663,659,660,664,665,666,
    13,14,15,16,17,18,19,20,21,22,23,179,180,181,504,505,406,315,407,
    129,130,688,689,120,121,669,670,671,672,673,133,34,35,36,37,38,39,
    40,41,42,43,44,45,46,47,48,49,50,172,25,26,173,35,36,37,167,168,
    23,24,63,64,65,92,93,94,543,544,545,679,680,681,69,70,71,511,512,
    513,514,515,516,382,383,384,307,308,309,310,280,281,282,475,228,229,
    333,334,441,685,686,684,682,133,134,135,136,196,197,470,471,700,
    427,428,353,354,582,583,584,322,323,449,450,529,530,551,552,553,
    66,67,68,443,444,445,703,302,303,359,447,448,79,80,199,318,319,
    602,603,604,147,148,149,1,2,3,4,5,6,7,8,9,618,676,686,687,690,691,
    692,693,704,705,706,225,361,362,478,459,460,712,713,123,212,214,127,
    214,215,227,653,654,655,371,372,373,115,780,374,375,376,716,717,718
  ]);
  if (legendsZA.has(p.id)) {
    gamesSet.add("legends-z-a");
  }

  // === Display all games in nice order ===
  const order = ["lets-go-pikachu-lets-go-eevee", "sword-shield", "crown-tundra", "brilliant-diamond-shining-pearl", "legends-arceus", "scarlet-violet", "teal-mask", "indigo-disk", "legends-z-a"];
  order.forEach(key => {
    if (gamesSet.has(key)) {
      const badge = document.createElement("span");
      badge.className = "game-badge";
      badge.textContent = switchGameMap[key];
      if (key === "legends-z-a") badge.style.background = "linear-gradient(90deg, #a78bfa, #7c3aed)";
      if (["crown-tundra","teal-mask","indigo-disk"].includes(key)) badge.style.background = "linear-gradient(90deg, #f59e0b, #d97706)"; // orange for DLC
      gamesDiv.appendChild(badge);
    }
  });

  if (gamesSet.size === 0) {
    const none = document.createElement("span");
    none.style.opacity = "0.6";
    none.style.fontStyle = "italic";
    none.textContent = "Not available in any Switch games";
    gamesDiv.appendChild(none);
  }

  modal.style.display = "flex";
  modal.classList.remove("hidden");
}
async function buildFullEvoHTML(chain, currentId) {
  let html = `<strong>Evolution Chain:</strong><br>`;
  let preNode = chain;
  while (preNode.evolves_to && preNode.evolves_to.length > 0) {
    const nextId = parseInt(preNode.evolves_to[0].species.url.split("/")[6]);
    if (nextId === currentId) {
      const preId = parseInt(preNode.species.url.split("/")[6]);
      const preName = preNode.species.name.charAt(0).toUpperCase() + preNode.species.name.slice(1);
      const preSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${preId}.png`;
      const details = preNode.evolves_to[0].evolution_details[0] || {};
      const method = getEvolutionMethod(details);
      html += `<div class="evo-row"><img src="${preSprite}" alt="${preName}"> <span><strong>Evolved from</strong> ${preName}<br><span class="evo-method">${method}</span></span></div>`;
      break;
    }
    preNode = preNode.evolves_to[0];
  }
  let currentNode = chain;
  while (currentNode) {
    const id = parseInt(currentNode.species.url.split("/")[6]);
    if (id === currentId && currentNode.evolves_to && currentNode.evolves_to.length > 0) {
      html += `<strong>Evolves into:</strong><br>`;
      for (let evo of currentNode.evolves_to) {
        const nextId = parseInt(evo.species.url.split("/")[6]);
        const nextName = evo.species.name.charAt(0).toUpperCase() + evo.species.name.slice(1);
        const nextSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${nextId}.png`;
        const details = evo.evolution_details[0] || {};
        const method = getEvolutionMethod(details);
        html += `<div class="evo-row"><img src="${nextSprite}" alt="${nextName}"> <span>${nextName}<br><span class="evo-method">${method}</span></span></div>`;
      }
      break;
    }
    currentNode = currentNode.evolves_to && currentNode.evolves_to.length > 0 ? currentNode.evolves_to[0] : null;
  }
  return html || "No evolution data";
}
function getEvolutionMethod(details) {
  if (details.min_level) return `Level ${details.min_level}`;
  if (details.item) return details.item.name.replace(/-/g, " ");
  if (details.trigger) return details.trigger.name;
  return "???";
}
function toggleCaught(id) {
  if (caught.has(id)) caught.delete(id);
  else caught.add(id);
  localStorage.setItem("caught", JSON.stringify([...caught]));
  const searchTerm = document.getElementById("search-bar").value;
  renderGrid(searchTerm);
  renderCompletionBars();
  updateTotalProgress();
  const gen = genRanges.find(g => id >= g.start && id <= g.end).gen;
  const genCaught = [...caught].filter(i => i >= genRanges[gen-1].start && i <= genRanges[gen-1].end).length;
  const genTotal = genRanges[gen-1].end - genRanges[gen-1].start + 1;
  if (genCaught === genTotal) alert(`You completed Generation ${gen}!`);
}
function updateTotalProgress() {
  const total = 1025;
  const count = caught.size;
  const percent = Math.round((count / total) * 100);
  const percentEl = document.getElementById("total-percentage");
  const fillEl = document.getElementById("total-bar-fill");
  const countEl = document.getElementById("caught-count");
  if (percentEl) percentEl.textContent = `${percent}%`;
  if (fillEl) fillEl.style.width = `${percent}%`;
  if (countEl) countEl.textContent = `${count} / ${total}`;
  if (percent === 100 && fillEl) {
    fillEl.classList.add("complete-flash");
    setTimeout(() => fillEl.classList.remove("complete-flash"), 1500);
  }
}
function setupEventListeners() {
  const searchBar = document.getElementById("search-bar");
  const debouncedRender = debounce(() => renderGrid(searchBar.value), 150);
  searchBar.addEventListener("input", debouncedRender);
  document.getElementById("sort-select").addEventListener("change", () => renderGrid(searchBar.value));
  document.getElementById("random-btn").addEventListener("click", () => {
    const uncaught = allPokemon.filter(p => !caught.has(p.id));
    if (uncaught.length === 0) return alert("You caught them all!");
    showDetail(uncaught[Math.floor(Math.random() * uncaught.length)]);
  });
  const darkToggle = document.getElementById("dark-toggle");
  darkToggle.checked = document.documentElement.getAttribute("data-theme") === "dark";
  darkToggle.addEventListener("change", () => {
    const newTheme = darkToggle.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
  const shinyToggle = document.getElementById("shiny-toggle");
  shinyToggle.checked = shinyMode;
  shinyToggle.addEventListener("change", () => {
    shinyMode = shinyToggle.checked;
    renderGrid(document.getElementById("search-bar").value);
  });
  const closeModal = () => {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
    modal.classList.add("hidden");
  };
  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("Reset entire Living Dex?")) {
      caught.clear();
      localStorage.removeItem("caught");
      renderGrid(document.getElementById("search-bar").value);
      renderCompletionBars();
      updateTotalProgress();
    }
  });
  /* ===================== NEW: TOOLS MENU TOGGLE ===================== */
  const toolsBtn = document.getElementById("tools-btn");
  const toolsMenu = document.getElementById("tools-menu");
  const closeTools = document.getElementById("close-tools");
  toolsBtn.addEventListener("click", () => {
    toolsMenu.classList.toggle("open");
  });
  closeTools.addEventListener("click", () => {
    toolsMenu.classList.remove("open");
  });
  // Click outside the menu to close
  document.addEventListener("click", (e) => {
    if (toolsMenu.classList.contains("open") &&
        !toolsMenu.contains(e.target) &&
        !toolsBtn.contains(e.target)) {
      toolsMenu.classList.remove("open");
    }
  });
}
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}
