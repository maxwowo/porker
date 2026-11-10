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

let activeStore: KeyValueStore | null = null;

function store(): KeyValueStore {
  if (activeStore) return activeStore;

  for (const getStore of [() => window.localStorage, () => window.sessionStorage]) {
    try {
      const candidate = getStore();
      const probe = "__porker_probe__";
      candidate.setItem(probe, "1");
      candidate.removeItem(probe);
      activeStore = candidate;
      return candidate;
    } catch {
      continue;
    }
  }

  activeStore = memoryStore;
  return activeStore;
}

export function readJson<T>(key: string): T | null {
  const raw = store().getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    store().setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked; the app still works without persistence.
  }
}

export function removeKey(key: string): void {
  try {
    store().removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}
