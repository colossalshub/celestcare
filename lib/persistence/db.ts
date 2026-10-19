import { deleteDB, openDB } from "idb";
import { emptyData, type AppData } from "@/lib/state/model";

export type DatabaseName = "celestcare" | "celestcare-demo";

const STORE = "kv";
const ROOT = "root";

async function open(name: DatabaseName) {
  return openDB(name, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE);
    },
  });
}

export async function loadState(name: DatabaseName): Promise<AppData | null> {
  const database = await open(name);
  try {
    const stored = await database.get(STORE, ROOT);
    if (!stored || typeof stored !== "object") return null;
    const data = stored as AppData;
    if (data.version !== 1) return null;
    return data;
  } finally {
    database.close();
  }
}

export async function saveState(name: DatabaseName, data: AppData): Promise<void> {
  const database = await open(name);
  try {
    await database.put(STORE, data, ROOT);
  } finally {
    database.close();
  }
}

export async function deleteState(name: DatabaseName): Promise<void> {
  await deleteDB(name);
}

export async function ensureState(name: DatabaseName, seed?: AppData): Promise<AppData> {
  const existing = await loadState(name);
  if (existing) return existing;
  const initial = seed ?? emptyData();
  await saveState(name, initial);
  return initial;
}
