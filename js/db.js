/* MediClear — on-device history via IndexedDB. No server, ever.
   Resilient design (fix 2026-11-02, QA bug: "database connection is closing"):
   - never reuse a closed/broken connection (onclose drops the cache)
   - a failed open never poisons the cache (next call reconnects)
   - open() has a timeout so callers can't hang forever on a blocked upgrade
   - every operation retries once with a fresh connection */
(function () {
  "use strict";
  var DB_NAME = "mediclear";
  var STORE = "cases";
  var OPEN_TIMEOUT_MS = 10000;
  var dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var req;
      try {
        req = indexedDB.open(DB_NAME, 1);
      } catch (e) {
        dbPromise = null;
        reject(e);
        return;
      }
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          var s = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
          s.createIndex("ts", "ts", { unique: false });
        }
      };
      req.onsuccess = function () {
        var db = req.result;
        // Never hand out a dead connection twice.
        db.onclose = function () { dbPromise = null; };
        resolve(db);
      };
      req.onerror = function () {
        dbPromise = null;
        reject(req.error || new Error("indexedDB open failed"));
      };
      // onblocked: another connection holds an old version — keep waiting;
      // the OPEN_TIMEOUT_MS race below bounds the wait.
    });
    // Bound the wait: a blocked/never-settling open must not hang the app.
    var raced = Promise.race([
      dbPromise,
      new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error("indexedDB open timeout")); }, OPEN_TIMEOUT_MS);
      })
    ]).catch(function (e) {
      dbPromise = null; // drop whatever is stuck; next call reconnects
      throw e;
    });
    // Keep dbPromise as the raw open (so onclose can clear it); callers use raced.
    dbPromise._raced = raced;
    return raced;
  }

  // Run fn(store) -> promise. Retries once with a brand-new connection.
  function run(mode, fn) {
    function attempt(retried) {
      return openDB().then(function (db) {
        var store;
        try {
          store = db.transaction(STORE, mode).objectStore(STORE);
        } catch (e) {
          throw { reopen: true, err: e };
        }
        var out;
        try {
          out = fn(store);
        } catch (e) {
          throw { reopen: true, err: e };
        }
        return Promise.resolve(out).catch(function (e) {
          throw { reopen: true, err: e };
        });
      }).catch(function (e) {
        if (e && e.reopen && !retried) {
          dbPromise = null;
          return attempt(true);
        }
        throw (e && e.err) || e;
      });
    }
    return attempt(false);
  }

  function reqToPromise(r) {
    return new Promise(function (resolve, reject) {
      r.onsuccess = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error || new Error("indexedDB request failed")); };
    });
  }

  function addCase(rec) {
    rec.ts = Date.now();
    return run("readwrite", function (s) { return reqToPromise(s.add(rec)); });
  }

  function listCases() {
    return run("readonly", function (s) {
      return new Promise(function (resolve, reject) {
        var out = [];
        var r = s.index("ts").openCursor(null, "prev");
        r.onsuccess = function () {
          var c = r.result;
          if (c) { out.push(c.value); c.continue(); }
          else resolve(out);
        };
        r.onerror = function () { reject(r.error || new Error("indexedDB cursor failed")); };
      });
    });
  }

  function getCase(id) {
    return run("readonly", function (s) { return reqToPromise(s.get(id)); });
  }

  function updateCase(rec) {
    return run("readwrite", function (s) { return reqToPromise(s.put(rec)); });
  }

  function clearAll() {
    return run("readwrite", function (s) { return reqToPromise(s.clear()); });
  }

  function deleteCase(id) {
    return run("readwrite", function (s) { return reqToPromise(s.delete(id)); });
  }

  window.MC_DB = {
    addCase: addCase,
    listCases: listCases,
    getCase: getCase,
    updateCase: updateCase,
    deleteCase: deleteCase,
    clearAll: clearAll
  };
})();
