// Round-flow rules: wrong answer or skip costs one life, reveals the answer, then advances.
(function () {
  const skipBtn = document.getElementById("skipBtn");
  const RESULT_REVEAL_MS = 1800;

  function goNext() {
    if (typeof window.advanceToNextQuestion === "function") {
      window.advanceToNextQuestion();
      return;
    }

    if (questionIndex >= 9) finishGame(true);
    else {
      questionIndex++;
      loadQuestion();
    }
  }

  function advanceAfterMiss(label) {
    if (locked) return;

    locked = true;
    lives--;
    renderHUD();
    hideSuggestions();
    selectedCharacterId = null;
    guessInput.value = "";

    const current = quiz[questionIndex];
    revealAll();
    messageEl.textContent = `${label} เฉลย: ${current.name} • เหลือ ${Math.max(0, lives)} ชีวิต`;

    if (lives <= 0) {
      setTimeout(() => finishGame(false), RESULT_REVEAL_MS);
      return;
    }

    setTimeout(goNext, RESULT_REVEAL_MS);
  }

  function adaptiveSubmitAnswer() {
    if (locked) return;

    if (opened.size < 1) {
      messageEl.textContent = "ต้องเปิดอย่างน้อย 1 แผ่นก่อนตอบนะ 👀";
      return;
    }

    const chosen = resolveTypedCharacter();

    if (!chosen) {
      messageEl.textContent = "เลือกตัวละครจากรายการค้นหาก่อนตอบนะ 👀";
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

      setTimeout(goNext, RESULT_REVEAL_MS);
      return;
    }

    advanceAfterMiss("❌ ตอบผิด!");
  }

  submitAnswer = adaptiveSubmitAnswer;

  submitBtn.addEventListener("click", event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    adaptiveSubmitAnswer();
  }, true);

  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      if (locked) return;
      advanceAfterMiss("⏭️ ข้ามข้อนี้!");
    });
  }
})();
