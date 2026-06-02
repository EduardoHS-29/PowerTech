"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  height?: "sm" | "md" | "lg" | "full";
  disableClose?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

const heightClasses = {
  sm: "max-h-64",
  md: "max-h-96",
  lg: "max-h-[70vh]",
  full: "max-h-[90vh]",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  height,
  disableClose = false,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || disableClose) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose, disableClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (!disableClose && e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "flex w-full flex-col rounded-xl bg-white shadow-xl",
          sizeClasses[size]
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {!disableClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
            </button>
          )}
        </div>
        <div
          className={cn(
            "overflow-y-auto px-6 py-5",
            height && heightClasses[height]
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
