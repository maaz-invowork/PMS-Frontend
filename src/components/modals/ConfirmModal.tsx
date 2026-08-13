import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onOpenChange,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  onConfirm,
  loading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-sm bg-slate-900 border-slate-800 text-slate-100"
      >
        <DialogHeader>
          <div className="flex items-start gap-3 mb-1">
            <div className="w-8 h-8 shrink-0 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>

            <div>
              <DialogTitle className="text-base font-semibold text-slate-100 h-8 flex items-center">
                {title}
              </DialogTitle>

              <DialogDescription className="text-sm text-slate-400 mt-1 leading-relaxed">
                {message}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={loading}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md shadow-rose-600/20"
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
