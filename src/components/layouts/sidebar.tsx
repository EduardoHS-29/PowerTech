"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWind,
  faHouse,
  faFan,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: ROUTES.DASHBOARD,
    label: "Dashboard",
    icon: <FontAwesomeIcon icon={faHouse} className="h-5 w-5" />,
  },
  {
    href: ROUTES.TURBINAS,
    label: "Turbinas",
    icon: <FontAwesomeIcon icon={faFan} className="h-5 w-5" />,
  },
  {
    href: ROUTES.ANALISES,
    label: "Análises",
    icon: <FontAwesomeIcon icon={faChartBar} className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg [background:var(--gradient-primary)]">
          <FontAwesomeIcon icon={faWind} className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">PowerTech</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === ROUTES.DASHBOARD
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary-dark font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span className={isActive ? "text-primary" : "text-gray-400"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 px-3 py-4">
        <p className="px-3 text-xs text-gray-400">
          UPX III - PowerTech
        </p>
      </div>
    </aside>
  );
}
