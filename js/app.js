let allPokemon = [];
let caught = new Set(JSON.parse(localStorage.getItem("caught")) || []);
let shinyMode = false;
let currentPokemonId = null;

const typeColors = { normal:"#A8A878", fire:"#F08030", water:"#6890F0", grass:"#78C850", electric:"#F8D030", ice:"#98D8D8", fighting:"#C03028", poison:"#A040A0", ground:"#E0C068", flying:"#A890F0", psychic:"#F85888", bug:"#A8B820", rock:"#B8A038", ghost:"#705898", dragon:"#7038F8", dark:"#705848", steel:"#B8B8D0", fairy:"#EE99AC" };

const genRanges = [
  {gen:1, start:1, end:151}, {gen:2, start:152, end:251}, {gen:3, start:252, end:386},
  {gen:4, start:387, end:493}, {gen:5, start:494, end:649}, {gen:6, start:650, end:721},
  {gen:7, start:722, end:809}, {gen:8, start:810, end:905}, {gen:9, start:906, end:1025}
];

document.addEventListener("DOMContentLoaded", () => {
  const loading = document.getElementById("loading");

  // 5-second loading with shake + "Gotcha!"
  setTimeout(() => {
    const pokeball = document.getElementById("pokeball");
    const text = document.getElementById("loading-text");
    pokeball.style.animation = "shake 0.5s 4";
    text.textContent = "Gotcha!";
    setTimeout(() => {
      loading.style.opacity = "0";
      setTimeout(() => { loading.remove(); initApp(); }, 800);
    }, 1600);
  }, 3200);
});

async function initApp() {
  await fetchPokemon();
  setupEventListeners();
  renderGrid();
  renderGenProgress();
}

async function fetchPokemon() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
  const data = await res.json();
  allPokemon = data.results.map((p, i) => ({
    id: i + 1,
    name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i+1}.png`,
    shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${i+1}.png`
  }));
}

function getSprite(p) { return shinyMode ? p.shiny : p.sprite; }

function renderGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  let sorted = [...allPokemon];
  const sortType = document.getElementById("sort-select").value;

  if (sortType === "name") sorted.sort((a,b) => a.name.localeCompare(b.name));
  else if (sortType === "uncaught") {
    sorted.sort((a,b) => {
      const aC = caught.has(a.id), bC = caught.has(b.id);
      return aC === bC ? a.id - b.id : aC ? 1 : -1;
    });
  }

  sorted.forEach(p => {
    const isCaught = caught.has(p.id);
    const card = document.createElement("div");
    card.className = `pokemon-card ${isCaught ? "caught" : ""}`;
    card.innerHTML = `
      <img src="${getSprite(p)}" alt="${p.name}">
      <strong>#${p.id.toString().padStart(4,"0")}</strong><br>
      <span>${p.name}</span>
    `;
    card.addEventListener("click", () => showDetail(p));
    grid.appendChild(card);
  });
  updateTotalProgress();
}

async function showDetail(p) {
  currentPokemonId = p.id;
  const modal = document.getElementById("modal");
  document.getElementById("modal-name").textContent = `#${p.id} ${p.name}`;
  document.getElementById("modal-sprite").src = getSprite(p);

  const typesDiv = document.getElementById("modal-types");
  const evoDiv = document.getElementById("modal-evo");
  typesDiv.innerHTML = "<strong>Types:</strong><br>";
  evoDiv.innerHTML = "<strong>Evolution:</strong><br>Loading...";

  // Fetch types + evolution
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`);
  const data = await res.json();
  data.types.forEach(t => {
    const color = typeColors[t.type.name] || "#777";
    const badge = document.createElement("span");
    badge.className = "type-badge";
    badge.style.backgroundColor = color;
    badge.textContent = t.type.name.toUpperCase();
    typesDiv.appendChild(badge);
  });

  // Simple evo info (pre / post + method)
  const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${p.id}`);
  const species = await speciesRes.json();
  if (species.evolution_chain) {
    const chainRes = await fetch(species.evolution_chain.url);
    const chainData = await chainRes.json();
    evoDiv.innerHTML = parseSimpleEvo(chainData.chain, p.id);
  }

  // Update toggle button text
  const toggleBtn = document.getElementById("toggle-caught-btn");
  toggleBtn.textContent = caught.has(p.id) ? "Mark as Uncaught" : "Mark as Caught";

  modal.style.display = "flex";
  modal.classList.remove("hidden");
}

