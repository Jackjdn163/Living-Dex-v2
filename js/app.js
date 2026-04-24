let allPokemon = [];
let caught = new Set(JSON.parse(localStorage.getItem("caught")) || []);
let shinyMode = false;
let currentUser = null;
let db = null;
let auth = null;

const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

const typeColors = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", grass: "#78C850",
  electric: "#F8D030", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#B8B8D0", fairy: "#EE99AC"
};

const genRanges = [
  {gen:1, start:1, end:151}, {gen:2, start:152, end:251}, {gen:3, start:252, end:386},
  {gen:4, start:387, end:493}, {gen:5, start:494, end:649}, {gen:6, start:650, end:721},
  {gen:7, start:722, end:809}, {gen:8, start:810, end:905}, {gen:9, start:906, end:1025}
];

// ===================== GAME HIGHLIGHT SYSTEM =====================
let currentHighlightedGame = null;
let gameAvailabilityCache = new Map();

const switchGameMap = {
  "lets-go-pikachu-lets-go-eevee": "Let's Go, Pikachu! / Let's Go, Eevee!",
  "sword-shield": "Sword / Shield",
  "brilliant-diamond-shining-pearl": "Brilliant Diamond / Shining Pearl",
  "legends-arceus": "Legends: Arceus",
  "scarlet-violet": "Scarlet / Violet",
  "isle-of-armor": "Isle Of Armor DLC",
  "crown-tundra": "Crown Tundra DLC",
  "teal-mask": "Teal Mask DLC",
  "indigo-disk": "Indigo Disk DLC",
  "legends-z-a": "Legends: Z-A",
  "mega-dimension": "Mega Dimension DLC",
  "dynamax-adventure": "Dynamax Adventure"
};

