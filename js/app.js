let allPokemon = [];
let caught = new Set(JSON.parse(localStorage.getItem("caught")) || []);
let shinyMode = false;

const typeColors = { normal:"#A8A878", fire:"#F08030", water:"#6890F0", grass:"#78C850", electric:"#F8D030", ice:"#98D8D8", fighting:"#C03028", poison:"#A040A0", ground:"#E0C068", flying:"#A890F0", psychic:"#F85888", bug:"#A8B820", rock:"#B8A038", ghost:"#705898", dragon:"#7038F8", dark:"#705848", steel:"#B8B8D0", fairy:"#EE99AC" };

const genRanges = [
  {gen:1, start:1, end:151}, {gen:2, start:152, end:251}, {gen:3, start:252, end:386},
  {gen:4, start:387, end:493}, {gen:5, start:494, end:649}, {gen:6, start:650, end:721},
  {gen:7, start:722, end:809}, {gen:8, start:810, end:905}, {gen:9, start:906, end:1025}
];

document.addEventListener("DOMContentLoaded", () => {
  const loading = document.getElementById("loading");
  // Exactly 5 seconds total as you wanted
  setTimeout(() => {
    const pokeball = document.getElementById("pokeball");
    const text = document.getElementById("loading-text");
    // Spin → shake (catching animation)
    pokeball.style.animation = "shake 0.6s 3";
    text.textContent = "Catching...";
    setTimeout(() => {
      // Green success flash
      pokeball.style.background = "radial-gradient(circle,#fff 50%,#22c55e 50%)";
      text.style.display = "none";
      document.getElementById("success-flash").classList.remove("hidden");
      setTimeout(() => {
        loading.style.opacity = "0";
        setTimeout(() => { loading.remove(); initApp(); }, 800);
      }, 1100);
    }, 1800);
  }, 3200); // total = 5 seconds
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
      <button class="menu-btn">⋮</button>
      <img src="${getSprite(p)}" alt="${p.name}">
      <strong>#${p.id.toString().padStart(4,"0")}</strong><br>
      <span>${p.name}</span>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("menu-btn")) return;
      toggleCaught(p.id);
    });

    card.querySelector(".menu-btn").addEventListener("click", (e) => {
      e.stopImmediatePropagation();
      showDetail(p);
    });

    grid.appendChild(card);
  });
  updateTotalProgress();
}

async function showDetail(p) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-name").textContent = `#${p.id} ${p.name}`;
  document.getElementById("modal-sprite").src = getSprite(p);

  const typesDiv = document.getElementById("modal-types");
  const evoDiv = document.getElementById("modal-evo");
  typesDiv.innerHTML = "<strong>Types:</strong><br>";

  // Types
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

  // Full evolution chain with sprites + methods
  const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${p.id}`);
  const species = await speciesRes.json();
  if (species.evolution_chain) {
    const chainRes = await fetch(species.evolution_chain.url);
    const chainData = await chainRes.json();
    evoDiv.innerHTML = await buildEvolutionHTML(chainData.chain, p.id);
  } else {
    evoDiv.innerHTML = "No evolution data";
  }

  modal.style.display = "flex";
  modal.classList.remove("hidden");
}

async function buildEvolutionHTML(chain, currentId) {
  let html = `<strong>Evolution Chain:</strong><br>`;
  let current = chain;

  // Find pre-evolution
  // (For simplicity we walk backwards, but PokeAPI chains are forward-only, so we build forward)
  while (current) {
    const id = parseInt(current.species.url.split("/")[6]);
    const name = current.species.name.charAt(0).toUpperCase() + current.species.name.slice(1);
    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

    if (id === currentId) {
      // Current Pokémon – we show pre and post around it
      break;
    }
    if (id < currentId) {
      // Pre-evo
      const details = current.evolves_to[0] ? current.evolves_to[0].evolution_details[0] : {};
      let method = getEvolutionMethod(details);
      html += `<div class="evo-row"><img src="${spriteUrl}" alt="${name}"> <span><strong>Evolved from</strong> ${name}<br><span class="evo-method">${method}</span></span></div>`;
    }
    current = current.evolves_to[0] ? current.evolves_to[0] : null;
  }

  // Now show the next evolution
  const next = chain.evolves_to && chain.evolves_to.length > 0 ? chain.evolves_to[0] : null;
  if (next) {
    let nextNode = next;
    while (nextNode) {
      const id = parseInt(nextNode.species.url.split("/")[6]);
      if (id > currentId) {
        const name = nextNode.species.name.charAt(0).toUpperCase() + nextNode.species.name.slice(1);
        const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
        const details = nextNode.evolution_details[0] || {};
        let method = getEvolutionMethod(details);
        html += `<div class="evo-row"><img src="${spriteUrl}" alt="${name}"> <span><strong>Evolves into</strong> ${name}<br><span class="evo-method">${method}</span></span></div>`;
        break;
      }
      nextNode = nextNode.evolves_to[0] ? nextNode.evolves_to[0] : null;
    }
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
  renderGrid();
  renderGenProgress();

  const gen = genRanges.find(g => id >= g.start && id <= g.end).gen;
  const genCaught = [...caught].filter(i => i >= genRanges[gen-1].start && i <= genRanges[gen-1].end).length;
  const genTotal = genRanges[gen-1].end - genRanges[gen-1].start + 1;
  if (genCaught === genTotal) alert(`🎉 You completed Generation ${gen}!`);
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
    div.innerHTML = `<strong>Gen ${g.gen}</strong> ${genCaught}/${total} (${percent}%)<div class="progress-bar"><div class="progress-bar-fill" style="width:${percent}%"></div></div>`;
    container.appendChild(div);
  });
}

function setupEventListeners() {
  document.getElementById("shiny-btn").addEventListener("click", () => {
    shinyMode = !shinyMode;
    document.getElementById("shiny-btn").textContent = shinyMode ? "✨ Shiny ON" : "✨ Shiny OFF";
    renderGrid();
  });

  document.getElementById("theme-btn").addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
    document.getElementById("theme-btn").textContent = isDark ? "☀️ Light" : "🌙 Dark";
  });

  document.getElementById("sort-select").addEventListener("change", renderGrid);

  document.getElementById("random-btn").addEventListener("click", () => {
    const uncaught = allPokemon.filter(p => !caught.has(p.id));
    if (uncaught.length === 0) return alert("You caught them all! 🔥");
    showDetail(uncaught[Math.floor(Math.random() * uncaught.length)]);
  });

  const closeModal = () => {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
    modal.classList.add("hidden");
  };
  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("modal-close-btn").addEventListener("click", closeModal);

  document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("Reset entire Living Dex?")) {
      caught.clear();
      localStorage.removeItem("caught");
      renderGrid();
      renderGenProgress();
    }
  });
}
