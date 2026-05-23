"use client";

import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { useState } from "react";
import { cn } from "@/lib/utils";

/* ── Conversão ISO ↔ display ──────────────────────────────────────── */

function formatToDisplay(iso: string): string {
  if (!iso || iso.length < 10) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

function parseToISO(display: string): string {
  const digits = display.replace(/\D/g, "");
  if (digits.length < 8) return "";
  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
}

function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/* ── Componente ───────────────────────────────────────────────────── */

interface DateInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  /** Formato exibido — apenas documental, sempre dd/MM/yyyy */
  format?: string;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Reduz padding e border-radius para uso em tabelas/grades compactas */
  compact?: boolean;
  className?: string;
}

export function DateInput<T extends FieldValues>({
  name,
  control,
  format = "dd/MM/yyyy",
  label,
  error,
  hint,
  required,
  compact = false,
  className,
}: DateInputProps<T>) {
  const { field } = useController({ name, control });

  const [displayValue, setDisplayValue] = useState(() =>
    formatToDisplay(field.value ?? "")
  );

  const inputId = label?.toLowerCase().replace(/\s+/g, "-");
  const hasError = Boolean(error);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = maskDate(e.target.value);
    setDisplayValue(masked);
    field.onChange(parseToISO(masked) || "");
  }

  function handleBlur() {
    const digits = displayValue.replace(/\D/g, "");
    if (digits.length > 0 && digits.length < 8) {
      setDisplayValue("");
      field.onChange("");
    }
    field.onBlur();
  }

  const inputClass = compact
    ? cn(
        "block w-full rounded-md border px-2.5 py-1.5 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-offset-0",
        hasError
          ? "border-red-300 focus:border-red-400 focus:ring-red-200"
          : "border-gray-300 focus:border-primary focus:ring-primary/20"
      )
    : cn(
        "block w-full rounded-lg border px-3 py-2 text-sm shadow-sm",
        "placeholder:text-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-offset-0",
        hasError
          ? "border-red-300 focus:border-red-400 focus:ring-red-200"
          : "border-gray-300 focus:border-primary focus:ring-primary/20",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
      );

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Input oculto — envia YYYY-MM-DD para o Server Action */}
      <input type="hidden" name={field.name} value={field.value ?? ""} />

      {/* Input visível — exibe e aceita dd/MM/yyyy */}
      <input
        id={inputId}
        ref={field.ref}
        type="text"
        inputMode="numeric"
        placeholder={format}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={inputClass}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