const isleOfArmorDLC = new Set([79,80,199,427,428,440,113,242,174,39,40,824,825,826,753,754,840,841,842,661,662,663,403,404,405,707,624,625,63,64,65,280,281,282,475,98,99,72,73,129,130,223,224,458,226,278,279,451,452,206,626,108,463,833,834,194,195,704,705,706,621,616,617,588,589,1,2,3,7,8,9,543,544,545,590,591,764,114,465,453,454,172,25,26,570,571,765,766,341,342,845,118,119,846,847,120,121,891,892,587,702,877,81,82,462,686,687,746,318,319,506,507,508,128,241,123,212,127,214,557,558,767,768,871,747,748,852,853,90,91,769,770,425,426,339,340,298,183,184,60,61,62,186,54,55,293,294,295,527,528,227,524,525,526,744,745,757,758,559,560,619,620,782,783,784]);
const crownTundraDLC = new Set([872,873,220,221,473,439,122,866,238,124,239,125,466,240,126,467,531,582,583,584,361,362,478,615,459,460,708,709,333,334,859,860,861,857,858,173,35,36,778,442,339,340,129,130,550,29,30,31,32,33,34,134,135,136,471,470,700,696,697,698,699,436,437,874,875,595,596,850,851,632,631,554,555,359,878,879,885,886,887,371,372,373,443,444,445,621,225,138,139,140,141,142,703,374,375,376,854,855,447,448,633,634,635,246,247,248,712,713,41,42,169,564,565,566,567,343,344,622,623,835,836,877,871,363,364,365,781,829,830,547,876,446,303,837,838,839,345,346,347,348,369,349,350,131,304,305,306,147,148,149,377,378,379,894,895,144,145,146,205,206,207,896,897,898]);
const tealMaskDLC = new Set([167,168,193,469,195,261,262,313,314,341,342,540,541,542,742,743,23,24,69,70,71,161,162,1011,37,38,60,61,62,186,163,164,190,424,220,221,473,273,274,275,708,709,1012,1013,74,75,76,532,533,534,877,446,143,270,271,272,299,476,736,737,738,27,28,207,472,629,630,782,783,784,109,110,619,620,355,356,477,433,358,218,219,607,608,609,173,35,36,349,350,703,580,581,845,902,901,1014,1015,1016,1017]);
const indigoDiskDLC = new Set([84,85,102,103,111,112,464,239,125,466,240,126,467,900,522,523,629,630,235,868,869,328,329,330,731,732,733,72,73,116,117,230,546,547,764,43,44,45,182,170,171,686,687,751,752,236,106,107,237,74,75,76,529,530,677,678,774,408,409,410,411,572,573,227,311,312,559,560,622,623,137,233,474,595,596,374,375,376,86,87,131,904,577,578,579,209,210,27,28,37,38,884,1018,1019,1,2,3,4,5,6,7,8,9,152,153,154,155,156,157,158,159,160,252,253,254,255,256,257,258,259,260,387,388,389,390,391,392,393,394,395,495,496,497,498,499,500,501,502,503,650,651,652,653,654,655,656,657,658,722,723,724,725,726,727,728,729,730,810,811,812,813,814,815,816,817,818,1020,1021,1023,1022,1024,1009,1010,1025]);
const dynamaxFinalBoss = new Set([144,145,146,150,243,244,245,249,250,380,381,382,383,384,480,481,482,483,484,485,487,488,641,642,643,644,645,646,716,717,718,785,786,787,788,791,792,793,794,795,796,797,798,799,800,805,806]);
const legendsZA = new Set([152,153,154,498,499,500,158,159,160,661,662,663,659,660,664,665,666,13,14,15,16,17,18,179,180,181,504,505,406,315,407,129,130,688,689,120,121,669,670,671,672,673,677,678,667,668,674,675,568,569,702,172,25,26,173,35,36,167,168,23,24,63,64,65,92,93,94,543,544,545,679,680,681,69,70,71,511,512,513,514,515,516,307,308,309,310,280,281,282,475,228,229,333,334,531,682,683,684,685,133,134,135,136,196,197,470,471,700,427,428,353,354,582,583,584,322,323,449,450,529,530,551,552,553,66,67,68,443,444,445,703,302,303,359,447,448,79,80,199,318,319,602,603,604,147,148,149,1,2,3,4,5,6,7,8,9,618,676,686,687,690,691,692,693,704,705,706,225,361,362,478,459,460,712,713,123,212,127,214,587,701,708,709,559,560,714,715,707,607,608,609,142,696,697,698,699,95,208,304,305,306,694,695,710,711,246,247,248,656,657,658,870,650,651,652,227,653,654,655,371,372,373,115,780,374,375,376,716,717,718,719,150]);
const megaDimensionDLC = new Set([56,57,979,52,53,863,83,865,104,105,137,233,474,850,851,957,958,959,967,969,970,479,971,972,769,770,352,973,615,1008,978,996,997,998,999,1000,211,904,252,253,254,255,256,257,258,259,260,349,350,433,358,876,509,510,517,518,538,539,562,563,867,767,768,827,828,852,853,778,900,877,622,623,821,822,823,174,39,40,926,927,396,397,398,325,326,931,739,740,932,933,934,316,317,41,42,169,935,936,937,942,943,848,849,944,945,335,336,439,122,866,590,591,485,721,638,639,640,651,648,649,720,802,808,809,491,380,381,382,383,384,801,807]);

async function getGamesForPokemon(id) {
  if (gameAvailabilityCache.has(id)) return gameAvailabilityCache.get(id);
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();
  const gamesSet = new Set();
  data.moves.forEach(move => {
    move.version_group_details.forEach(detail => {
      const vgName = detail.version_group.name;
      if (switchGameMap[vgName]) gamesSet.add(vgName);
    });
  });
  if (isleOfArmorDLC.has(id)) { gamesSet.add("isle-of-armor"); gamesSet.delete("sword-shield"); }
  if (crownTundraDLC.has(id)) { gamesSet.add("crown-tundra"); gamesSet.delete("sword-shield"); }
  if (tealMaskDLC.has(id)) { gamesSet.add("teal-mask"); gamesSet.delete("scarlet-violet"); }
  if (indigoDiskDLC.has(id)) { gamesSet.add("indigo-disk"); gamesSet.delete("scarlet-violet"); }
  if (dynamaxFinalBoss.has(id)) { gamesSet.add("dynamax-adventure"); gamesSet.delete("sword-shield"); }
  if (legendsZA.has(id)) gamesSet.add("legends-z-a");
  if (megaDimensionDLC.has(id)) gamesSet.add("mega-dimension");
  gameAvailabilityCache.set(id, gamesSet);
  return gamesSet;
}

