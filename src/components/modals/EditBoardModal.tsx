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
import { Board } from '@/types';


interface EditBoardModalProps {
    board: Board | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdateBoard: (name: string) => void;
}

export const EditBoardModal: React.FC<EditBoardModalProps> = ({
    board,
    open,
    onOpenChange,
    onUpdateBoard,
}) => {
    const [boardName, setBoardName] = useState(board?.name ?? '');

    // Keep internal input in sync whenever column or modal open state changes
    useEffect(() => {
        if (board) {
            setBoardName(board.name);
        }
    }, [board, open]);

    const handleSaveBoardName = (e: React.FormEvent) => {
        e.preventDefault();
        if (board && boardName.trim() && boardName.trim() !== board.name) {
            onUpdateBoard(boardName.trim());
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold text-slate-100">
                        Edit Board
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSaveBoardName} className="space-y-4 pt-2">
                    <Input
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        placeholder="Board Name"
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
                            disabled={!boardName.trim()}
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