function parseSimpleEvo(chain, currentId) {
  let html = "";
  // Basic pre/post display (can be expanded later)
  const id = parseInt(chain.species.url.split("/")[6]);
  const name = chain.species.name.charAt(0).toUpperCase() + chain.species.name.slice(1);
  if (id < currentId) html += `⬅️ Pre-evolution: ${name}<br>`;
  else if (id > currentId) html += `➡️ Evolves to: ${name}<br>`;
  return html || "No evolution data";
}

function updateTotalProgress() {
  const count = caught.size;
  document.getElementById("caught-count").textContent = count;
  document.getElementById("total-progress-bar").style.width = `${(count / 1025) * 100}%`;
}

function renderGenProgress() {
  const container = document.getElementById("gen-progress");
  container.innerHTML = "";
  genRanges.forEach(g => {
    const genCaught = [...caught].filter(id => id >= g.start && id <= g.end).length;
    const total = g.end - g.start + 1;
    const percent = Math.round((genCaught / total) * 100);
    const div = document.createElement("div");
    div.className = "gen-card";
    div.innerHTML = `
      <strong>Gen ${g.gen}</strong> ${genCaught}/${total} (${percent}%)
      <div class="progress-bar"><div class="progress-bar-fill" style="width:${percent}%"></div></div>
    `;
    container.appendChild(div);
  });
}

function toggleCaught(id) {
  if (caught.has(id)) caught.delete(id);
  else caught.add(id);
  localStorage.setItem("caught", JSON.stringify([...caught]));
  renderGrid();
  renderGenProgress();
  // Check if a generation was just completed
  const gen = genRanges.find(g => id >= g.start && id <= g.end).gen;
  const genCaught = [...caught].filter(i => i >= genRanges[gen-1].start && i <= genRanges[gen-1].end).length;
  const genTotal = genRanges[gen-1].end - genRanges[gen-1].start + 1;
  if (genCaught === genTotal) alert(`🎉 You completed Generation ${gen}!`);
}

function setupEventListeners() {
  // Shiny
  document.getElementById("shiny-btn").addEventListener("click", () => {
    shinyMode = !shinyMode;
    document.getElementById("shiny-btn").textContent = shinyMode ? "✨ Shiny ON" : "✨ Shiny OFF";
    renderGrid();
  });

  // Dark/Light
  document.getElementById("theme-btn").addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
    document.getElementById("theme-btn").textContent = isDark ? "☀️ Light" : "🌙 Dark";
  });

  // Sort
  document.getElementById("sort-select").addEventListener("change", renderGrid);

  // Random uncaught
  document.getElementById("random-btn").addEventListener("click", () => {
    const uncaught = allPokemon.filter(p => !caught.has(p.id));
    if (uncaught.length === 0) return alert("You caught them all! 🔥");
    showDetail(uncaught[Math.floor(Math.random() * uncaught.length)]);
  });

  // Modal toggle caught
  document.getElementById("toggle-caught-btn").addEventListener("click", () => {
    if (currentPokemonId) {
      toggleCaught(currentPokemonId);
      // Update button text instantly
      const btn = document.getElementById("toggle-caught-btn");
      btn.textContent = caught.has(currentPokemonId) ? "Mark as Uncaught" : "Mark as Caught";
    }
  });

  // Close modal
  const closeModal = () => {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
    modal.classList.add("hidden");
  };
  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("modal-close-btn").addEventListener("click", closeModal);

  // Reset
  document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("Reset entire Living Dex?")) {
      caught.clear();
      localStorage.removeItem("caught");
      renderGrid();
      renderGenProgress();
    }
  });
}