// ===================== FIREBASE (YOUR REAL CONFIG) =====================
const firebaseConfig = {
  apiKey: "AIzaSyBmWidiv1M6OPTCuYoSbt8dtQvp0YZTNf4",
  authDomain: "living-dex-v2.firebaseapp.com",
  projectId: "living-dex-v2",
  storageBucket: "living-dex-v2.firebasestorage.app",
  messagingSenderId: "734882304238",
  appId: "1:734882304238:web:ac7da357e16fcc85fa63ff",
  measurementId: "G-L3D7DZXME1"
};

function initFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  auth = firebase.auth();
  db = firebase.firestore();

  auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    if (user) {
      document.getElementById("logged-in-view").classList.remove("hidden");
      document.getElementById("login-view").classList.add("hidden");
      document.getElementById("display-email").textContent = user.email;
      await loadUserDataFromCloud();
    } else {
      document.getElementById("logged-in-view").classList.add("hidden");
      document.getElementById("login-view").classList.remove("hidden");
    }
  });
}

async function loadUserDataFromCloud() {
  if (!currentUser) return;
  const docRef = db.collection("users").doc(currentUser.uid);
  const doc = await docRef.get();
  if (doc.exists) {
    const data = doc.data();
    caught = new Set(data.caught || []);
    localStorage.setItem("quickNotes", data.notes || "");
    renderGrid();
    renderCompletionBars();
    updateTotalProgress();
  } else {
    await saveUserDataToCloud();
  }
}

