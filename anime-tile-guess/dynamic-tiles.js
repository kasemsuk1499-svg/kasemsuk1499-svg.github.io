// Adaptive board sizing and tile calculation based on the real artwork ratio.
// This intentionally does NOT use face focus. The whole board follows the image aspect ratio.
(function () {
  const TARGET_TILE_COUNT = 16;
  const MIN_TILE_COUNT = 15;
  const MAX_TILE_COUNT = 20;
  const MIN_AXIS = 3;
  const MAX_AXIS = 6;
  const HARD_REVEAL_RATIO = 0.30;

  let adaptiveRows = 4;
  let adaptiveCols = 4;
  let adaptiveTileCount = 16;
  let adaptiveHardLimit = 5;
  let loadToken = 0;

  function artworkSource(artwork) {
    if (typeof artwork === "string") return artwork;
    if (!artwork || typeof artwork !== "object") return null;
    return artwork.src || artwork.image || artwork.url || null;
  }

  function chooseArtwork(character) {
    const list = typeof getArtworks === "function"
      ? getArtworks(character)
      : [
          ...(Array.isArray(character?.images) ? character.images : []),
          character?.image
        ].filter(Boolean);

    if (!list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  function readImageSize(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve({
        width: img.naturalWidth || 1,
        height: img.naturalHeight || 1
      });
      img.onerror = () => resolve({ width: 1, height: 1 });
      img.src = src;
    });
  }

  function calculateGrid(width, height) {
    const ratio = Math.max(0.2, Math.min(5, width / Math.max(1, height)));
    let best = null;

    for (let cols = MIN_AXIS; cols <= MAX_AXIS; cols++) {
      for (let rows = MIN_AXIS; rows <= MAX_AXIS; rows++) {
        const total = cols * rows;
        if (total < MIN_TILE_COUNT || total > MAX_TILE_COUNT) continue;

        // A tile is nicest when it is close to square in the original image space.
        const tileAspect = ratio * rows / cols;
        const shapePenalty = Math.abs(Math.log(tileAspect)) * 2;
        const countPenalty = Math.abs(total - TARGET_TILE_COUNT) / TARGET_TILE_COUNT * 0.25;
        const score = shapePenalty + countPenalty;

        if (!best || score < best.score) {
          best = { rows, cols, total, score };
        }
      }
    }

    return best || { rows: 4, cols: 4, total: 16 };
  }

  function calculateHardLimit(total) {
    // Hard mode reveals about 30% of the board, scaled to the board size.
    return Math.max(3, Math.ceil(total * HARD_REVEAL_RATIO));
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

    // Keep very tall images from making the page excessively tall on desktop.
    // Because width is derived from the same ratio, the image is still not cropped.
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
      ? `<b>Hard</b><span>จำนวนแผ่นที่เปิดได้จะคำนวณจากขนาดกระดานของแต่ละภาพ (ประมาณ ${Math.round(HARD_REVEAL_RATIO * 100)}% ของช่องทั้งหมด)</span>`
      : `<b>Easy</b><span>จำนวนช่องจะคำนวณจากสัดส่วนภาพ และเปิดได้เรื่อย ๆ แต่ทุกแผ่นที่เปิดเพิ่มจะทำให้คะแนนข้อนั้นลดลง</span>`;
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

    questionNoEl.textContent = `${questionIndex + 1} / 10`;
    messageEl.textContent = "กำลังคำนวณกระดานจากภาพ...";
    questionScoreEl.textContent = questionScore;
    scoreDetailEl.textContent = `ตอบถูกจากแผ่นแรก +${ONE_TILE_BONUS} Bonus`;
    hintBtn.disabled = hintsLeft <= 0;

    board.innerHTML = "";
    board.style.backgroundPosition = "center center";
    board.style.backgroundRepeat = "no-repeat";

    const artwork = chooseArtwork(current);
    const src = artworkSource(artwork);

    if (src) {
      const size = await readImageSize(src);
      if (token !== loadToken) return;

      configureBoard(size.width, size.height);
      board.style.backgroundImage = `url(${JSON.stringify(src)})`;
    } else {
      configureBoard(1, 1);
      board.style.backgroundImage = "radial-gradient(circle at 50% 50%, #4b436f 0 18%, transparent 19%), linear-gradient(145deg, #2a3044, #111520)";
    }

    buildTiles();
    updateTileStatus();
    messageEl.textContent = "เปิดอย่างน้อย 1 แผ่นก่อนตอบ ✨";
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

  // Replace the old fixed-five wording immediately after this extension loads.
  updateRuleCard();
})();
