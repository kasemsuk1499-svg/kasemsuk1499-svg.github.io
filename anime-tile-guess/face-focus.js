// Face-focus layer for Anime Tile Guess.
// Existing string artwork paths still work. Optional per-character or per-art focus is supported.
(function () {
  const DEFAULT_FOCUS = [50, 28];
  const boardEl = document.getElementById("board");

  function clamp(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(100, n));
  }

  function readFocus(value, fallback = DEFAULT_FOCUS) {
    if (Array.isArray(value) && value.length >= 2) {
      return [clamp(value[0], fallback[0]), clamp(value[1], fallback[1])];
    }

    if (value && typeof value === "object") {
      return [
        clamp(value.x ?? value.focusX, fallback[0]),
        clamp(value.y ?? value.focusY, fallback[1])
      ];
    }

    return [fallback[0], fallback[1]];
  }

  function parseArtwork(artwork, character) {
    const characterFocus = readFocus(
      character?.focus ?? character?.faceFocus,
      DEFAULT_FOCUS
    );

    if (typeof artwork === "string") {
      return {
        src: artwork,
        position: `${characterFocus[0]}% ${characterFocus[1]}%`,
        fit: "cover"
      };
    }

    if (!artwork || typeof artwork !== "object") return null;

    const src = artwork.src || artwork.image || artwork.url;
    if (!src) return null;

    const focus = readFocus(
      artwork.focus ?? artwork.faceFocus ?? {
        x: artwork.focusX,
        y: artwork.focusY
      },
      characterFocus
    );

    return {
      src,
      position: typeof artwork.position === "string"
        ? artwork.position
        : `${focus[0]}% ${focus[1]}%`,
      fit: artwork.fit === "contain" ? "contain" : "cover"
    };
  }

  // Reassign the global picker used by script.js.
  pickArtwork = function pickArtworkWithFaceFocus(character) {
    const artworks = typeof getArtworks === "function"
      ? getArtworks(character)
      : [
          ...(Array.isArray(character?.images) ? character.images : []),
          character?.image
        ].filter(Boolean);

    if (!artworks.length) {
      if (boardEl) {
        boardEl.style.backgroundPosition = "50% 28%";
        boardEl.style.backgroundSize = "cover";
        boardEl.style.backgroundRepeat = "no-repeat";
      }
      return null;
    }

    const chosen = artworks[Math.floor(Math.random() * artworks.length)];
    const parsed = parseArtwork(chosen, character);
    if (!parsed) return null;

    if (boardEl) {
      boardEl.style.backgroundPosition = parsed.position;
      boardEl.style.backgroundSize = parsed.fit;
      boardEl.style.backgroundRepeat = "no-repeat";
    }

    return parsed.src;
  };
})();
