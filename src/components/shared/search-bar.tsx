"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faSpinner } from "@fortawesome/free-solid-svg-icons";

interface SearchBarProps {
    placeholder?: string;
    defaultValue?: string;
}

export function SearchBar({
    placeholder = "Buscar...",
    defaultValue = "",
}: SearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [value, setValue] = useState(defaultValue);

    function handleSearch(term: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        if (term) {
            params.set("q", term);
        } else {
            params.delete("q");
        }
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    }

    return (
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {isPending ? (
                    <FontAwesomeIcon icon={faSpinner} spin className="h-4 w-4 text-gray-400" />
                ) : (
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4 text-gray-400" />
                )}
            </div>
            <input
                type="search"
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    handleSearch(e.target.value);
                }}
                placeholder={placeholder}
                className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
        </div>
    );
}
