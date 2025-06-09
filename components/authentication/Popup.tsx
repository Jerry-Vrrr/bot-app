// components/ui/Popup.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface PopupProps {
  title: string;
  triggerLabel?: string; // optional trigger label if you want a button to open manually
  children: React.ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  defaultOpen?: boolean;
}

const Popup: React.FC<PopupProps> = ({
  title,
  triggerLabel,
  children,
  onSubmit,
  submitLabel = "Submit",
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerLabel && (
        <DialogTrigger asChild>
          <Button>{triggerLabel}</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">{children}</div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={onSubmit}>{submitLabel}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Popup;
