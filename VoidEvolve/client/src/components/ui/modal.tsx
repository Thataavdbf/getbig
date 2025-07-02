// Fix component prop types
import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./dialog";
import { Button } from "./button";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "",
  showCloseButton = true,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className={`sm:max-w-md ${className}`}>
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
        
        {title && <DialogTitle>{title}</DialogTitle>}
        {description && <DialogDescription>{description}</DialogDescription>}
        
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default Modal;