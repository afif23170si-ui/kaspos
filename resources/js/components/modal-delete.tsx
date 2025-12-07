import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";
import { Trash, X } from "lucide-react";
import { toast } from "sonner";

interface modalDeleteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    url: string;
}

export function ModalDelete({ open, onOpenChange, url }: modalDeleteProps) {

    const {delete : destroy} = useForm();

    const deleteData = async (url: string) => {
        destroy(url, {
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Data berhasil dihapus.')
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Confirmation</DialogTitle>
                    <DialogDescription aria-describedby='modal-delete'>
                        Are you sure want to delete this data ?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center sm:justify-start items-center gap-2 mt-2">
                    <DialogClose asChild>
                        <Button variant="destructive">
                           <X/> Cancel
                        </Button>
                    </DialogClose>
                    <Button type="button" variant="default" onClick={() => deleteData(url)}>
                        <Trash/> Yes, Delete it
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
