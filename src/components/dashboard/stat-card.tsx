interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red" | "gray";
}

const colorClasses = {
  blue: "bg-primary/10 text-primary",
  green: "bg-green-50 text-green-600",
  yellow: "bg-yellow-50 text-yellow-600",
  red: "bg-red-50 text-red-600",
  gray: "bg-gray-50 text-gray-600",
};

export function StatCard({
  title,
  value,
  description,
  icon,
  color = "blue",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
