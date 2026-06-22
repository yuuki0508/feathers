type SubHeaderProps = {
  title: string;
  subtitle: string;
};

export function SubHeader({ title, subtitle }: SubHeaderProps) {
  return (
    <header className="px-6 pb-4 pt-9 text-center">
      <h1 className="font-display text-xl text-accent">{title}</h1>
      <p className="mt-1 text-[11px] tracking-widest text-text-sub">{subtitle}</p>
    </header>
  );
}
