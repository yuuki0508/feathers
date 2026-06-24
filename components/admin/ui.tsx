type AdminPageHeaderProps = {
  title: string;
  action?: React.ReactNode;
};

export function AdminPageHeader({ title, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#E5E5E5] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-7 md:py-4">
      <h1 className="text-base font-medium text-[#333]">{title}</h1>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AdminPageContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4 md:p-7">{children}</div>;
}

export function AdminCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 overflow-hidden rounded-[10px] border border-[#E5E5E5] bg-white">
      <div className="flex flex-col gap-3 border-b border-[#F0F0F0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#333]">{title}</p>
          {description ? (
            <p className="mt-0.5 text-xs text-[#999]">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function AdminPrimaryButton({
  children,
  type = "button",
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg bg-[#C4866A] px-4 py-2 text-[13px] text-white hover:bg-[#B37559] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function AdminGhostButton({
  children,
  type = "button",
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] px-4 py-2 text-[13px] text-[#555] hover:bg-[#EAEAEA] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function AdminField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[#666]">
        {label}
        {hint ? <span className="ml-1.5 font-normal text-[#aaa]">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export const adminInputClass =
  "w-full rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm text-[#333] outline-none focus:border-[#C4866A]";

export const adminTextareaClass =
  "w-full resize-y rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm leading-relaxed text-[#333] outline-none focus:border-[#C4866A]";

export function AdminTag({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={`inline-block rounded-[20px] px-2.5 py-0.5 text-[11px] ${
        muted ? "bg-[#F0F0F0] text-[#666]" : "bg-[#FBF0E8] text-[#C4866A]"
      }`}
    >
      {children}
    </span>
  );
}

export function AdminIconButton({
  icon,
  danger = false,
  label,
}: {
  icon: string;
  danger?: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      aria-label={label}
      className={`p-1 text-base text-[#888] hover:text-[#333] ${
        danger ? "hover:!text-red-600" : ""
      }`}
    >
      <i className={`ti ${icon}`} />
    </button>
  );
}
