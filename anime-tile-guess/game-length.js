// Game length modes: fixed 10 questions or Endless until lives run out.
var gameLengthMode = "ten";
var endlessQuestionNumber = 1;
var endlessCycle = 1;

(function () {
  const lengthSelect = document.getElementById("lengthSelect");
  const startCopy = document.querySelector(".start-copy p");
  const baseFinishGame = finishGame;

  function reshuffleEndless(previousId = null) {
    let next = shuffle(pool);

    // Avoid showing the same character at the cycle boundary when possible.
    if (previousId && next.length > 1 && next[0]?.id === previousId) {
      const swapIndex = next.findIndex(c => c.id !== previousId);
      if (swapIndex > 0) [next[0], next[swapIndex]] = [next[swapIndex], next[0]];
    }

    quiz = next;
    questionIndex = 0;
  }

  window.advanceToNextQuestion = function advanceToNextQuestion() {
    if (gameLengthMode !== "endless") {
      if (questionIndex >= 9) {
        finishGame(true);
        return;
      }

      questionIndex++;
      loadQuestion();
      return;
    }

    const previousId = quiz[questionIndex]?.id || null;
    endlessQuestionNumber++;

    if (questionIndex + 1 >= quiz.length) {
      endlessCycle++;
      reshuffleEndless(previousId);
    } else {
      questionIndex++;
    }

    loadQuestion();
  };

  finishGame = function finishWithLengthMode(completed) {
    if (gameLengthMode !== "endless") {
      baseFinishGame(completed);
      return;
    }

    gameScreen.classList.add("hidden");
    endScreen.classList.remove("hidden");
    hud.classList.add("hidden");

    finalScoreEl.textContent = totalScore;
    endBadge.textContent = "ENDLESS OVER";
    endTitle.textContent = `จบที่ข้อ ${endlessQuestionNumber} 💀`;
    endSummary.textContent = `ตอบถูก ${correct} ข้อ • คะแนน ${totalScore} • เล่นถึงรอบชุดที่ ${endlessCycle}`;
  };

  function adaptiveStartGame() {
    selectedCategory = categorySelect.value;
    selectedMode = modeSelect.value;
    gameLengthMode = lengthSelect?.value || "ten";

    pool = selectedCategory === "all"
      ? [...characters]
      : characters.filter(c => getCategories(c).includes(selectedCategory));

    const minimum = gameLengthMode === "endless" ? 1 : 10;
    if (pool.length < minimum) {
      startMessage.textContent = gameLengthMode === "endless"
        ? "หมวดนี้ยังไม่มีตัวละครให้เล่น"
        : `หมวดนี้มี ${pool.length} ตัวละคร ต้องมีอย่างน้อย 10 ตัวเพื่อเริ่มเกม`;
      return;
    }

    questionIndex = 0;
    endlessQuestionNumber = 1;
    endlessCycle = 1;
    lives = 5;
    correct = 0;
    totalScore = 0;
    hintsLeft = 4;
    locked = false;

    if (gameLengthMode === "endless") {
      reshuffleEndless();
    } else {
      quiz = shuffle(pool).slice(0, 10);
    }

    startScreen.classList.add("hidden");
    endScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    hud.classList.remove("hidden");

    currentCategoryEl.textContent = selectedCategory === "all" ? "ทั้งหมด" : selectedCategory;
    currentModeEl.textContent = selectedMode.toUpperCase();
    startMessage.textContent = "";

    renderHUD();
    loadQuestion();
  }

  // Replace the original start/play-again handlers without editing the core file.
  startBtn.addEventListener("click", event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    adaptiveStartGame();
  }, true);

  playAgainBtn.addEventListener("click", event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    adaptiveStartGame();
  }, true);

  // The core script registered its old rule renderer first; render the adaptive text again afterward.
  modeSelect.addEventListener("change", () => updateRuleCard());

  if (lengthSelect) {
    lengthSelect.addEventListener("change", () => {
      if (startCopy) {
        startCopy.textContent = lengthSelect.value === "endless"
          ? "Endless เล่นต่อเนื่องจนชีวิตหมด • 5 ชีวิต • คำใบ้รวม 4 ครั้ง"
          : "หนึ่งเกมมี 10 ตัวละคร • 5 ชีวิต • คำใบ้รวม 4 ครั้ง";
      }
    });
  }
})();
