const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");
const hud = document.getElementById("hud");

const categorySelect = document.getElementById("categorySelect");
const modeSelect = document.getElementById("modeSelect");
const ruleCard = document.getElementById("ruleCard");
const startBtn = document.getElementById("startBtn");
const startMessage = document.getElementById("startMessage");

const board = document.getElementById("board");
const currentCategoryEl = document.getElementById("currentCategory");
const currentModeEl = document.getElementById("currentMode");
const tileStatusEl = document.getElementById("tileStatus");

const questionNoEl = document.getElementById("questionNo");
const livesEl = document.getElementById("lives");
const totalScoreEl = document.getElementById("totalScore");
const hintCountEl = document.getElementById("hintCount");

const questionScoreEl = document.getElementById("questionScore");
const scoreDetailEl = document.getElementById("scoreDetail");

const guessInput = document.getElementById("guessInput");
const suggestionsEl = document.getElementById("suggestions");
const submitBtn = document.getElementById("submitBtn");
const hintBtn = document.getElementById("hintBtn");
const hintButtonCount = document.getElementById("hintButtonCount");
const hintBox = document.getElementById("hintBox");
const hintText = document.getElementById("hintText");
const messageEl = document.getElementById("message");
const resetBtn = document.getElementById("resetBtn");

const endBadge = document.getElementById("endBadge");
const endTitle = document.getElementById("endTitle");
const endSummary = document.getElementById("endSummary");
const finalScoreEl = document.getElementById("finalScore");
const playAgainBtn = document.getElementById("playAgainBtn");
const changeCategoryBtn = document.getElementById("changeCategoryBtn");

let characters = [];
let pool = [];
let quiz = [];
let questionIndex = 0;
let lives = 5;
let correct = 0;
let totalScore = 0;
let questionScore = 100;
let hintsLeft = 4;
let usedHintIndexes = new Set();

let opened = new Set();
let selectedCharacterId = null;
let suggestionIndex = -1;
let locked = false;
let selectedCategory = "all";
let selectedMode = "easy";

const BASE_SCORE = 100;
const OPEN_PENALTY = 10;
const ONE_TILE_BONUS = 50;
const HINT_PENALTY = 20;
const WRONG_ANSWER_PENALTY = 0;
const HARD_TILE_LIMIT = 5;

function normalize(text) {
  return String(text || "")
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[._\-]/g, " ")
    .replace(/\s+/g, " ");
}

function uniqueValues(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function mergeCharacters(list) {
  const map = new Map();

  for (const c of list) {
    const key = c.id || normalize(c.name);
    const incomingImages = uniqueValues([
      ...(Array.isArray(c.images) ? c.images : []),
      c.image
    ]);

    if (!map.has(key)) {
      map.set(key, {
        ...c,
        id: key,
        aliases: uniqueValues(c.aliases || []),
        categories: uniqueValues(c.categories || (c.anime ? [c.anime] : [])),
        hints: uniqueValues(c.hints || []),
        images: incomingImages
      });
      continue;
    }

    const existing = map.get(key);
    existing.aliases = uniqueValues([...(existing.aliases || []), ...(c.aliases || [])]);
    existing.categories = uniqueValues([...(existing.categories || []), ...(c.categories || []), c.anime]);
    existing.hints = uniqueValues([...(existing.hints || []), ...(c.hints || [])]);
    existing.images = uniqueValues([...(existing.images || []), ...incomingImages]);
  }

  return [...map.values()];
}

function getArtworks(character) {
  return uniqueValues([
    ...(Array.isArray(character.images) ? character.images : []),
    character.image
  ]);
}

function pickArtwork(character) {
  const artworks = getArtworks(character);
  if (!artworks.length) return null;
  return artworks[Math.floor(Math.random() * artworks.length)];
}

async function loadCharacters() {
  try {
    const res = await fetch("./data/characters.json");
    if (!res.ok) throw new Error("โหลด characters.json ไม่สำเร็จ");
    characters = mergeCharacters(await res.json());

    if (!Array.isArray(characters) || characters.length === 0) {
      throw new Error("ฐานข้อมูลยังไม่มีตัวละคร");
    }

    buildCategories();
  } catch (err) {
    startMessage.textContent = "⚠️ " + err.message;
    startBtn.disabled = true;
    console.error(err);
  }
}

function buildCategories() {
  const categories = [...new Set(
    characters.flatMap(c => {
      if (Array.isArray(c.categories)) return c.categories;
      if (c.category) return [c.category];
      if (c.anime) return [c.anime];
      return [];
    }).filter(Boolean)
  )].sort((a,b) => a.localeCompare(b, "th"));

  categorySelect.innerHTML = `<option value="all">ทั้งหมด (${characters.length})</option>`;

  for (const cat of categories) {
    const count = characters.filter(c => getCategories(c).includes(cat)).length;
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = `${cat} (${count})`;
    categorySelect.appendChild(option);
  }
}

function getCategories(c) {
  if (Array.isArray(c.categories)) return c.categories;
  if (c.category) return [c.category];
  if (c.anime) return [c.anime];
  return [];
}

function compact(text) {
  return normalize(text).replace(/\s/g, "");
}

function fuzzyScore(query, text) {
  const q = compact(query);
  const t = compact(text);

  if (!q) return 0;
  if (q === t) return 1000;
  if (t.startsWith(q)) return 850 - (t.length - q.length);
  if (t.includes(q)) return 700 - t.indexOf(q);

  let qi = 0;
  let gaps = 0;
  let last = -1;

  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      if (last >= 0) gaps += i - last - 1;
      last = i;
      qi++;
    }
  }

  if (qi === q.length) return 450 - gaps * 8 - (t.length - q.length);
  return 0;
}