async function saveUserDataToCloud() {
  if (!currentUser) return;
  const docRef = db.collection("users").doc(currentUser.uid);
  await docRef.set({
    caught: [...caught],
    notes: localStorage.getItem("quickNotes") || "",
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

async function preloadAllAssets() {
  const loading = document.getElementById("loading");
  const pokeball = document.getElementById("pokeball");
  const skipBtn = document.getElementById("skip-loading");

  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
  const data = await res.json();
  allPokemon = data.results.map((p, i) => ({
    id: i + 1,
    name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i+1}.png`,
    shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${i+1}.png`
  }));

  console.log("Preloading game availability for all 1025 Pokémon...");
  await Promise.all(allPokemon.map(p => getGamesForPokemon(p.id)));
  console.log("Game data ready!");

  const preloadPromises = allPokemon.flatMap(p => [
    new Promise(r => { const img = new Image(); img.src = p.sprite; img.onload = r; img.onerror = r; }),
    new Promise(r => { const img = new Image(); img.src = p.shiny; img.onload = r; img.onerror = r; })
  ]);

  setTimeout(() => {
    pokeball.classList.add("shaking");
    pokeball.style.animation = "shake 0.6s 3";
  }, 800);

  await Promise.all([
    new Promise(r => setTimeout(r, 5000)),
    Promise.all(preloadPromises)
  ]);

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

  // Quick Notes
  const notesTextarea = document.getElementById("quick-notes");
  const savedIndicator = document.getElementById("notes-saved");
  if (notesTextarea) {
    const savedNotes = localStorage.getItem("quickNotes") || "";
    notesTextarea.value = savedNotes;
    let timeout;
    notesTextarea.addEventListener("input", () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.setItem("quickNotes", notesTextarea.value);
        if (currentUser) saveUserDataToCloud();
        savedIndicator.classList.add("show");
        setTimeout(() => savedIndicator.classList.remove("show"), 1200);
      }, 500);
    });
    document.getElementById("clear-notes").addEventListener("click", () => {
      if (confirm("Clear all quick notes?")) {
        notesTextarea.value = "";
        localStorage.removeItem("quickNotes");
        if (currentUser) saveUserDataToCloud();
        savedIndicator.classList.add("show");
        setTimeout(() => savedIndicator.classList.remove("show"), 1200);
      }
    });
  }

  // Resizable Tools Menu
  const toolsMenu = document.getElementById("tools-menu");
  const resizeHandle = document.getElementById("resize-handle");
  if (toolsMenu && resizeHandle) {
    let isResizing = false;
    let startX, startWidth;
    const resetToolsWidth = () => {
      toolsMenu.style.width = "360px";
      localStorage.removeItem("toolsWidth");
    };
    resetToolsWidth();
    resizeHandle.addEventListener("mousedown", (e) => {
      isResizing = true;
      startX = e.pageX;
      startWidth = toolsMenu.offsetWidth;
      toolsMenu.style.transition = "none";
      document.body.style.cursor = "col-resize";
    });
    document.addEventListener("mousemove", (e) => {
      if (!isResizing) return;
      const newWidth = startWidth + (startX - e.pageX);
      const minW = 360;
      const maxW = 720;
      if (newWidth >= minW && newWidth <= maxW) {
        toolsMenu.style.width = newWidth + "px";
      }
    });
    document.addEventListener("mouseup", () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = "default";
        toolsMenu.style.transition = "width 0.1s ease";
      }
    });
    const closeToolsBtn = document.getElementById("close-tools");
    if (closeToolsBtn) {
      closeToolsBtn.addEventListener("click", () => {
        toolsMenu.classList.remove("open");
        resetToolsWidth();
      });
    }
  }

  // EXP Calculator (unchanged)
  const expSearch = document.getElementById("exp-search");
  const datalist = document.getElementById("exp-pokemon-list");
  const calculatorDiv = document.getElementById("exp-calculator");
  const pokemonNameEl = document.getElementById("exp-pokemon-name");
  const groupEl = document.getElementById("exp-group");
  const levelSlider = document.getElementById("current-level");
  const levelValue = document.getElementById("level-value");
  const resultsDiv = document.getElementById("exp-results");
  const candyDiv = document.getElementById("candy-breakdown");

  allPokemon.forEach(p => {
    const option = document.createElement("option");
    option.value = `#${p.id.toString().padStart(4,"0")} ${p.name}`;
    datalist.appendChild(option);
  });

  const candyValues = { xs: 100, s: 800, m: 3000, l: 10000, xl: 30000 };
  const candyNames = ["xl", "l", "m", "s", "xs"];

  function calculateCandies(totalExp) {
    let remaining = totalExp;
    const counts = {};
    candyNames.forEach(size => {
      const expPer = candyValues[size];
      counts[size] = Math.floor(remaining / expPer);
      remaining %= expPer;
    });
    return counts;
  }

  function getCumulativeExp(level, growthRate) {
    level = Math.max(1, Math.min(100, level));
    const n = level;
    switch (growthRate) {
      case "fast": return Math.floor(0.8 * n * n * n);
      case "medium-fast":
      case "medium": return Math.floor(n * n * n);
      case "medium-slow": return Math.floor(1.25 * n * n * n - 30 * n * n + 300 * n);
      case "slow": return Math.floor(1.25 * n * n * n);
      case "erratic":
        if (n < 50) return Math.floor(n * n * n * (100 - n) / 50);
        else if (n < 68) return Math.floor(n * n * n * (150 - n) / 100);
        else if (n < 80) return Math.floor(n * n * n * (200 - n) / 150);
        else return Math.floor(n * n * n * (250 - n) / 200);
      case "fluctuating":
        if (n < 15) return Math.floor(n * n * n * (24 + n) / 50);
        else if (n < 30) return Math.floor(n * n * n * (36 + n) / 50);
        else if (n < 50) return Math.floor(n * n * n * (48 + n) / 50);
        else if (n < 70) return Math.floor(n * n * n * (60 + n) / 50);
        else return Math.floor(n * n * n * (72 + n) / 50);
      default: return 0;
    }
  }

  let currentGrowthRate = null;
  let nextEvoLevel = null;

  expSearch.addEventListener("input", async () => {
    const term = expSearch.value.trim().toLowerCase();
    if (!term) {
      calculatorDiv.style.display = "none";
      currentGrowthRate = null;
      nextEvoLevel = null;
      return;
    }
    const selected = allPokemon.find(p =>
      `#${p.id.toString().padStart(4,"0")} ${p.name.toLowerCase()}` === term ||
      p.name.toLowerCase() === term
    );
    if (!selected) return;
    calculatorDiv.style.display = "block";
    pokemonNameEl.textContent = `#${selected.id} ${selected.name}`;
    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${selected.id}`);
    const species = await speciesRes.json();
    currentGrowthRate = species.growth_rate.name;
    groupEl.textContent = currentGrowthRate.replace(/-/g, " ").toUpperCase();
    nextEvoLevel = null;
    if (species.evolution_chain) {
      const chainRes = await fetch(species.evolution_chain.url);
      const chain = await chainRes.json();
      let node = chain.chain;
      while (node) {
        if (node.species.name === selected.name.toLowerCase() && node.evolves_to && node.evolves_to.length > 0) {
          const evoDetail = node.evolves_to[0].evolution_details[0];
          if (evoDetail && evoDetail.min_level) nextEvoLevel = evoDetail.min_level;
          break;
        }
        node = node.evolves_to && node.evolves_to.length ? node.evolves_to[0] : null;
      }
    }
    updateExpDisplay();
  });

  function updateExpDisplay() {
    if (!currentGrowthRate) return;
    const currentLevel = parseInt(levelSlider.value);
    const expAtCurrent = getCumulativeExp(currentLevel, currentGrowthRate);
    const expAtNext = getCumulativeExp(currentLevel + 1, currentGrowthRate);
    const expToNextLevel = Math.max(0, expAtNext - expAtCurrent);
    const expTo100 = Math.max(0, getCumulativeExp(100, currentGrowthRate) - expAtCurrent);
    let expToEvoText = "N/A (no level evolution)";
    let expToEvo = 0;
    if (nextEvoLevel && nextEvoLevel > currentLevel) {
      const expAtEvo = getCumulativeExp(nextEvoLevel, currentGrowthRate);
      expToEvo = Math.max(0, expAtEvo - expAtCurrent);
      expToEvoText = expToEvo.toLocaleString();
    } else if (nextEvoLevel && nextEvoLevel <= currentLevel) {
      expToEvoText = "Already evolved";
    }
    resultsDiv.innerHTML = `
      <p><strong>EXP to next level:</strong> <span style="color:#22c55e;">${expToNextLevel.toLocaleString()}</span></p>
      <p><strong>EXP until next evolution:</strong> <span style="color:#eab308;">${expToEvoText}</span></p>
      <p><strong>EXP until level 100:</strong> <span style="color:#a78bfa;">${expTo100.toLocaleString()}</span></p>
    `;
    candyDiv.innerHTML = `
      <div class="candy-row"><strong>Next Level</strong><br>${formatCandy(calculateCandies(expToNextLevel))}</div>
      <div class="candy-row"><strong>Next Evolution</strong><br>${expToEvo > 0 ? formatCandy(calculateCandies(expToEvo)) : "N/A"}</div>
      <div class="candy-row"><strong>Level 100</strong><br>${formatCandy(calculateCandies(expTo100))}</div>
    `;
  }

  function formatCandy(counts) {
    return Object.entries(counts)
      .filter(([_, v]) => v > 0)
      .map(([size, count]) => `${count} ${size.toUpperCase()}`)
      .join(" + ") || "0";
  }

  levelSlider.addEventListener("input", () => {
    levelValue.textContent = levelSlider.value;
    if (calculatorDiv.style.display === "block") updateExpDisplay();
  });
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

    if (currentHighlightedGame && !isCaught) {
      const gamesSet = gameAvailabilityCache.get(p.id);
      if (gamesSet && gamesSet.has(currentHighlightedGame)) {
        card.classList.add("game-highlight");
      }
    }

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
  if (!gensDiv) return;
  gensDiv.innerHTML = "";
  const colors = ["#ef4036","#f4a261","#f2c94c","#7ed321","#4a90e2","#9b59b6","#e74c3c","#f1c40f","#8e44ad"];
  genRanges.forEach(g => {
    const genCaught = [...caught].filter(id => id >= g.start && id <= g.end).length;
    const total = g.end - g.start + 1;
    const percent = Math.round((genCaught / total) * 100);
    const div = document.createElement("div");
    div.className = "completion-bar";
    if (percent === 100) div.classList.add("complete");
    div.innerHTML = `
      <span>Gen ${g.gen}</span>
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width: ${percent}%; background-color: ${colors[g.gen-1]};"></div>
      </div>
      <span>${genCaught}/${total} — ${percent}%</span>
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
  const gamesDiv = document.getElementById("modal-games");

  typesDiv.innerHTML = "<strong>Types:</strong><br>";
  evoDiv.innerHTML = "";
  gamesDiv.innerHTML = "<strong>Switch Games:</strong><br>";

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

  // Switch Games
  const gamesSet = new Set();
  data.moves.forEach(move => {
    move.version_group_details.forEach(detail => {
      const vgName = detail.version_group.name;
      if (switchGameMap[vgName]) gamesSet.add(vgName);
    });
  });

  if (isleOfArmorDLC.has(p.id)) { gamesSet.add("isle-of-armor"); gamesSet.delete("sword-shield"); }
  if (crownTundraDLC.has(p.id)) { gamesSet.add("crown-tundra"); gamesSet.delete("sword-shield"); }
  if (tealMaskDLC.has(p.id)) { gamesSet.add("teal-mask"); gamesSet.delete("scarlet-violet"); }
  if (indigoDiskDLC.has(p.id)) { gamesSet.add("indigo-disk"); gamesSet.delete("scarlet-violet"); }
  if (dynamaxFinalBoss.has(p.id)) { gamesSet.add("dynamax-adventure"); gamesSet.delete("sword-shield"); }
  if (legendsZA.has(p.id)) gamesSet.add("legends-z-a");
  if (megaDimensionDLC.has(p.id)) gamesSet.add("mega-dimension");

  const order = ["lets-go-pikachu-lets-go-eevee", "sword-shield", "isle-of-armor", "crown-tundra", "dynamax-adventure", "brilliant-diamond-shining-pearl", "legends-arceus", "scarlet-violet", "teal-mask", "indigo-disk", "legends-z-a", "mega-dimension"];
  order.forEach(key => {
    if (gamesSet.has(key)) {
      const badge = document.createElement("span");
      badge.className = "game-badge";
      badge.textContent = switchGameMap[key];
      if (key === "lets-go-pikachu-lets-go-eevee") {
        badge.style.background = "linear-gradient(90deg, #fefce8, #facc15)";
        badge.style.color = "#1e2937";
      } else if (key === "sword-shield") badge.style.background = "linear-gradient(90deg, #3b82f6, #1e40af)";
      else if (key === "brilliant-diamond-shining-pearl") badge.style.background = "linear-gradient(90deg, #a5b4fc, #6366f1)";
      else if (key === "legends-arceus") badge.style.background = "linear-gradient(90deg, #c084fc, #a855f7)";
      else if (key === "scarlet-violet") badge.style.background = "linear-gradient(90deg, #f43f5e, #9f1239)";
      else if (key === "legends-z-a") badge.style.background = "linear-gradient(90deg, #4ade80, #15803d)";
      else if (["dynamax-adventure","mega-dimension","isle-of-armor","crown-tundra","teal-mask","indigo-disk"].includes(key)) {
        badge.style.background = "linear-gradient(90deg, #f59e0b, #d97706)";
      }
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

  modal.style.maxHeight = "95vh";
  modal.style.overflowY = "auto";
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
  if (currentUser) saveUserDataToCloud();
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
    fillEl.classList.add("complete");
    setTimeout(() => fillEl.classList.remove("complete"), 1500);
  } else if (fillEl) {
    fillEl.classList.remove("complete");
  }
}

function renderGameSwitches() {
  const container = document.getElementById("game-switches");
  container.innerHTML = "";
  Object.entries(switchGameMap).forEach(([key, name]) => {
    const row = document.createElement("div");
    row.className = "game-switch-row";
    row.innerHTML = `
      <label>${name}</label>
      <label class="switch">
        <input type="checkbox" id="game-toggle-${key}">
        <span class="slider"></span>
      </label>
    `;
    container.appendChild(row);
    const checkbox = row.querySelector(`#game-toggle-${key}`);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        document.querySelectorAll("#game-switches input[type=checkbox]").forEach(cb => {
          if (cb !== checkbox) cb.checked = false;
        });
        currentHighlightedGame = key;
      } else {
        currentHighlightedGame = null;
      }
      renderGrid(document.getElementById("search-bar").value);
    });
  });
}

