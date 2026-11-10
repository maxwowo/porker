interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const memory = new Map<string, string>();
const memoryStore: KeyValueStore = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => {
    memory.set(key, value);
  },
  removeItem: (key) => {
    memory.delete(key);
  },
};

let cachedStore: KeyValueStore | null = null;

function getStore(): KeyValueStore {
  if (cachedStore) return cachedStore;

  cachedStore = browserStore() ?? memoryStore;
  return cachedStore;
}

function browserStore(): KeyValueStore | null {
  for (const candidate of [() => window.localStorage, () => window.sessionStorage]) {
    try {
      const store = candidate();
      if (isWritable(store)) return store;
    } catch {
      continue;
    }
  }

  return null;
}

function isWritable(store: KeyValueStore): boolean {
  const probe = "__porker_probe__";

  try {
    store.setItem(probe, "1");
    store.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function readJson<T>(key: string): T | null {
  const raw = getStore().getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  bestEffort(() => getStore().setItem(key, JSON.stringify(value)));
}

export function removeKey(key: string): void {
  bestEffort(() => getStore().removeItem(key));
}

function bestEffort(action: () => void): void {
  try {
    action();
  } catch {
    return;
  }
}
