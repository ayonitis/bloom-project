"use client";

import { useId } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/shared/Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmingLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  destructive?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  confirmingLabel = "Working…",
  cancelLabel = "Cancel",
  isConfirming = false,
  destructive = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();

  return (
    <Modal isOpen={isOpen} onClose={onCancel} titleId={titleId} className="max-w-sm">
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-3">
          {destructive && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertTriangle className="h-4.5 w-4.5" strokeWidth={2} aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <p
              id={titleId}
              className="font-[family-name:var(--font-heading)] text-base font-semibold text-bloom-text"
            >
              {title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-bloom-muted">{description}</p>
            {error && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="focus-ring rounded-full px-4 py-2.5 text-sm font-medium text-bloom-text/70 transition-colors hover:text-bloom-text disabled:pointer-events-none disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className={
              destructive
                ? "focus-ring rounded-full bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:pointer-events-none disabled:opacity-60"
                : "focus-ring rounded-full bg-bloom-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-bloom-primary-dark disabled:pointer-events-none disabled:opacity-60"
            }
          >
            {isConfirming ? confirmingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
