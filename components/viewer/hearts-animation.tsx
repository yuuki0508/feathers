export function HeartsAnimation() {
  return (
    <div className="mb-2.5 flex h-7 items-center justify-center gap-2">
      <span className="animate-float-heart text-[11px] text-accent">♡</span>
      <span
        className="animate-float-heart text-[9px] text-accent-light"
        style={{ animationDelay: "0.9s" }}
      >
        ♡
      </span>
      <span
        className="animate-float-heart text-[13px] text-accent"
        style={{ animationDelay: "1.8s" }}
      >
        ♡
      </span>
    </div>
  );
}
