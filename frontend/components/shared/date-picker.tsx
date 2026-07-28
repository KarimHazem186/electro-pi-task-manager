"use client";

import { CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePicker({
  value,
  onChange,
  placeholder,
}: {
  value?: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}) {
  const t = useTranslations("datePicker");
  const date = value ? new Date(value) : undefined;
  const resolvedPlaceholder = placeholder ?? t("placeholder");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4" aria-hidden />
          {date ? format(date, "MMM d, yyyy") : resolvedPlaceholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-xl p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(next) => onChange(next ? next.toISOString() : null)}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
