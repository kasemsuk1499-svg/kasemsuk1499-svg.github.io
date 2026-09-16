// Extended character discovery: search by name, anime, category, tags, organizations, groups and affiliations.
// Search metadata helps find a character, but an actual character must still be selected as the answer.
(function () {
  const lastMatchInfo = new Map();

  function toList(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (value === undefined || value === null || value === "") return [];
    return [String(value)];
  }

  function searchFields(c) {
    const fields = [];
    const add = (values, type, label, weight) => {
      for (const value of toList(values)) {
        fields.push({ value, type, label, weight });
      }
    };

    add(c.name, "name", "ชื่อ", 1.00);
    add(c.aliases, "alias", "ชื่ออื่น", 0.98);
    add(c.anime, "anime", "อนิเมะ", 0.90);
    add(c.series, "anime", "อนิเมะ", 0.90);
    add(c.categories, "category", "หมวด", 0.82);
    add(c.category, "category", "หมวด", 0.82);
    add(c.tags, "tag", "แท็ก", 0.86);
    add(c.searchTags, "tag", "แท็ก", 0.86);
    add(c.organizations, "organization", "องค์กร", 0.88);
    add(c.organization, "organization", "องค์กร", 0.88);
    add(c.groups, "organization", "กลุ่ม", 0.88);
    add(c.group, "organization", "กลุ่ม", 0.88);
    add(c.affiliations, "organization", "สังกัด", 0.88);
    add(c.affiliation, "organization", "สังกัด", 0.88);
    add(c.factions, "organization", "ฝ่าย", 0.88);
    add(c.faction, "organization", "ฝ่าย", 0.88);

    return fields;
  }

  function bestMatch(query, character) {
    let best = null;

    for (const field of searchFields(character)) {
      const raw = fuzzyScore(query, field.value);
      if (raw <= 0) continue;

      const score = raw * field.weight;
      if (!best || score > best.score) {
        best = { ...field, score };
      }
    }

    return best;
  }

  searchCharacters = function searchCharactersByMetadata(query) {
    if (!normalize(query)) return [];

    const searchPool = selectedCategory === "all"
      ? characters
      : characters.filter(c => getCategories(c).includes(selectedCategory));

    lastMatchInfo.clear();

    return searchPool
      .map(c => {
        const match = bestMatch(query, c);
        if (match) lastMatchInfo.set(c.id, match);
        return { character: c, match };
      })
      .filter(x => x.match)
      .sort((a, b) =>
        b.match.score - a.match.score ||
        a.character.name.localeCompare(b.character.name, "th")
      )
      .slice(0, 12)
      .map(x => x.character);
  };

  renderSuggestions = function renderMetadataSuggestions(query) {
    const results = searchCharacters(query);
    suggestionIndex = -1;

    if (!query.trim() || results.length === 0) {
      hideSuggestions();
      return;
    }

    suggestionsEl.innerHTML = "";

    for (const c of results) {
      const match = lastMatchInfo.get(c.id);
      const btn = document.createElement("button");
      btn.className = "suggestion";
      btn.dataset.id = c.id;

      const left = document.createElement("span");

      const name = document.createElement("span");
      name.className = "name";
      name.textContent = c.name;

      const meta = document.createElement("span");
      meta.className = "meta";
      const anime = c.anime || c.series || getCategories(c)[0] || "";
      const matchedByMeta = match && !["name", "alias"].includes(match.type);
      meta.textContent = matchedByMeta
        ? `${anime}${anime ? " • " : ""}${match.label}: ${match.value}`
        : anime;

      const cat = document.createElement("span");
      cat.className = "category";
      cat.textContent = matchedByMeta ? match.label : (getCategories(c)[0] || "");

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
  };
})();
