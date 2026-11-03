/* MediClear — on-device history via IndexedDB. No server, ever. */
(function () {
  "use strict";
  var DB_NAME = "mediclear";
  var STORE = "cases";
  var dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          var s = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
          s.createIndex("ts", "ts", { unique: false });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbPromise;
  }

  function tx(mode) {
    return open().then(function (db) {
      return db.transaction(STORE, mode).objectStore(STORE);
    });
  }

  function addCase(rec) {
    // rec: {billData, analysis, lang, qa: []}
    rec.ts = Date.now();
    return tx("readwrite").then(function (s) {
      return new Promise(function (resolve, reject) {
        var r = s.add(rec);
        r.onsuccess = function () { resolve(r.result); };
        r.onerror = function () { reject(r.error); };
      });
    });
  }

  function listCases() {
    return tx("readonly").then(function (s) {
      return new Promise(function (resolve, reject) {
        var out = [];
        var idx = s.index("ts");
        var r = idx.openCursor(null, "prev");
        r.onsuccess = function () {
          var c = r.result;
          if (c) { out.push(c.value); c.continue(); }
          else resolve(out);
        };
        r.onerror = function () { reject(r.error); };
      });
    });
  }

  function getCase(id) {
    return tx("readonly").then(function (s) {
      return new Promise(function (resolve, reject) {
        var r = s.get(id);
        r.onsuccess = function () { resolve(r.result); };
        r.onerror = function () { reject(r.error); };
      });
    });
  }

  function updateCase(rec) {
    return tx("readwrite").then(function (s) {
      return new Promise(function (resolve, reject) {
        var r = s.put(rec);
        r.onsuccess = function () { resolve(true); };
        r.onerror = function () { reject(r.error); };
      });
    });
  }

  function clearAll() {
    return tx("readwrite").then(function (s) {
      return new Promise(function (resolve, reject) {
        var r = s.clear();
        r.onsuccess = function () { resolve(true); };
        r.onerror = function () { reject(r.error); };
      });
    });
  }

  window.MC_DB = {
    addCase: addCase,
    listCases: listCases,
    getCase: getCase,
    updateCase: updateCase,
    clearAll: clearAll
  };
})();