function searchableNames(c) {
  return [c.name, ...(c.aliases || [])].filter(Boolean);
}

function searchCharacters(query) {
  if (!normalize(query)) return [];

  const searchPool = selectedCategory === "all"
    ? characters
    : characters.filter(c => getCategories(c).includes(selectedCategory));

  return searchPool
    .map(c => {
      const best = Math.max(...searchableNames(c).map(name => fuzzyScore(query, name)));
      return { character: c, score: best };
    })
    .filter(x => x.score > 0)
    .sort((a,b) => b.score - a.score || a.character.name.localeCompare(b.character.name))
    .slice(0, 8)
    .map(x => x.character);
}

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function updateRuleCard() {
  const hard = modeSelect.value === "hard";
  ruleCard.innerHTML = hard
    ? `<b>Hard</b><span>เปิดได้สูงสุด 5 แผ่นต่อ 1 ตัวละคร ถ้าจะตอบต้องเปิดอย่างน้อย 1 แผ่น</span>`
    : `<b>Easy</b><span>เปิดได้เรื่อย ๆ จนกว่าจะตอบได้ แต่ทุกแผ่นที่เปิดเพิ่มจะทำให้คะแนนข้อนั้นลดลง</span>`;
}

function startGame() {
  selectedCategory = categorySelect.value;
  selectedMode = modeSelect.value;

  pool = selectedCategory === "all"
    ? [...characters]
    : characters.filter(c => getCategories(c).includes(selectedCategory));

  if (pool.length < 10) {
    startMessage.textContent = `หมวดนี้มี ${pool.length} ตัวละคร ต้องมีอย่างน้อย 10 ตัวเพื่อเริ่มเกม`;
    return;
  }

  quiz = shuffle(pool).slice(0, 10);
  questionIndex = 0;
  lives = 5;
  correct = 0;
  totalScore = 0;
  hintsLeft = 4;
  locked = false;

  startScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  hud.classList.remove("hidden");

  currentCategoryEl.textContent = selectedCategory === "all" ? "ทั้งหมด" : selectedCategory;
  currentModeEl.textContent = selectedMode.toUpperCase();

  renderHUD();
  loadQuestion();
}

function renderHUD() {
  renderLives();
  totalScoreEl.textContent = totalScore;
  hintCountEl.textContent = hintsLeft;
  hintButtonCount.textContent = hintsLeft;
}

function loadQuestion() {
  locked = false;
  opened = new Set();
  selectedCharacterId = null;
  suggestionIndex = -1;
  usedHintIndexes = new Set();
  questionScore = BASE_SCORE;

  guessInput.value = "";
  hideSuggestions();
  hintBox.classList.add("hidden");
  hintText.textContent = "";

  const current = quiz[questionIndex];

  questionNoEl.textContent = `${questionIndex + 1} / 10`;
  messageEl.textContent = "เปิดอย่างน้อย 1 แผ่นก่อนตอบ ✨";
  questionScoreEl.textContent = questionScore;
  scoreDetailEl.textContent = `ตอบถูกจากแผ่นแรก +${ONE_TILE_BONUS} Bonus`;
  hintBtn.disabled = hintsLeft <= 0;
  updateTileStatus();

  board.innerHTML = "";
  const artwork = pickArtwork(current);
  if (artwork) {
    board.style.backgroundImage = `url(${JSON.stringify(artwork)})`;
  } else {
    board.style.backgroundImage = "radial-gradient(circle at 50% 30%, #4b436f 0 18%, transparent 19%), linear-gradient(145deg, #2a3044, #111520)";
  }

  const rows = ["A","B","C","D"];
  for (let i = 0; i < 16; i++) {
    const tile = document.createElement("button");
    tile.className = "tile";
    tile.textContent = `${rows[Math.floor(i / 4)]}${(i % 4) + 1}`;
    tile.addEventListener("click", () => openTile(i, tile));
    board.appendChild(tile);
  }

  setTimeout(() => guessInput.focus(), 50);
}

