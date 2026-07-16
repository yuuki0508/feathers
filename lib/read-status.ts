const STORAGE_KEY = "feathers_read";

export type ReadContentType =
  | "messages"
  | "memories"
  | "likes"
  | "diaries"
  | "novels"
  | "wishlist_items";

type ReadStore = Record<ReadContentType, string[]>;

const emptyStore = (): ReadStore => ({
  messages: [],
  memories: [],
  likes: [],
  diaries: [],
  novels: [],
  wishlist_items: [],
});

function loadStore(): ReadStore {
  if (typeof window === "undefined") return emptyStore();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<ReadStore>;
    return {
      messages: parsed.messages ?? [],
      memories: parsed.memories ?? [],
      likes: parsed.likes ?? [],
      diaries: parsed.diaries ?? [],
      novels: parsed.novels ?? [],
      wishlist_items: parsed.wishlist_items ?? [],
    };
  } catch {
    return emptyStore();
  }
}

function saveStore(store: ReadStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function markRead(type: ReadContentType, id: string) {
  const store = loadStore();
  if (store[type].includes(id)) return;
  store[type] = [...store[type], id];
  saveStore(store);
}

export function isContentRead(type: ReadContentType, id: string): boolean {
  return loadStore()[type].includes(id);
}

export function markContentRead(type: ReadContentType, id: string) {
  markRead(type, id);
}

export function isMessageRead(id: string): boolean {
  return isContentRead("messages", id);
}

export function isMemoryRead(id: string): boolean {
  return isContentRead("memories", id);
}

export function isLikeRead(id: string): boolean {
  return isContentRead("likes", id);
}

export function isDiaryRead(id: string): boolean {
  return isContentRead("diaries", id);
}

export function isNovelRead(id: string): boolean {
  return isContentRead("novels", id);
}

export function markMessageRead(id: string) {
  markContentRead("messages", id);
}

export function markMemoryRead(id: string) {
  markContentRead("memories", id);
}

export function markLikeRead(id: string) {
  markContentRead("likes", id);
}

export function markDiaryRead(id: string) {
  markContentRead("diaries", id);
}

export function markNovelRead(id: string) {
  markContentRead("novels", id);
}
