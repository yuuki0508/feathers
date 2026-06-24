"use client";

import { useState } from "react";
import { adminTextareaClass } from "@/components/admin/ui";

type AdminTextareaWithCountProps = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function AdminTextareaWithCount({
  name,
  defaultValue = "",
  placeholder,
  rows = 4,
  required,
  disabled = false,
  className,
}: AdminTextareaWithCountProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div>
      <textarea
        name={name}
        rows={rows}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`${adminTextareaClass} ${className ?? ""}`}
      />
      <p className="mt-1.5 text-right text-[11px] tabular-nums text-[#aaa]">
        {value.length}文字
      </p>
    </div>
  );
}
