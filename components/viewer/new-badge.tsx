export function NewBadge({ className = "mb-3" }: { className?: string }) {
  return (
    <span
      className={`${className} inline-block rounded-[20px] bg-tag-bg px-2.5 py-0.5 text-[10px] text-accent`}
    >
      NEW
    </span>
  );
}
