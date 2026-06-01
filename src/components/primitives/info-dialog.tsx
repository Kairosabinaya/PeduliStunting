"use client";

import { useState } from "react";
import { Info } from "lucide-react";

import { Modal } from "@/components/primitives/modal";
import { cn } from "@/lib/cn";

export interface InfoDialogProps {
  readonly title: string;
  readonly description: string;
  readonly className?: string;
}

export function InfoDialog({ title, description, className }: InfoDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title={description}
        aria-label={`Info: ${title}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all hover:scale-110 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
          className,
        )}
      >
        <Info size={16} aria-hidden />
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        description={description}
      />
    </>
  );
}
