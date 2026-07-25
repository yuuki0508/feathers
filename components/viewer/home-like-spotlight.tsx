"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatLikeNumber } from "@/lib/format";

const ROTATE_MS = 10_000;
const FADE_MS = 750;

export type HomeLikeItem = {
  id: string;
  body: string;
  number: string;
};

type HomeLikeSpotlightProps = {
  likes: HomeLikeItem[];
};

function pickRandomIndex(current: number, length: number): number {
  if (length <= 1) return 0;
  let next = current;
  while (next === current) {
    next = Math.floor(Math.random() * length);
  }
  return next;
}

export function HomeLikeSpotlight({ likes }: HomeLikeSpotlightProps) {
  const [index, setIndex] = useState(() =>
    likes.length > 0 ? Math.floor(Math.random() * likes.length) : 0,
  );
  const [phase, setPhase] = useState<"idle" | "leaving">("idle");

  const current = likes[index];

  const goToNext = useCallback(() => {
    setPhase("leaving");
  }, []);

  useEffect(() => {
    if (likes.length <= 1) return;

    const timer = window.setInterval(goToNext, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [goToNext, likes.length]);

  useEffect(() => {
    if (phase !== "leaving" || likes.length <= 1) return;

    const timer = window.setTimeout(() => {
      setIndex((prev) => pickRandomIndex(prev, likes.length));
      setPhase("idle");
    }, FADE_MS);

    return () => window.clearTimeout(timer);
  }, [phase, likes.length]);

  const sortedKey = useMemo(
    () => likes.map((like) => like.id).join(","),
    [likes],
  );

  useEffect(() => {
    if (likes.length === 0) return;
    setIndex(Math.floor(Math.random() * likes.length));
    setPhase("idle");
  }, [sortedKey, likes.length]);

  if (!current) return null;

  return (
    <section className="mb-6 px-5">
      <p className="mb-2.5 pl-0.5 text-[10px] tracking-[0.14em] text-text-sub">
        好きなところ
      </p>
      <Link
        key={current.id}
        href="/shelf/likes"
        className={`home-like-spotlight block rounded-[18px] border border-border bg-card px-5 py-[18px] ${
          phase === "leaving" ? "home-like-spotlight--leaving" : "home-like-spotlight--idle"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="min-w-7 shrink-0 font-display text-xl text-accent-light">
            {current.number}
          </span>
          <p className="whitespace-pre-wrap text-sm leading-[1.75] text-text">{current.body}</p>
        </div>
      </Link>
    </section>
  );
}
