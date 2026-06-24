type DatedMemory = {
  memory_date: string | null;
  created_at: string;
};

type DatedNovel = {
  created_at: string;
};

function compareDesc(a: string, b: string): number {
  return b.localeCompare(a);
}

/** 思い出を日付（memory_date）の降順で並べる。日付未設定は created_at の日付で比較する。 */
export function sortMemoriesByDateDesc<T extends DatedMemory>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const dateA = a.memory_date ?? a.created_at.slice(0, 10);
    const dateB = b.memory_date ?? b.created_at.slice(0, 10);
    const dateCompare = compareDesc(dateA, dateB);
    if (dateCompare !== 0) return dateCompare;
    return compareDesc(a.created_at, b.created_at);
  });
}

/** お楽しみを created_at の降順で並べる。 */
export function sortNovelsByDateDesc<T extends DatedNovel>(items: T[]): T[] {
  return [...items].sort((a, b) => compareDesc(a.created_at, b.created_at));
}

export function getMemorySortAt(memory: DatedMemory): string {
  return memory.memory_date ? `${memory.memory_date}T12:00:00+09:00` : memory.created_at;
}

export function getNovelSortAt(novel: DatedNovel): string {
  return novel.created_at;
}
