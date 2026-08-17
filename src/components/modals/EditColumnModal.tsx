import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { BoardColumn } from '@/types';


interface EditColumnModalProps {
    column: BoardColumn | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdateColumn: (columnId: number, name: string) => void;
}

export const EditColumnModal: React.FC<EditColumnModalProps> = ({
    column,
    open,
    onOpenChange,
    onUpdateColumn,
}) => {
    const [columnName, setColumnName] = useState(column?.name ?? '');

    // Keep internal input in sync whenever column or modal open state changes
    useEffect(() => {
        if (column) {
            setColumnName(column.name);
        }
    }, [column, open]);

    const handleSaveColumnName = (e: React.FormEvent) => {
        e.preventDefault();
        if (column && columnName.trim() && columnName.trim() !== column.name) {
            onUpdateColumn(column.id, columnName.trim());
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold text-slate-100">
                        Edit Column
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSaveColumnName} className="space-y-4 pt-2">
                    <Input
                        value={columnName}
                        onChange={(e) => setColumnName(e.target.value)}
                        placeholder="Column Name"
                        className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-blue-500"
                        autoFocus
                    />

                    <DialogFooter className="gap-2 bg-transparent border-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!columnName.trim()}
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
