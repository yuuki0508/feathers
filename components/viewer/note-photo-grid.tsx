"use client";

import { useEffect, useState } from "react";

type NotePhotoGridProps = {
  urls: string[];
  compact?: boolean;
};

function gridClass(count: number, compact: boolean): string {
  if (count === 1) {
    return compact ? "grid-cols-1" : "grid-cols-1";
  }
  if (count === 3) {
    return "grid-cols-2 grid-rows-2";
  }
  return "grid-cols-2";
}

function cellClass(count: number, index: number, compact: boolean): string {
  if (count === 1) {
    return compact ? "min-h-28 max-h-48" : "min-h-40 max-h-72";
  }
  if (count === 3 && index === 0) {
    return "row-span-2 min-h-0";
  }
  return compact ? "min-h-24" : "min-h-32";
}

export function NotePhotoGrid({ urls, compact = false }: NotePhotoGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? current : (current + 1) % urls.length,
        );
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? current : (current - 1 + urls.length) % urls.length,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, urls.length]);

  if (urls.length === 0) return null;

  return (
    <>
      <div
        className={`mt-2.5 grid overflow-hidden rounded-2xl border border-border ${gridClass(
          urls.length,
          compact,
        )} ${urls.length > 1 ? "gap-0.5" : ""} ${
          urls.length === 2 || urls.length === 4 ? (compact ? "h-40" : "h-52") : ""
        } ${urls.length === 3 ? (compact ? "h-40" : "h-52") : ""}`}
      >
        {urls.map((url, index) => (
          <button
            key={`${url}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative overflow-hidden bg-border ${cellClass(urls.length, index, compact)}`}
          >
            <img src={url} alt="" className="absolute inset-0 size-full object-cover" />
          </button>
        ))}
      </div>

      {activeIndex !== null ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            aria-label="閉じる"
            className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-black/50 text-white"
          >
            <i className="ti ti-x text-lg" />
          </button>
          {urls.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="前の写真"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex((activeIndex - 1 + urls.length) % urls.length);
                }}
                className="absolute left-3 flex size-9 items-center justify-center rounded-full bg-black/50 text-white"
              >
                <i className="ti ti-chevron-left text-lg" />
              </button>
              <button
                type="button"
                aria-label="次の写真"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex((activeIndex + 1) % urls.length);
                }}
                className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white"
              >
                <i className="ti ti-chevron-right text-lg" />
              </button>
            </>
          ) : null}
          <img
            src={urls[activeIndex]}
            alt=""
            onClick={(event) => event.stopPropagation()}
            className="max-h-[86vh] max-w-[92vw] rounded-lg object-contain"
          />
        </div>
      ) : null}
    </>
  );
}
