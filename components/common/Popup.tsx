import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface PopupProps {
  title: string;
  triggerLabel: string;
  children: React.ReactNode;
  onSubmit?: () => Promise<boolean | undefined> | void;
  submitLabel?: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Popup: React.FC<PopupProps> = ({
  title,
  triggerLabel,
  children,
  onSubmit,
  open,
  setOpen,
  submitLabel = 'Submit',
}) => {

  const handleButtonClick = async () => {
    if (onSubmit) {
      await onSubmit(); 
    }
  };
  
  return (
    <Dialog   open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-white ">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">{children}</div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          {/* Remove DialogClose here to control closing manually */}
          <Button onClick={() => handleButtonClick()}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Popup;