"use client";

import Image from "next/image";
import { recordAccessLog } from "@/lib/actions/access-log";
import { formatFullDate, truncateText } from "@/lib/format";
import { markMemoryRead } from "@/lib/read-status";

type MemoryCardProps = {
  id: string;
  caption: string;
  memoryDate: string | null;
  photoUrls: string[];
};

export function MemoryCard({ id, caption, memoryDate, photoUrls }: MemoryCardProps) {
  const handleClick = () => {
    markMemoryRead(id);
    void recordAccessLog({
      pageType: "思い出",
      contentId: id,
      contentTitle: truncateText(caption, 30),
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mb-4 w-full overflow-hidden rounded-[20px] border border-border bg-card text-left"
    >
      <div
        className={`grid h-40 bg-border ${photoUrls.length === 2 ? "grid-cols-2 gap-0.5" : "grid-cols-1"}`}
      >
        {photoUrls.length > 0 ? (
          photoUrls.map((photoUrl, index) => (
            <div key={`${id}-${index}`} className="relative h-full min-h-0">
              <Image
                src={photoUrl}
                alt={`${caption} ${index + 1}`}
                fill
                className="object-cover"
                sizes={photoUrls.length === 2 ? "195px" : "390px"}
              />
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">📷</div>
        )}
      </div>
      <div className="px-[18px] py-4 pb-3.5">
        <p className="whitespace-pre-wrap text-sm leading-[1.85] text-text">{caption}</p>
        {memoryDate ? (
          <p className="mt-2.5 text-[10px] text-text-muted">
            {formatFullDate(memoryDate)}
          </p>
        ) : null}
      </div>
    </button>
  );
}
