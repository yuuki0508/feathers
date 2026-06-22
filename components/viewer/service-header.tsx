import { HeartsAnimation } from "@/components/viewer/hearts-animation";

export function ServiceHeader() {
  return (
    <header className="px-6 pb-4 pt-9 text-center">
      <HeartsAnimation />
      <h1 className="font-display text-2xl tracking-wide text-accent">ココロの羽</h1>
      <p className="mt-1 text-[11px] tracking-widest text-text-sub">
        どんなに遠く離れても
      </p>
    </header>
  );
}
