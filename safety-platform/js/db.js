// db.js — tiny IndexedDB wrapper (offline-first storage).
// Stores: visits, actions, photos, meta. No external dependencies.

const DB_NAME = 'safety-platform';
const DB_VERSION = 2;
const STORES = ['visits', 'actions', 'photos', 'meta', 'accidents'];

let _db = null;

function open() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      for (const s of STORES) {
        if (!db.objectStoreNames.contains(s)) {
          db.createObjectStore(s, { keyPath: 'id' });
        }
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(store, mode = 'readonly') {
  return open().then((db) => db.transaction(store, mode).objectStore(store));
}

export const db = {
  async get(store, id) {
    const os = await tx(store);
    return new Promise((res, rej) => {
      const r = os.get(id);
      r.onsuccess = () => res(r.result || null);
      r.onerror = () => rej(r.error);
    });
  },
  async all(store) {
    const os = await tx(store);
    return new Promise((res, rej) => {
      const r = os.getAll();
      r.onsuccess = () => res(r.result || []);
      r.onerror = () => rej(r.error);
    });
  },
  async put(store, value) {
    const os = await tx(store, 'readwrite');
    return new Promise((res, rej) => {
      const r = os.put(value);
      r.onsuccess = () => res(value);
      r.onerror = () => rej(r.error);
    });
  },
  async del(store, id) {
    const os = await tx(store, 'readwrite');
    return new Promise((res, rej) => {
      const r = os.delete(id);
      r.onsuccess = () => res();
      r.onerror = () => rej(r.error);
    });
  },
  async clear(store) {
    const os = await tx(store, 'readwrite');
    return new Promise((res, rej) => {
      const r = os.clear();
      r.onsuccess = () => res();
      r.onerror = () => rej(r.error);
    });
  },
};
