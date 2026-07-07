/*
  โหลดการ์ดเสริมจาก ACC_CARD_MANIFEST
  รูปแบบไฟล์การ์ดเสริมที่แนะนำ: card/<id>/card.js
  ในไฟล์นั้นให้เรียก ACC_REGISTER_CARD({ ...ข้อมูลการ์ด... });
*/
(function () {
  "use strict";

  var root = String(window.ACC_CARD_ROOT || "card").replace(/\/+$/, "");
  var version = String(window.ACC_CARD_VERSION || "");
  var manifest = Array.isArray(window.ACC_CARD_MANIFEST) ? window.ACC_CARD_MANIFEST : [];

  window.ACC_EXTRA_CARD_DATA = Array.isArray(window.ACC_EXTRA_CARD_DATA) ? window.ACC_EXTRA_CARD_DATA : [];
  window.ACC_REGISTER_CARD = function ACC_REGISTER_CARD(card) {
    if (!card || typeof card !== "object") {
      console.warn("ACC_REGISTER_CARD: ข้ามข้อมูลที่ไม่ใช่ object", card);
      return;
    }
    if (card.id === undefined || card.id === null || card.id === "") {
      console.warn("ACC_REGISTER_CARD: การ์ดต้องมี id", card);
      return;
    }
    window.ACC_EXTRA_CARD_DATA.push(card);
  };

  function resolveScriptPath(entry) {
    if (entry && typeof entry === "object") {
      if (entry.enabled === false) return "";
      if (entry.src) return String(entry.src);
      if (entry.id !== undefined && entry.id !== null) return root + "/" + encodeURIComponent(String(entry.id)) + "/card.js";
      return "";
    }

    var raw = String(entry || "").trim();
    if (!raw) return "";
    if (/^(https?:|\/|\.\/|\.\.\/)/.test(raw)) return raw;
    if (raw.indexOf("/") >= 0 || raw.endsWith(".js")) {
      return raw.indexOf(root + "/") === 0 ? raw : root + "/" + raw.replace(/^\/+/, "");
    }
    return root + "/" + encodeURIComponent(raw) + "/card.js";
  }

  function withVersion(src) {
    if (!version) return src;
    return src + (src.indexOf("?") >= 0 ? "&" : "?") + "v=" + encodeURIComponent(version);
  }

  function escapeHtmlAttribute(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  manifest.forEach(function (entry) {
    var src = resolveScriptPath(entry);
    if (!src) return;
    document.write('<script src="' + escapeHtmlAttribute(withVersion(src)) + '"><\/script>');
  });
})();