function openTile(index, tile) {
  if (locked || opened.has(index)) return;

  if (selectedMode === "hard" && opened.size >= HARD_TILE_LIMIT) {
    messageEl.textContent = `⚠️ Hard Mode เปิดได้สูงสุด ${HARD_TILE_LIMIT} แผ่นต่อข้อนะ`;
    return;
  }

  opened.add(index);
  tile.classList.add("open");

  if (opened.size > 1) {
    questionScore = Math.max(0, questionScore - OPEN_PENALTY);
    questionScoreEl.textContent = questionScore;
  }

  updateTileStatus();

  if (selectedMode === "hard" && opened.size >= HARD_TILE_LIMIT) {
    document.querySelectorAll(".tile:not(.open)").forEach(t => t.classList.add("locked"));
    messageEl.textContent = `เปิดครบ ${HARD_TILE_LIMIT} แผ่นแล้ว ต้องเดาจากเท่านี้ 🔥`;
  }
}

function updateTileStatus() {
  const suffix = selectedMode === "hard"
    ? ` / ${HARD_TILE_LIMIT} แผ่น`
    : " แผ่น";
  tileStatusEl.textContent = `เปิดแล้ว ${opened.size}${suffix}`;
}

function renderLives() {
  livesEl.textContent = "❤️".repeat(lives) + "🖤".repeat(5 - lives);
}

function renderSuggestions(query) {
  const results = searchCharacters(query);
  suggestionIndex = -1;

  if (!query.trim() || results.length === 0) {
    hideSuggestions();
    return;
  }

  suggestionsEl.innerHTML = "";

  for (const c of results) {
    const btn = document.createElement("button");
    btn.className = "suggestion";
    btn.dataset.id = c.id;

    const left = document.createElement("span");

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = c.name;

    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = c.anime || getCategories(c)[0] || "";

    const cat = document.createElement("span");
    cat.className = "category";
    cat.textContent = getCategories(c)[0] || "";

    left.appendChild(name);
    left.appendChild(meta);
    btn.appendChild(left);
    btn.appendChild(cat);

    btn.addEventListener("mousedown", e => {
      e.preventDefault();
      chooseSuggestion(c);
    });

    suggestionsEl.appendChild(btn);
  }

  suggestionsEl.classList.remove("hidden");
}

function chooseSuggestion(c) {
  guessInput.value = c.name;
  selectedCharacterId = c.id;
  hideSuggestions();
  guessInput.focus();
}

function hideSuggestions() {
  suggestionsEl.classList.add("hidden");
  suggestionsEl.innerHTML = "";
  suggestionIndex = -1;
}

function getSuggestionButtons() {
  return [...suggestionsEl.querySelectorAll(".suggestion")];
}

function moveSuggestion(direction) {
  const buttons = getSuggestionButtons();
  if (!buttons.length) return;

  suggestionIndex += direction;
  if (suggestionIndex < 0) suggestionIndex = buttons.length - 1;
  if (suggestionIndex >= buttons.length) suggestionIndex = 0;

  buttons.forEach((b,i) => b.classList.toggle("active", i === suggestionIndex));
  buttons[suggestionIndex].scrollIntoView({ block: "nearest" });
}

function resolveTypedCharacter() {
  if (selectedCharacterId) {
    return characters.find(c => c.id === selectedCharacterId) || null;
  }

  const typed = normalize(guessInput.value);
  if (!typed) return null;

  return characters.find(c =>
    searchableNames(c).some(name => normalize(name) === typed)
  ) || null;
}

