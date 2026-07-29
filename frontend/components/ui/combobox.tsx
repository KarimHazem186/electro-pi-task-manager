"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ComboboxOption = {
  /** Unique value used by the consumer (often a UUID or enum). */
  value: string;
  /** Visible label rendered in the list and the trigger. */
  label: React.ReactNode;
  /** Optional explicit string used by the built-in search; falls back to `label`. */
  searchValue?: string;
  /** Disable the option so it cannot be picked. */
  disabled?: boolean;
  /** Optional secondary line shown under the label. */
  description?: React.ReactNode;
};

type ComboboxProps = {
  /** Controlled value. Pass `null`/`undefined` to render the placeholder. */
  value?: string | null;
  /** Fired with the new value, or `null` when the same option is picked again. */
  onValueChange: (value: string | null) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  /** Show a "clear" item at the bottom of the list. */
  clearable?: boolean;
  clearLabel?: string;
  /** ID used for the search input (helps with label association). */
  id?: string;
  /** Forwarded to the trigger button for accessibility (label, etc). */
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

/**
 * Searchable select built on top of Popover + Command.
 *
 * The trigger behaves like a Select trigger but opens a Command list with a
 * search input. Works as a drop-in for `react-hook-form` FormField
 * (`<FormControl><Combobox ... /></FormControl>`) since the value/onValueChange
 * contract matches the previous Radix `Select` API.
 */
export function Combobox({
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
  className,
  triggerClassName,
  clearable = false,
  clearLabel,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const tCombobox = useTranslations("combobox");
  const tSearch = useTranslations("search");
  const resolvedSearchPlaceholder = searchPlaceholder ?? tSearch("placeholder");
  const resolvedEmptyText = emptyText ?? tCombobox("emptyText");
  const resolvedClearLabel = clearLabel ?? tCombobox("clearLabel");

  // Normalise "no selection" so lookups stay simple.
  const safeValue = value ?? "";
  const selected = options.find((opt) => opt.value === safeValue);
  const displayLabel = selected?.label ?? placeholder ?? tCombobox("selectPlaceholder");

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-between gap-2 rounded-md border-input bg-transparent px-3 text-sm font-normal shadow-sm",
            "data-[placeholder]:text-muted-foreground",
            "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName,
          )}
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-start",
              !selected && "text-muted-foreground",
            )}
          >
            {displayLabel}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {clearable && selected ? (
              <span
                role="button"
                tabIndex={-1}
                aria-label={resolvedClearLabel}
                className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onValueChange(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onValueChange(null);
                  }
                }}
              >
                <X className="h-3.5 w-3.5" />
              </span>
            ) : null}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-[var(--radix-popover-trigger-width)] p-0",
          className,
        )}
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(event) => {
          // Prevent stealing focus from the trigger so the input is focused
          // via Command's own behaviour.
          event.preventDefault();
        }}
        onWheel={(e) => {
          // Allow wheel events to propagate to the scrollable content
          e.stopPropagation();
        }}
      >
        <Command shouldFilter={false} loop>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={resolvedSearchPlaceholder}
          />
          <CommandList>
            <CommandEmpty>{resolvedEmptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const haystack = (
                  option.searchValue ??
                  (typeof option.label === "string" ? option.label : "")
                ).toLowerCase();
                const matches =
                  query.trim() === "" || haystack.includes(query.toLowerCase());
                if (!matches) return null;
                const isSelected = option.value === safeValue;
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    onSelect={(current) => {
                      // Re-selecting the same value clears the selection so
                      // the form can be reset to "no value" without needing
                      // a dedicated clear button on small lists.
                      onValueChange(current === safeValue ? null : current);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {option.label}
                      {option.description ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {clearable ? (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value="__clear__"
                    onSelect={() => {
                      onValueChange(null);
                      setOpen(false);
                    }}
                    className="justify-center text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                    {resolvedClearLabel}
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
