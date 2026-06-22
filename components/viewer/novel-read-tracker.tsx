"use client";

import { useEffect } from "react";
import { markNovelRead } from "@/lib/read-status";

export function NovelReadTracker({ novelId }: { novelId: string }) {
  useEffect(() => {
    markNovelRead(novelId);
  }, [novelId]);

  return null;
}
