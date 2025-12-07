/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    date?: string;
    setDate: (date: string) => void;
    label?: string;
    disabled?: any
  }

export default function DatePicker({date, setDate, label, disabled}: DatePickerProps) {

    const handleDateChange = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            const formattedDate = format(selectedDate, "yyyy-MM-dd");
            setDate(formattedDate);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    disabled={disabled}
                    variant={"outline"}
                    size="input"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "dark:text-muted-foreground",
                    )}
                >
                    <CalendarIcon />
                    {date ? format(parseISO(date), "PPP") : <span>{label}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date ? parseISO(date) : undefined}
                    onSelect={handleDateChange}
                />
            </PopoverContent>
        </Popover>
    );
}
