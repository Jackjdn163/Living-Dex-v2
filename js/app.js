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
  const text = document.getElementById("loading-text");
  const skipBtn = document.getElementById("skip-loading");

  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
  const data = await res.json();
  allPokemon = data.results.map((p, i) => ({
    id: i + 1,
    name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i+1}.png`,
    shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${i+1}.png`
  }));

  const preloadPromises = allPokemon.flatMap(p => [
    new Promise(r => { const img = new Image(); img.src = p.sprite; img.onload = r; }),
    new Promise(r => { const img = new Image(); img.src = p.shiny; img.onload = r; })
  ]);

  setTimeout(() => { pokeball.classList.add("shaking"); pokeball.style.animation = "shake 0.6s 3"; }, 800);

  skipBtn.addEventListener("click", () => {
    pokeball.classList.remove("shaking");
    pokeball.classList.add("success");
    finishLoading(loading);
  });

  await Promise.all([new Promise(r => setTimeout(r, 5000)), Promise.all(preloadPromises)]);

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
  const gensDiv = document.getElementById("completion-gens");
  gensDiv.innerHTML = "";

  genRanges.forEach(g => {
    const genCaught = [...caught].filter(id => id >= g.start && id <= g.end).length;
    const percent = Math.round((genCaught / (g.end - g.start + 1)) * 100);
    const colors = ["#ef4036","#f4a261","#f2c94c","#7ed321","#4a90e2","#9b59b6","#e74c3c","#f1c40f","#8e44ad"];

    const div = document.createElement("div");
    div.className = "completion-bar";
    div.innerHTML = `
      <span>Gen ${g.gen}</span>
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width:${percent}%; background:${colors[g.gen-1]}"></div>
      </div>
      <span>${percent}%</span>
    `;
    gensDiv.appendChild(div);
  });
}

async function showDetail(p) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-name").textContent = `#${p.id} ${p.name}`;
  document.getElementById("modal-sprite").src = getSprite(p);

  const typesDiv = document.getElementById("modal-types");
  const evoDiv = document.getElementById("modal-evo");
  typesDiv.innerHTML = "<strong>Types:</strong><br>";

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

  const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${p.id}`);
  const species = await speciesRes.json();
  if (species.evolution_chain) {
    const chainRes = await fetch(species.evolution_chain.url);
    const chainData = await chainRes.json();
    evoDiv.innerHTML = await buildFullEvoHTML(chainData.chain, p.id);
  } else {
    evoDiv.innerHTML = "No evolution data";
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
  const count = caught.size;
  document.getElementById("caught-count").textContent = count;
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
}

function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}
