(function () {
  window.ACC_EXTRA_BOSS_DATA = window.ACC_EXTRA_BOSS_DATA || [];
  window.ACC_REGISTER_BOSS = window.ACC_REGISTER_BOSS || function ACC_REGISTER_BOSS(boss) {
    if (!boss || typeof boss !== "object") return;
    var folderId = String(window.ACC_CURRENT_BOSS_FOLDER_ID || boss.folderId || boss.folder || boss.assetFolder || "").trim();
    if (folderId && !boss.folderId) boss.folderId = folderId;
    window.ACC_EXTRA_BOSS_DATA.push(boss);
  };

  var ids = Array.isArray(window.ACC_BOSS_MANIFEST) ? window.ACC_BOSS_MANIFEST : [];
  var v = encodeURIComponent(String(window.ACC_BOSS_CACHE_BUSTER || Date.now()));
  ids.forEach(function (id) {
    var safeId = String(id || "").trim().replace(/[^a-zA-Z0-9_-]/g, "");
    if (!safeId) return;
    document.write('<script>window.ACC_CURRENT_BOSS_FOLDER_ID="' + safeId + '";<\/script>');
    document.write('<script src="boss/' + safeId + '/boss.js?v=' + v + '"><\/script>');
  });
})();
