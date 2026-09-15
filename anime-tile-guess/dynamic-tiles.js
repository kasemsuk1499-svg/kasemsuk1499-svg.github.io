// Adaptive board sizing based on the real artwork ratio.
// Broken/missing artwork files are skipped automatically.
(function () {
  const EASY_GRID = { target: 16, min: 15, max: 20, minAxis: 3, maxAxis: 6 };
  const HARD_GRID = { target: 28, min: 24, max: 30, minAxis: 4, maxAxis: 7 };
  const HARD_REVEAL_RATIO = 0.24;

  let adaptiveRows = 4;
  let adaptiveCols = 4;
  let adaptiveTileCount = 16;
  let adaptiveHardLimit = 5;
  let loadToken = 0;

  const artworkCheckCache = new Map();

  function artworkSource(artwork) {
    if (typeof artwork === "string") return artwork;
    if (!artwork || typeof artwork !== "object") return null;
    return artwork.src || artwork.image || artwork.url || null;
  }

  function shuffled(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getArtworkList(character) {
    const list = typeof getArtworks === "function"
      ? getArtworks(character)
      : [
          ...(Array.isArray(character?.images) ? character.images : []),
          character?.image
        ].filter(Boolean);

    return shuffled(list);
  }

  function checkImage(src) {
    if (artworkCheckCache.has(src)) {
      return Promise.resolve(artworkCheckCache.get(src));
    }

    return new Promise(resolve => {
      const img = new Image();

      img.onload = () => {
        const width = img.naturalWidth || 0;
        const height = img.naturalHeight || 0;
        const result = width > 0 && height > 0
          ? { ok: true, src, width, height }
          : { ok: false, src };

        artworkCheckCache.set(src, result);
        resolve(result);
      };

      img.onerror = () => {
        const result = { ok: false, src };
        artworkCheckCache.set(src, result);
        resolve(result);
      };

      img.src = src;
    });
  }

  async function findUsableArtwork(character) {
    const artworks = getArtworkList(character);

    for (const artwork of artworks) {
      const src = artworkSource(artwork);
      if (!src) continue;

      const checked = await checkImage(src);
      if (checked.ok) return checked;
    }

    return null;
  }

  function currentGridConfig() {
    return selectedMode === "hard" ? HARD_GRID : EASY_GRID;
  }

  function calculateGrid(width, height) {
    const cfg = currentGridConfig();
    const ratio = Math.max(0.2, Math.min(5, width / Math.max(1, height)));
    let best = null;

    for (let cols = cfg.minAxis; cols <= cfg.maxAxis; cols++) {
      for (let rows = cfg.minAxis; rows <= cfg.maxAxis; rows++) {
        const total = cols * rows;
        if (total < cfg.min || total > cfg.max) continue;

        const tileAspect = ratio * rows / cols;
        const shapePenalty = Math.abs(Math.log(tileAspect)) * 2;
        const countPenalty = Math.abs(total - cfg.target) / cfg.target * 0.25;
        const score = shapePenalty + countPenalty;

        if (!best || score < best.score) {
          best = { rows, cols, total, score };
        }
      }
    }

    return best || (selectedMode === "hard"
      ? { rows: 5, cols: 5, total: 25 }
      : { rows: 4, cols: 4, total: 16 });
  }

  function calculateHardLimit(total) {
    return Math.max(4, Math.ceil(total * HARD_REVEAL_RATIO));
  }

  function configureBoard(width, height) {
    const grid = calculateGrid(width, height);
    adaptiveRows = grid.rows;
    adaptiveCols = grid.cols;
    adaptiveTileCount = grid.total;
    adaptiveHardLimit = calculateHardLimit(adaptiveTileCount);

    const ratio = width / Math.max(1, height);

    board.style.gridTemplateColumns = `repeat(${adaptiveCols}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${adaptiveRows}, 1fr)`;
    board.style.aspectRatio = `${width} / ${height}`;
    board.style.backgroundPosition = "center center";
    board.style.backgroundSize = "cover";
    board.style.backgroundRepeat = "no-repeat";
    board.style.marginInline = "auto";

    const viewportWidthCap = Math.max(34, Math.min(100, Math.round(74 * ratio)));
    board.style.maxWidth = `min(100%, ${viewportWidthCap}vh)`;
  }

  function buildTiles() {
    board.innerHTML = "";
    for (let row = 0; row < adaptiveRows; row++) {
      for (let col = 0; col < adaptiveCols; col++) {
        const index = row * adaptiveCols + col;
        const tile = document.createElement("button");
        tile.className = "tile";
        tile.textContent = `${String.fromCharCode(65 + row)}${col + 1}`;
        tile.addEventListener("click", () => openTile(index, tile));
        board.appendChild(tile);
      }
    }
  }

  updateRuleCard = function adaptiveRuleCard() {
    const hard = modeSelect.value === "hard";
    ruleCard.innerHTML = hard
      ? `<b>Hard</b><span>กระดานละเอียดขึ้นประมาณ 24–30 ช่อง และเปิดได้ราว ${Math.round(HARD_REVEAL_RATIO * 100)}% ของช่องทั้งหมด</span>`
      : `<b>Easy</b><span>จำนวนช่องคำนวณจากสัดส่วนภาพประมาณ 15–20 ช่อง เปิดได้เรื่อย ๆ แต่เปิดเพิ่มแล้วคะแนนลด</span>`;
  };

  loadQuestion = async function adaptiveLoadQuestion() {
    const token = ++loadToken;

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
    if (!current) return;

    questionNoEl.textContent = (typeof gameLengthMode !== "undefined" && gameLengthMode === "endless")
      ? `${endlessQuestionNumber} / ∞`
      : `${questionIndex + 1} / 10`;

    messageEl.textContent = "กำลังตรวจรูปและคำนวณกระดาน...";
    questionScoreEl.textContent = questionScore;
    scoreDetailEl.textContent = `ตอบถูกจากแผ่นแรก +${ONE_TILE_BONUS} Bonus`;
    hintBtn.disabled = hintsLeft <= 0;

    board.innerHTML = "";
    board.style.backgroundPosition = "center center";
    board.style.backgroundRepeat = "no-repeat";

    const usable = await findUsableArtwork(current);
    if (token !== loadToken) return;

    if (usable) {
      configureBoard(usable.width, usable.height);
      board.style.backgroundImage = `url(${JSON.stringify(usable.src)})`;
    } else {
      configureBoard(1, 1);
      board.style.backgroundImage = "radial-gradient(circle at 50% 50%, #4b436f 0 18%, transparent 19%), linear-gradient(145deg, #2a3044, #111520)";
    }

    buildTiles();
    updateTileStatus();
    messageEl.textContent = usable
      ? "เปิดอย่างน้อย 1 แผ่นก่อนตอบ ✨"
      : "⚠️ ตัวละครนี้ยังไม่มีรูปที่โหลดได้ — ใช้ภาพสำรองชั่วคราว";

    setTimeout(() => guessInput.focus(), 50);
  };

  openTile = function adaptiveOpenTile(index, tile) {
    if (locked || opened.has(index)) return;

    if (selectedMode === "hard" && opened.size >= adaptiveHardLimit) {
      messageEl.textContent = `⚠️ Hard Mode ภาพนี้เปิดได้สูงสุด ${adaptiveHardLimit} จาก ${adaptiveTileCount} แผ่น`;
      return;
    }

    opened.add(index);
    tile.classList.add("open");

    if (opened.size > 1) {
      questionScore = Math.max(0, questionScore - OPEN_PENALTY);
      questionScoreEl.textContent = questionScore;
    }

    updateTileStatus();

    if (selectedMode === "hard" && opened.size >= adaptiveHardLimit) {
      document.querySelectorAll(".tile:not(.open)").forEach(t => t.classList.add("locked"));
      messageEl.textContent = `เปิดครบ ${adaptiveHardLimit}/${adaptiveTileCount} แผ่นแล้ว ต้องเดาจากเท่านี้ 🔥`;
    }
  };

  updateTileStatus = function adaptiveTileStatus() {
    const gridText = `${adaptiveCols}×${adaptiveRows} = ${adaptiveTileCount} ช่อง`;
    tileStatusEl.textContent = selectedMode === "hard"
      ? `กระดาน ${gridText} • เปิด ${opened.size}/${adaptiveHardLimit}`
      : `กระดาน ${gridText} • เปิดแล้ว ${opened.size} แผ่น`;
  };

  updateRuleCard();
})();
