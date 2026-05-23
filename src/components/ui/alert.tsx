import { cn } from "@/lib/utils";

interface AlertProps {
  type?: "error" | "success" | "warning" | "info";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const alertStyles = {
  error: "bg-red-50 border-red-200 text-red-800",
  success: "bg-green-50 border-green-200 text-green-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export function Alert({
  type = "info",
  title,
  children,
  className,
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        alertStyles[type],
        className
      )}
    >
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <p>{children}</p>
    </div>
  );
}