function submitAnswer() {
  if (locked) return;

  if (opened.size < 1) {
    messageEl.textContent = "ต้องเปิดอย่างน้อย 1 แผ่นก่อนตอบนะ 👀";
    return;
  }

  const chosen = resolveTypedCharacter();

  if (!chosen) {
    messageEl.textContent = "เลือกชื่อจาก dropdown ก่อนตอบนะ 👀";
    renderSuggestions(guessInput.value);
    return;
  }

  const current = quiz[questionIndex];

  if (chosen.id === current.id) {
    locked = true;
    correct++;

    let earned = questionScore;
    let bonus = 0;

    if (opened.size === 1) {
      bonus = ONE_TILE_BONUS;
      earned += bonus;
    }

    totalScore += earned;
    totalScoreEl.textContent = totalScore;

    revealAll();

    messageEl.textContent = bonus
      ? `🎯 ถูกต้อง! ${current.name} — ${questionScore} + โบนัส ${bonus} = ${earned} คะแนน`
      : `✅ ถูกต้อง! ${current.name} — ได้ ${earned} คะแนน`;

    setTimeout(() => {
      if (questionIndex === 9) {
        finishGame(true);
      } else {
        questionIndex++;
        loadQuestion();
      }
    }, 850);

  } else {
    lives--;
    totalScore = Math.max(0, totalScore - WRONG_ANSWER_PENALTY);
    renderHUD();

    selectedCharacterId = null;
    guessInput.value = "";
    hideSuggestions();

    messageEl.textContent = `❌ ผิด! เหลือ ${lives} ชีวิต`;

    if (lives <= 0) {
      locked = true;
      revealAll();
      setTimeout(() => finishGame(false), 700);
    } else {
      guessInput.focus();
    }
  }
}

function useHint() {
  if (locked) return;

  if (hintsLeft <= 0) {
    messageEl.textContent = "คำใบ้หมดแล้ว — ใช้ได้สูงสุด 4 ครั้งต่อเกม";
    return;
  }

  const current = quiz[questionIndex];
  let hints = Array.isArray(current.hints) ? current.hints.filter(Boolean) : [];

  if (hints.length === 0) {
    if (current.anime) hints.push(`ตัวละครนี้มาจากเรื่อง ${current.anime}`);
    const cats = getCategories(current);
    if (cats.length) hints.push(`อยู่ในหมวด ${cats[0]}`);
  }

  if (hints.length === 0) {
    messageEl.textContent = "ตัวละครนี้ยังไม่มีคำใบ้ในฐานข้อมูล";
    return;
  }

  let availableIndexes = hints.map((_, i) => i).filter(i => !usedHintIndexes.has(i));
  if (availableIndexes.length === 0) {
    availableIndexes = hints.map((_, i) => i);
  }

  const chosenIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
  usedHintIndexes.add(chosenIndex);

  hintsLeft--;
  questionScore = Math.max(0, questionScore - HINT_PENALTY);

  hintText.textContent = hints[chosenIndex];
  hintBox.classList.remove("hidden");
  questionScoreEl.textContent = questionScore;

  renderHUD();
  hintBtn.disabled = hintsLeft <= 0;
}

function revealAll() {
  document.querySelectorAll(".tile").forEach(tile => {
    tile.classList.add("open");
    tile.classList.remove("locked");
  });
}

function finishGame(completed) {
  gameScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");
  hud.classList.add("hidden");

  finalScoreEl.textContent = totalScore;

  if (completed) {
    endBadge.textContent = "CLEAR!";
    endTitle.textContent = "ผ่านครบ 10 ข้อแล้ว 🎉";
    endSummary.textContent = `ตอบถูก ${correct} / 10 ข้อ • เหลือ ${lives} ชีวิต • เหลือคำใบ้ ${hintsLeft} ครั้ง`;
  } else {
    endBadge.textContent = "GAME OVER";
    endTitle.textContent = "ชีวิตหมดแล้ว 💀";
    endSummary.textContent = `ตอบถูกไป ${correct} ข้อ • คะแนน ${totalScore} • ต้องเริ่มเกมใหม่ตั้งแต่ข้อ 1`;
  }
}

modeSelect.addEventListener("change", updateRuleCard);

guessInput.addEventListener("input", () => {
  selectedCharacterId = null;
  renderSuggestions(guessInput.value);
});

guessInput.addEventListener("keydown", e => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    moveSuggestion(1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    moveSuggestion(-1);
  } else if (e.key === "Enter") {
    const buttons = getSuggestionButtons();

    if (!suggestionsEl.classList.contains("hidden") &&
        suggestionIndex >= 0 &&
        buttons[suggestionIndex]) {
      e.preventDefault();
      const c = characters.find(x => x.id === buttons[suggestionIndex].dataset.id);
      if (c) chooseSuggestion(c);
    } else {
      e.preventDefault();
      submitAnswer();
    }
  } else if (e.key === "Escape") {
    hideSuggestions();
  }
});

document.addEventListener("click", e => {
  if (!e.target.closest(".search-box")) hideSuggestions();
});

startBtn.addEventListener("click", startGame);
submitBtn.addEventListener("click", submitAnswer);
hintBtn.addEventListener("click", useHint);

resetBtn.addEventListener("click", () => {
  startScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  hud.classList.add("hidden");
  startMessage.textContent = "";
});

playAgainBtn.addEventListener("click", startGame);

changeCategoryBtn.addEventListener("click", () => {
  endScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  startMessage.textContent = "";
});

updateRuleCard();
loadCharacters();