function clearGameHighlight() {
  currentHighlightedGame = null;
  document.querySelectorAll("#game-switches input[type=checkbox]").forEach(cb => cb.checked = false);
  renderGrid(document.getElementById("search-bar").value);
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

  // Game highlight setup
  renderGameSwitches();
  document.getElementById("clear-game-highlight").addEventListener("click", clearGameHighlight);

  /* ===================== TOOLS MENU TOGGLE + HIDE SETTINGS BUTTON ===================== */
  const toolsBtn = document.getElementById("tools-btn");
  const toolsMenu = document.getElementById("tools-menu");
  const closeTools = document.getElementById("close-tools");
  const settingsBtn = document.getElementById("settings-btn");   // ← declared ONLY ONCE here

  toolsBtn.addEventListener("click", () => {
    toolsMenu.classList.toggle("open");
    settingsBtn.style.display = toolsMenu.classList.contains("open") ? "none" : "block";
  });

  closeTools.addEventListener("click", () => {
    toolsMenu.classList.remove("open");
    settingsBtn.style.display = "block";
  });

  // SETTINGS OVERLAY
  const overlay = document.getElementById("settings-overlay");
  const closeBtn = document.getElementById("close-settings");
  settingsBtn.addEventListener("click", () => overlay.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => overlay.classList.add("hidden"));

  // Dark toggle (in settings)
  const darkToggle = document.getElementById("dark-toggle-settings");
  darkToggle.checked = document.documentElement.getAttribute("data-theme") === "dark";
  darkToggle.addEventListener("change", () => {
    const newTheme = darkToggle.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  // Auth buttons
  document.getElementById("login-btn").addEventListener("click", async () => {
    const email = document.getElementById("email-input").value.trim();
    const pass = document.getElementById("password-input").value;
    try {
      await auth.signInWithEmailAndPassword(email, pass);
      document.getElementById("auth-message").style.color = "#22c55e";
      document.getElementById("auth-message").textContent = "Logged in successfully!";
    } catch (e) {
      document.getElementById("auth-message").style.color = "#ef4444";
      document.getElementById("auth-message").textContent = e.message;
    }
  });

  document.getElementById("register-btn").addEventListener("click", async () => {
    const email = document.getElementById("email-input").value.trim();
    const pass = document.getElementById("password-input").value;
    try {
      await auth.createUserWithEmailAndPassword(email, pass);
      document.getElementById("auth-message").style.color = "#22c55e";
      document.getElementById("auth-message").textContent = "Account created! You are now logged in.";
    } catch (e) {
      document.getElementById("auth-message").style.color = "#ef4444";
      document.getElementById("auth-message").textContent = e.message;
    }
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    auth.signOut();
    document.getElementById("settings-overlay").classList.add("hidden");
  });

  // Reset all (local only)
  document.getElementById("reset-all-btn").addEventListener("click", () => {
    if (confirm("Reset ALL progress locally? (Cloud data stays safe)")) {
      caught.clear();
      localStorage.removeItem("caught");
      localStorage.removeItem("quickNotes");
      renderGrid(document.getElementById("search-bar").value);
      renderCompletionBars();
      updateTotalProgress();
    }
  });
}
// ===================== OPEN LIVING DEX =====================
function openDex() {
  // Hide EVERYTHING else
  document.getElementById('home-view').style.display = 'none';
  document.getElementById('organizer-view').style.display = 'none';

  // Show Dex
  document.getElementById('dex-view').style.display = 'block';

  // Show only dex floating elements
  document.getElementById('gen-completion-container').style.display = 'block';
  document.getElementById('toggles-container').style.display = 'block';
  document.getElementById('back-to-home-fixed').style.display = 'flex';
  document.getElementById('tools-btn').style.display = 'flex';

  window.scrollTo(0, 0);
}

// ===================== OPEN POKÉMON HOME ORGANIZER =====================
function openHomeOrganizer();{
  // Hide EVERYTHING else
  document.getElementById('home-view').style.display = 'none';
  document.getElementById('dex-view').style.display = 'none';

  // Show Organizer
  document.getElementById('organizer-view').style.display = 'block';
initOrganizer()
  // Hide dex floating elements
  const floating = ['gen-completion-container', 'toggles-container', 'back-to-home-fixed', 'tools-btn'];
  floating.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  window.scrollTo(0, 0);
}

// ===================== GO HOME (forces clean return) =====================
function goHome() {
  // Hide EVERYTHING
  document.getElementById('dex-view').style.display = 'none';
  document.getElementById('organizer-view').style.display = 'none';

  // Show Home
  document.getElementById('home-view').style.display = 'block';

  // Hide all floating elements
  const floating = ['gen-completion-container', 'toggles-container', 'back-to-home-fixed', 'tools-btn'];
  floating.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  window.scrollTo(0, 0);
}
// ===================== POKÉMON HOME ORGANIZER LOGIC =====================
let currentBox = 1;
const totalBoxes = 12;                    // change this number anytime
let boxes = Array.from({ length: totalBoxes }, () => Array(30).fill(null)); // 30 empty slots per box

function renderBox() {
  const grid = document.getElementById('box-grid');
  grid.innerHTML = '';

  const currentSlots = boxes[currentBox - 1];

  for (let i = 0; i < 30; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    
    if (currentSlots[i]) {
      // Later we’ll put real Pokémon sprites here
      slot.innerHTML = `<span style="font-size:2.8rem;">${currentSlots[i]}</span>`;
    } else {
      slot.innerHTML = `<span style="opacity:0.15; font-size:3rem;">●</span>`;
    }
    
    grid.appendChild(slot);
  }
}

function updateBoxDropdown() {
  const select = document.getElementById('box-select');
  select.innerHTML = '';
  for (let i = 1; i <= totalBoxes; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `Box ${i}`;
    if (i === currentBox) option.selected = true;
    select.appendChild(option);
  }
}

function jumpToBox(boxNum) {
  currentBox = parseInt(boxNum);
  renderBox();
}

function prevBox() {
  if (currentBox > 1) {
    currentBox--;
    document.getElementById('box-select').value = currentBox;
    renderBox();
  }
}

function nextBox() {
  if (currentBox < totalBoxes) {
    currentBox++;
    document.getElementById('box-select').value = currentBox;
    renderBox();
  }
}

// Initialize when organizer opens
function initOrganizer() {
  updateBoxDropdown();
  renderBox();
}

// Make sure initOrganizer runs when organizer opens
// (add this line inside your openHomeOrganizer() function)
document.addEventListener("DOMContentLoaded", () => {
  initFirebase();
  preloadAllAssets();
});
